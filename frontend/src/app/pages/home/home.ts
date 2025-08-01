import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MovieCard } from '../../components/movie-card/movie-card';
import { MovieModal } from '../../components/movie-modal/movie-modal';
import { MovieService } from '../../services/movie-service';
import { Subject, takeUntil } from 'rxjs';
import { FullMovieDetails, SimpleMovieDetails } from '../../model/movie.model';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [MovieCard, MovieModal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  movies = signal<SimpleMovieDetails[]>([]);
  movieService = inject(MovieService);
  private destroy$ = new Subject<void>();
  loading = false;
  error = '';
  isModalVisible = false;
  selectedMovie = signal<FullMovieDetails | null>(null);
  selectedMovieId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openMovieModal(movieId: number): void {
    console.log('Opening modal for movie ID:', movieId);
    this.selectedMovieId = movieId;
    this.loadMovieById(movieId);
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedMovie.set(null);
    this.selectedMovieId = null;
  }

  loadMovies(): void {
    this.loading = true;
    this.error = '';

    this.movieService
      .getMovies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          this.movies.set(movies);
          console.log('this.movies', this.movies());
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load movies';
          this.loading = false;
          console.error('Error loading movies:', error);
        },
      });
  }

  loadMovieById(movieId: number): void {
    this.loading = true;
    this.error = '';

    // If you have a service method to get movie by ID:
    this.movieService
      .getMovieById(movieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movie) => {
          this.selectedMovie.set(movie);
          this.isModalVisible = true;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load movie details';
          this.loading = false;
          console.error('Error loading movie:', error);
        },
      });

    this.isModalVisible = true;
    this.loading = false;

    // Alternative: If you don't have the service method yet, use sample data:
    // setTimeout(() => {
    //   this.selectedMovie = this.sampleMovie;
    //   this.isModalVisible = true;
    //   this.loading = false;
    // }, 100);
  }

  deleteMovieById(movieId: number): void {
    this.loading = true;
    this.error = '';

    this.movieService
      .deleteMovieById(movieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movie) => {
          console.log('deleted');
          this.loading = false;
          this.movies.update((current) =>
            current.filter((movie) => movie.id !== movieId)
          );
          this.router.navigate([this.router.url]);
        },
        error: (error) => {
          this.error = 'Failed to load movie details';
          this.loading = false;
          console.error('Error loading movie:', error);
        },
      });

    this.loading = false;
  }

  updateMovieById(movieId: number): void {
    this.router.navigate(['/edit', movieId]);
  }
}
