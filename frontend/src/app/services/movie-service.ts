import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FullMovieDetails, SimpleMovieDetails } from '../model/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1';
  movies = {};

  constructor(private http: HttpClient) {}

  getMovies(): Observable<SimpleMovieDetails[]> {
    return this.http.get<SimpleMovieDetails[]>(`${this.apiUrl}/movies`).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getMovieById(id: number): Observable<FullMovieDetails> {
    return this.http.get<FullMovieDetails>(`${this.apiUrl}/movies/${id}`).pipe(
      map((response: any) => {
        return response
      })
    )
  }
}
