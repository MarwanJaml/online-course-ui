import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CourseCategory } from '../models/category';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class CategoryService {
    private baseUrl = `${environment.apiUrl}/CourseCategory`;//this is the controller base address
    constructor(private http : HttpClient) { }

    getCategories(): Observable<CourseCategory[]> {
        // This method will call the API endpoint to get the list of categories     
        return this.http.get<CourseCategory[]>(`${this.baseUrl}`);
    }
    
}