import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MovieService } from '../../services/movie-service';
import { Route, Router } from '@angular/router';

interface UploadedFile {
  file: File;
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

@Component({
  selector: 'app-upload',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
})
export class Upload implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uploadSection') uploadSection!: ElementRef;
  @ViewChild('uploadedFiles') uploadedFiles!: ElementRef;
  @ViewChild('filesList') filesList!: ElementRef;

  movieForm!: FormGroup;
  uploadedFilesList: UploadedFile[] = [];
  isDragOver = false;
  videoPreviewUrl: string | null = null;
  currentVideoFile: File | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.setupEventListeners();
  }

  ngOnDestroy() {
    // Clean up video preview URL to prevent memory leaks
    this.clearVideoPreview();
  }

  private initializeForm() {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      releaseYear: ['', [Validators.min(1900), Validators.max(2030)]],
      duration: ['', Validators.min(1)],
      director: [''],
      description: [''],
      posterUrl: [''],
    });
  }

  private setupEventListeners() {
    // Setup drag and drop listeners after view init
    setTimeout(() => {
      if (this.uploadSection) {
        const uploadSectionEl = this.uploadSection.nativeElement;
        uploadSectionEl.addEventListener(
          'dragover',
          this.handleDragOver.bind(this)
        );
        uploadSectionEl.addEventListener(
          'dragleave',
          this.handleDragLeave.bind(this)
        );
        uploadSectionEl.addEventListener('drop', this.handleDrop.bind(this));
      }
    });
  }

  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  private handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
    const uploadSection = this.uploadSection.nativeElement;
    uploadSection.classList.add('dragover');
  }

  private handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const uploadSection = this.uploadSection.nativeElement;
    uploadSection.classList.remove('dragover');
  }

  private handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const uploadSection = this.uploadSection.nativeElement;
    uploadSection.classList.remove('dragover');

    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]) {
    const videoFiles = files.filter((file) => file.type.startsWith('video/'));
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB in bytes

    if (videoFiles.length === 0) {
      alert('Please select a valid video file.');
      return;
    }

    // Only take the first file and clear any existing files
    const file = videoFiles[0];

    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is 5GB.`);
      return;
    }

    // Clear existing files
    this.clearUploadedFiles();

    const uploadedFile: UploadedFile = {
      file,
      id: this.generateId(),
      name: file.name,
      size: this.formatFileSize(file.size),
      progress: 0,
      status: 'uploading',
    };

    this.uploadedFilesList.push(uploadedFile);
    this.currentVideoFile = file;
    this.showUploadedFiles();
    this.renderFilesList();
    this.simulateUpload(uploadedFile);
  }

  private simulateUpload(uploadedFile: UploadedFile) {
    const interval = setInterval(() => {
      uploadedFile.progress += Math.random() * 15;
      if (uploadedFile.progress >= 100) {
        uploadedFile.progress = 100;
        uploadedFile.status = 'completed';
        // Create video preview URL when upload is complete
        this.createVideoPreview(uploadedFile.file);
        // Hide the upload progress since we're showing the video preview now
        if (this.uploadedFiles) {
          this.uploadedFiles.nativeElement.style.display = 'none';
        }
        clearInterval(interval);
      }
      this.updateFileProgress(uploadedFile);
    }, 200);
  }

  private showUploadedFiles() {
    if (this.uploadedFiles) {
      this.uploadedFiles.nativeElement.style.display = 'block';
    }
  }

  private renderFilesList() {
    if (!this.filesList) return;

    const filesListHtml = this.uploadedFilesList
      .map(
        (file) => `
      <div class="file-item" data-id="${file.id}">
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${file.size}</div>
        </div>
        <div class="file-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${file.progress}%"></div>
          </div>
          <div class="progress-text">${Math.round(file.progress)}%</div>
        </div>
        <button class="remove-file-btn" onclick="window.uploadComponent.removeFile('${
          file.id
        }')" 
                ${file.status === 'uploading' ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `
      )
      .join('');

    this.filesList.nativeElement.innerHTML = filesListHtml;

    // Make component accessible globally for button callbacks
    (window as any).uploadComponent = this;
  }

  private updateFileProgress(uploadedFile: UploadedFile) {
    const fileElement = this.filesList?.nativeElement.querySelector(
      `[data-id="${uploadedFile.id}"]`
    );
    if (fileElement) {
      const progressFill = fileElement.querySelector(
        '.progress-fill'
      ) as HTMLElement;
      const progressText = fileElement.querySelector(
        '.progress-text'
      ) as HTMLElement;
      const removeBtn = fileElement.querySelector(
        '.remove-file-btn'
      ) as HTMLButtonElement;

      if (progressFill) progressFill.style.width = `${uploadedFile.progress}%`;
      if (progressText)
        progressText.textContent = `${Math.round(uploadedFile.progress)}%`;
      if (removeBtn && uploadedFile.status === 'completed') {
        removeBtn.disabled = false;
      }
    }
  }

  removeFile(fileId: string) {
    this.uploadedFilesList = this.uploadedFilesList.filter(
      (file) => file.id !== fileId
    );
    this.renderFilesList();

    // Clear video preview
    this.clearVideoPreview();
    this.currentVideoFile = null;

    if (this.uploadedFilesList.length === 0) {
      if (this.uploadedFiles) {
        this.uploadedFiles.nativeElement.style.display = 'none';
      }
    }
  }

  private createVideoPreview(file: File) {
    // Clean up previous preview URL
    this.clearVideoPreview();

    // Create new preview URL
    this.videoPreviewUrl = URL.createObjectURL(file);
  }

  private clearVideoPreview() {
    if (this.videoPreviewUrl) {
      URL.revokeObjectURL(this.videoPreviewUrl);
      this.videoPreviewUrl = null;
    }
  }

  private clearUploadedFiles() {
    this.uploadedFilesList = [];
    this.clearVideoPreview();
    this.currentVideoFile = null;
    if (this.uploadedFiles) {
      this.uploadedFiles.nativeElement.style.display = 'none';
    }
  }

  onSubmit() {
    if (this.movieForm.valid && this.currentVideoFile && !this.isSubmitting) {
      this.isSubmitting = true;

      // Create FormData object for file upload
      const formData = new FormData();

      // Append form fields (using snake_case to match Django model fields)
      formData.append('title', this.movieForm.get('title')?.value || '');
      formData.append(
        'releaseYear',
        this.movieForm.get('releaseYear')?.value?.toString() || ''
      );
      formData.append(
        'duration',
        this.movieForm.get('duration')?.value?.toString() || ''
      );
      formData.append('director', this.movieForm.get('director')?.value || '');
      formData.append(
        'description',
        this.movieForm.get('description')?.value || ''
      );
      formData.append(
        'posterUrl',
        this.movieForm.get('posterUrl')?.value || ''
      );

      // Append the video file
      formData.append(
        'videoFile',
        this.currentVideoFile,
        this.currentVideoFile.name
      );

      // Submit to service
      this.movieService.uploadMovie(formData).subscribe({
        next: (response) => {
          console.log('Movie uploaded successfully:', response);
          alert(
            `Movie "${response.movie?.title || 'Unknown'}" added successfully!`
          );
          this.clearForm();
        },
        error: (error) => {
          console.error('Error uploading movie:', error);
          let errorMessage = 'Error uploading movie. ';

          if (error.error?.error) {
            errorMessage += error.error.error;
          } else if (error.error?.errors) {
            errorMessage += 'Please check your form data.';
          } else {
            errorMessage += 'Please try again.';
          }

          alert(errorMessage);
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    } else {
      let errorMessage = 'Please fix the following issues:\n';

      if (!this.movieForm.valid) {
        errorMessage += '- Fill in all required fields\n';
      }

      if (!this.currentVideoFile) {
        errorMessage += '- Upload a video file\n';
      }

      alert(errorMessage);
    }

    this.router.navigate(['/']);
  }

  clearForm() {
    this.movieForm.reset();
    this.clearUploadedFiles();

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  replaceVideo() {
    this.triggerFileInput();
  }

  removeCurrentVideo() {
    this.clearUploadedFiles();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
