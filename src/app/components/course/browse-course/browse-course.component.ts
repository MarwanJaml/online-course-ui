import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Course } from '../../../models/course';
import { MOCK_COURSES } from '../../../mock-data/mock-courses';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-browse-course',
  imports: [RouterModule, CommonModule],
  templateUrl: './browse-course.component.html',
  styleUrl: './browse-course.component.css'
})
export class BrowseCourseComponent implements OnInit, OnChanges {
  constructor(private courseService: CourseService) {}
  
  courses: Course[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  @Input() categoryId: number = 0;

  ngOnInit(): void {
    // Load courses when component initializes if categoryId is provided
    if (this.categoryId > 0) {
      this.getCourses(this.categoryId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only load courses if categoryId actually changed and is valid
    if (changes['categoryId'] && this.categoryId > 0) {
      this.getCourses(this.categoryId);
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getCourses(categoryId: number) {
    if (categoryId <= 0) {
      this.courses = [];
      return;
    }

    this.loading = true;
    this.error = null;

    this.courseService.getCoursesByCategoryId(categoryId).subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
        
        // Optional: Fallback to mock data
        // this.courses = MOCK_COURSES.filter(f => f.categoryId === categoryId);
      }
    });
  }

  retry(): void {
    if (this.categoryId > 0) {
      this.getCourses(this.categoryId);
    }
  }
}