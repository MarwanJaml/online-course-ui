import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VideoRequest } from '../models/video-request';



@Injectable({
  providedIn: 'root'
})
export class VideoRequestService {

  private apiUrl = `${environment.apiUrl}/videorequest`;

  constructor(private http: HttpClient) { }

  // Get all video requests
  getAll(): Observable<VideoRequest[]> {
    return this.http.get<VideoRequest[]>(this.apiUrl);
  }

  // Get video request by ID
  getById(id: string): Observable<VideoRequest> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<VideoRequest>(url);
  }

  // Get video requests by User ID
  getByUserId(userId: string): Observable<VideoRequest[]> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.get<VideoRequest[]>(url);
  }

  // Create a new video request
  create(videoRequest: VideoRequest): Observable<VideoRequest> {
    return this.http.post<VideoRequest>(this.apiUrl, videoRequest);
  }

  // Update an existing video request
  update(id: string, videoRequest: VideoRequest): Observable<VideoRequest> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<VideoRequest>(url, videoRequest);
  }

  // Delete a video request
  delete(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}