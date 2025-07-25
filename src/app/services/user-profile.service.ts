import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserModel } from '../models/usermodel';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private baseUrl = `${environment.apiUrl}/UserProfile`;

  constructor(private http: HttpClient) { }

  getUserProfile(id: string): Observable<UserModel> {
    if (!id || id.trim() === '') {
      return throwError(() => new Error('Invalid user ID'));
    }
    return this.http.get<UserModel>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError<UserModel>('getUserProfile'))
    );
  }

  updateProfile(formData: FormData): Observable<UserModel> {
    const userId = formData?.get('userId')?.toString();
    if (!userId || userId.trim() === '') {
      return throwError(() => new Error('User ID is required'));
    }
    return this.http.post<UserModel>(`${this.baseUrl}/updateProfile`, formData).pipe(
      catchError(this.handleError<UserModel>('updateProfile'))
    );
  }

  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      const errorMessage = error.error?.message || error.message || 'An unexpected error occurred';
      return throwError(() => new Error(errorMessage));
    };
  }
}