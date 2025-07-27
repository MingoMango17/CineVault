import { Component } from '@angular/core';
import { MovieCard } from '../../components/movie-card/movie-card';
import { MovieModal } from '../../components/movie-modal/movie-modal';

@Component({
  selector: 'app-home',
  imports: [MovieCard, MovieModal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  movies = [
    {
      movieTitle: 'City Lights',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Space Odyssey',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Dark Woods',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Laugh Out Loud',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Love Story',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Mountain Quest',
      movieYear: '2023',
      moviePoster:
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Night Chase',
      movieYear: '2023',
      moviePoster:
        'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Magic Realm',
      movieYear: '2023',
      moviePoster:
        'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Battlefield',
      movieYear: '2023',
      moviePoster:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Hidden Secrets',
      movieYear: '2023',
      moviePoster:
        'https://images.unsplash.com/photo-1608467493040-0288ab1b4f93?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Wild West',
      movieYear: '2023',
      moviePoster:
        'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Ocean Depths',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Cartoon Adventures',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'City Underground',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1478720568477-b0ac8b46d71b?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Life Story',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Championship',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1489599843821-e4a7f3b35d9a?w=200&h=112&fit=crop',
    },
    {
      movieTitle: 'Family Time',
      movieYear: '2024',
      moviePoster:
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=112&fit=crop',
    },
  ];
}
