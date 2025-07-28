import { DatePipe } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  input,
  output,
  ViewChild,
  signal,
} from '@angular/core';
import { FullMovieDetails } from '../../model/movie.model';
import { VideoJsPlayerComponent } from '../video-js-player/video-js-player';
import videojs from 'video.js';

@Component({
  selector: 'app-movie-modal',
  imports: [DatePipe, VideoJsPlayerComponent],
  templateUrl: './movie-modal.html',
  styleUrl: './movie-modal.scss',
})
export class MovieModal {
  @ViewChild(VideoJsPlayerComponent) videoPlayer!: VideoJsPlayerComponent;

  isVisible = input.required<boolean>();
  movie = input.required<FullMovieDetails>();

  isPlayingVideo = signal<boolean>(false);

  @Output() closeModal = new EventEmitter<void>();
  @Output() deleteMovieRequest = new EventEmitter<number>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    // Close modal when clicking on the backdrop (not the content)
    if (event.target === event.currentTarget) {
      this.onCloseModal();
    }
  }

  // Helper methods for displaying data
  get posterImageUrl(): string {
    return (
      this.movie()?.poster_image ||
      this.movie()?.poster_url ||
      '/assets/default-movie-poster.jpg'
    );
  }

  get formattedDuration(): string {
    if (!this.movie()?.duration) return 'N/A';
    const hours = Math.floor(this.movie().duration / 60);
    const minutes = this.movie().duration % 60;
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  get releaseYear(): string {
    if (!this.movie()?.year_released) return 'N/A';
    return new Date(this.movie().year_released).getFullYear().toString();
  }

  get formattedReleaseDate(): string {
    if (!this.movie()?.year_released) return 'N/A';
    return new Date(this.movie().year_released).toLocaleDateString();
  }

  playMovie(): void {

    if (this.videoPlayer && this.movie()?.video_file) {
      try {
        if (this.isPlayingVideo()) {
          this.videoPlayer.pause();
        } else {
          this.videoPlayer.play();
        }
        this.isPlayingVideo.update(value => !value);
      } catch (error) {
        console.error('Error playing video:', error);
        // You could show a user-friendly error message here
        alert('Unable to play video. Please try again.');
      }
    } else {
      console.warn('Video player not available or no video file');
      alert('No video file available for this movie.');
    }
  }

  deleteMovie(): void {
    const movieToDelete = this.movie();
    if (movieToDelete) {
      // Show confirmation dialog
      const confirmed = confirm(
        `Are you sure you want to delete "${movieToDelete.title}"? This action cannot be undone.`
      );

      if (confirmed) {
        console.log('Deleting movie:', movieToDelete.title);
        this.deleteMovieRequest.emit(movieToDelete.id);
        this.onCloseModal();
      }
    }
  }
}
