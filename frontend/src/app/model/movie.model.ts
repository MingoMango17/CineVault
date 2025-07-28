export class SimpleMovieDetails{
  id: number;
  movieTitle: string;
  movieYear: number;
  moviePoster: string;

  constructor() {
    this.id = 1;
    this.movieTitle = '';
    this.movieYear = 0;
    this.moviePoster = '';
  }
}

export class FullMovieDetails {
  id: number;
  title: string;
  description: string;
  date_added: string;
  video_file: string | null;
  date_released: string;
  duration: number;
  director?: string | null;
  poster_url?: string | null;
  poster_image?: string | null;

  constructor() {
    this.id = 0;
    this.title = '';
    this.description = '';
    this.date_added = '';
    this.video_file = '';
    this.date_released = '';
    this.duration = 0;
    this.director = '';
    this.poster_url = '';
  }
}