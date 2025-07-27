import { Component, input } from '@angular/core';

@Component({
  selector: 'app-movie-card',
  imports: [],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {
  moviePoster = input(
    'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&h=112&fit=crop'
  );
  movieTitle = input.required();
  movieYear = input.required();
}
