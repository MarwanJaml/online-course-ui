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
  // Fix: Remove /api from baseUrl since environment.apiUrl already includes it
  private baseUrl = `${environment.apiUrl}/UserProfile`;

  constructor(private http: HttpClient) { }

  getUserProfile(id: number): Observable<UserModel> {
    if (!id || isNaN(id)) {
      return throwError(() => new Error('Valid numeric user ID required'));
    }

    console.log(`🔍 Calling: ${this.baseUrl}/${id}`); // Debug log

    return this.http.get<UserModel>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError<UserModel>('getUserProfile'))
    );
  }

  // Alternative method: Create user if doesn't exist
  getUserProfileOrCreate(id: number): Observable<UserModel> {
    if (!id || isNaN(id)) {
      return throwError(() => new Error('Valid numeric user ID required'));
    }

    return this.http.get<UserModel>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.log(`User ${id} not found, creating new user...`);
          return this.createUserProfile(id);
        }
        return this.handleError<UserModel>('getUserProfile')(error);
      })
    );
  }

  // Method to create new user profile
  private createUserProfile(userId: number): Observable<UserModel> {
    // You'll need to implement this endpoint in your backend
    const newUser = {
      userId: userId,
      // Add other required fields based on current user claims
    };

    return this.http.post<UserModel>(`${this.baseUrl}/create`, newUser).pipe(
      catchError(this.handleError<UserModel>('createUserProfile'))
    );
  }

  updateProfile(formData: FormData): Observable<UserModel> {
    const userId = Number(formData.get('userId'));
    if (isNaN(userId)) {
      return throwError(() => new Error('User ID must be a number'));
    }

    console.log(`🔍 Updating profile for user: ${userId}`); // Debug log

    return this.http.post<UserModel>(`${this.baseUrl}/updateProfile`, formData).pipe(
      catchError(this.handleError<UserModel>('updateProfile'))
    );
  }

  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`❌ ${operation} failed:`, error);

      // More detailed error logging
      if (error.status === 404) {
        console.error(`User not found in database`);
      } else if (error.status === 401) {
        console.error(`Unauthorized - check authentication`);
      } else if (error.status === 403) {
        console.error(`Forbidden - check user permissions`);
      }

      const errorMessage = error.error?.message || error.message || 'Request failed';
      return throwError(() => new Error(errorMessage));
    };
  }
}