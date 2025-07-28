// Enhanced MovieService with upload method
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FullMovieDetails, SimpleMovieDetails } from '../model/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1';

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
        return response;
      })
    );
  }

  uploadMovie(formData: FormData): Observable<any> {
    const accessToken = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`, // Use access token for auth
      // 'Content-Type': 'multipart/form-data'
      'Accept': 'application/json',
    });
    return this.http.post(`${this.apiUrl}/movies/`, formData, { headers }).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  uploadMovieWithProgress(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/movies/`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
