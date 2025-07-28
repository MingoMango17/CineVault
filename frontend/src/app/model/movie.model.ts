export class SimpleMovieDetails{
  id: number;
  title: string;
  year_released: number;
  thumbnail: string;

  constructor() {
    this.id = 1;
    this.title = '';
    this.year_released = 0;
    this.thumbnail = '';
  }
}

export class FullMovieDetails {
  id: number;
  title: string;
  description: string;
  date_added: string;
  video_file: string;
  year_released: string;
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
    this.year_released = '';
    this.duration = 0;
    this.director = '';
    this.poster_url = '';
  }
}