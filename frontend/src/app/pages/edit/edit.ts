// edit.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie-service';
import { Subject, takeUntil } from 'rxjs';
import { FullMovieDetails } from '../../model/movie.model';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
})
export class Edit implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('currentVideo') currentVideo!: ElementRef<HTMLVideoElement>;

  movieForm: FormGroup;
  movieId: number = 0;
  currentMovie: FullMovieDetails | null = null;
  showUploadSection = false;
  isDragOver = false;
  currentVideoFile: File | null = null;
  newVideoFile: File | null = null;
  newVideoPreviewUrl: string | null = null;
  isLoading = signal<boolean>(false);
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private movieService: MovieService
  ) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      releaseYear: ['', [Validators.min(1900), Validators.max(2030)]],
      duration: ['', Validators.min(1)],
      director: [''],
      description: [''],
      posterUrl: [''],
    });
  }

  ngOnInit() {
    this.movieId = Number(this.route.snapshot.paramMap.get('id')) || 0;

    this.route.params.subscribe((params) => {
      this.movieId = params['id'];
      this.loadMovie();
    });
  }

  loadMovie() {
    this.isLoading.set(true);
    this.movieService
      .getMovieById(this.movieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (movie) => {
          this.currentMovie = movie;

          if (this.currentMovie) {
            this.movieForm.patchValue({
              title: this.currentMovie.title,
              releaseYear: this.currentMovie.year_released,
              duration: this.currentMovie.duration,
              director: this.currentMovie.director,
              description: this.currentMovie.description,
            });

            try {
              if (movie.video_file) {
                this.currentVideoFile = await this.urlToFile(
                  movie.video_file,
                  movie?.video_file?.split('/').pop() || 'video.mp4'
                );
                console.log(
                  'Current video file loaded:',
                  this.currentVideoFile.name
                );
              }
            } catch (error) {
              console.error('Error loading current video file:', error);
              this.error =
                'Error loading current video file. You may need to upload a new video.';
            }
          }

          this.isLoading.set(false);
        },
        error: (error) => {
          this.error = 'Failed to load movie details';
          this.isLoading.set(false);
          console.error('Error loading movie:', error);
        },
      });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  showUpload() {
    this.showUploadSection = true;
  }

  hideUpload() {
    this.showUploadSection = false;
  }

  clearNewVideo() {
    this.newVideoFile = null;
    if (this.newVideoPreviewUrl) {
      URL.revokeObjectURL(this.newVideoPreviewUrl);
      this.newVideoPreviewUrl = null;
    }
  }

  previewVideo() {
    if (this.currentVideo?.nativeElement) {
      const video = this.currentVideo.nativeElement;
      video.currentTime = 0;
      video.play();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileUpload(input.files[0]);
    }
  }

  handleFileUpload(file: File) {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 5 * 1024 * 1024 * 1024) {
      // 5GB limit
      alert('File size must be less than 5GB');
      return;
    }

    // Clear previous preview URL if it exists
    if (this.newVideoPreviewUrl) {
      URL.revokeObjectURL(this.newVideoPreviewUrl);
    }

    this.newVideoFile = file;
    this.newVideoPreviewUrl = URL.createObjectURL(file);

    // Hide upload section after successful file selection
    this.hideUpload();

    // Force video element to load the new source
    setTimeout(() => {
      if (this.currentVideo?.nativeElement) {
        this.currentVideo.nativeElement.load();
      }
    }, 100);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        this.handleFileUpload(file);
      }
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSubmit() {
    if (this.movieForm.valid && this.currentMovie) {
      const formData = new FormData();

      // Append form fields using the exact field names that match Django model
      formData.append('title', this.movieForm.get('title')?.value || '');

      const yearValue = this.movieForm.get('releaseYear')?.value;
      if (yearValue) {
        formData.append('year_released', yearValue.toString());
      }

      const durationValue = this.movieForm.get('duration')?.value;
      if (durationValue) {
        formData.append('duration', durationValue.toString());
      }

      formData.append('director', this.movieForm.get('director')?.value || '');
      formData.append(
        'description',
        this.movieForm.get('description')?.value || ''
      );
      formData.append(
        'poster_url',
        this.movieForm.get('posterUrl')?.value || ''
      );

      if (this.newVideoFile) {
        formData.append(
          'video_file',
          this.newVideoFile,
          this.newVideoFile.name
        );
      } else if (this.currentVideoFile) {
        formData.append(
          'video_file',
          this.currentVideoFile,
          this.currentVideoFile.name
        );
      } else {
        this.error = 'No video file available. Please select a video file.';
        return;
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(key, value);
        }
      }

      this.isLoading.set(true);
      this.error = '';

      this.movieService
        .updateMovieById(this.movieId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading.set(false);
            console.log('Update successful:', response);
            alert('Movie updated successfully!');
            this.router.navigate(['/movies']);
          },
          error: (error) => {
            this.isLoading.set(false);
            console.error('Update error:', error);

            // Handle specific error types
            if (error.status === 400) {
              this.error = 'Invalid data provided. Please check your inputs.';
              if (error.error?.errors) {
                console.error('Validation errors:', error.error.errors);
              }
            } else if (error.status === 401) {
              this.error = 'You are not authorized to update this movie.';
            } else if (error.status === 413) {
              this.error =
                'File too large. Please select a smaller video file.';
            } else {
              this.error =
                error.error?.message ||
                'Failed to update movie. Please try again.';
            }
          },
        });
    } else {
      this.error = 'Please fill in all required fields correctly.';

      Object.keys(this.movieForm.controls).forEach((key) => {
        this.movieForm.get(key)?.markAsTouched();
      });
    }
  }

  cancelEdit() {
    if (
      confirm(
        'Are you sure you want to cancel? Any unsaved changes will be lost.'
      )
    ) {
      this.router.navigate(['/movies']);
    }
  }

  // deleteMovie() {
  //   if (
  //     confirm(
  //       'Are you sure you want to delete this movie? This action cannot be undone.'
  //     )
  //   ) {
  //     console.log('Deleting movie with ID:', this.movieId);

  //     alert('Movie deleted successfully!');
  //     this.router.navigate(['/movies']);
  //   }
  // }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up video preview URLs to prevent memory leaks
    if (this.newVideoPreviewUrl) {
      URL.revokeObjectURL(this.newVideoPreviewUrl);
    }
  }

  getCurrentVideoUrl(): string {
    if (this.newVideoPreviewUrl) {
      return this.newVideoPreviewUrl;
    }
    return this.currentMovie?.video_file || '';
  }

  getCurrentFileName(): string {
    if (this.newVideoFile) {
      return this.newVideoFile.name;
    }
    return this.currentMovie?.video_file?.split('/').pop() || 'Unknown';
  }

  getCurrentFileSize(): string {
    if (this.newVideoFile) {
      return this.formatFileSize(this.newVideoFile.size);
    }
    return 'Unknown size';
  }

  hasNewVideo(): boolean {
    return this.newVideoFile !== null;
  }

  async urlToFile(
    url: string,
    filename: string,
    mimeType?: string
  ): Promise<File> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      const finalMimeType = mimeType || blob.type || 'video/mp4';

      const file = new File([blob], filename, {
        type: finalMimeType,
        lastModified: Date.now(),
      });

      return file;
    } catch (error) {
      console.error('Error converting URL to File:', error);
      throw error;
    }
  }
}
