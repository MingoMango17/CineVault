import { DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, input, output } from '@angular/core';
import { FullMovieDetails } from '../../model/movie.model';

@Component({
  selector: 'app-movie-modal',
  imports: [DatePipe],
  templateUrl: './movie-modal.html',
  styleUrl: './movie-modal.scss',
})
export class MovieModal {
  isVisible = input.required<boolean>();
  movie = input.required<FullMovieDetails>();
  @Output() closeModal = new EventEmitter<void>();

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
    if (!this.movie()?.date_released) return 'N/A';
    return new Date(this.movie().date_released).getFullYear().toString();
  }

  get formattedReleaseDate(): string {
    if (!this.movie()?.date_released) return 'N/A';
    return new Date(this.movie().date_released).toLocaleDateString();
  }
  playMovie(): void {
    console.log('Play movie:', this.movie()?.title);
    // Implement play functionality
  }

  addToList(): void {
    console.log('Add to list:', this.movie()?.title);
    // Implement add to list functionality
  }

  likeMovie(): void {
    console.log('Like movie:', this.movie()?.title);
    // Implement like functionality
  }

  shareMovie(): void {
    console.log('Share movie:', this.movie()?.title);
    // Implement share functionality
  }
}
