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
  constructor(private courseService: CourseService) { }

  courses: Course[] = [];
  loading: boolean = false;
  error: string | null = null;

  @Input() categoryId: number = 0;

  ngOnInit(): void {
    console.log('BrowseCourseComponent ngOnInit, categoryId:', this.categoryId);
    this.loadCourses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('BrowseCourseComponent ngOnChanges:', changes);
    if (changes['categoryId']) {
      this.loadCourses();
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  loadCourses(): void {
    if (this.categoryId > 0) {
      console.log('Loading courses for specific category:', this.categoryId);
      this.getCoursesByCategory(this.categoryId);
    } else {
      console.log('Loading ALL courses (no category specified)');
      this.getAllCourses();
    }
  }

  // Load courses for specific category
  getCoursesByCategory(categoryId: number): void {
    console.log(' Making HTTP request for categoryId:', categoryId);
    this.loading = true;
    this.error = null;

    this.courseService.getCoursesByCategoryId(categoryId).subscribe({
      next: (data) => {
        console.log(' Category courses loaded:', data);
        this.courses = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.log(' Error loading category courses:', error);
        this.error = 'Failed to load courses for this category.';
        this.loading = false;
        this.courses = [];
      }
    });
  }

  // Load ALL courses
  getAllCourses(): void {
    console.log(' Making HTTP request for ALL courses');
    this.loading = true;
    this.error = null;

    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        console.log(' ALL courses loaded:', data);
        console.log('Total courses count:', data?.length || 0);
        this.courses = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.log(' Error loading all courses:', error);
        console.error('Full error:', error);
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
        this.courses = [];
      }
    });
  }

  retry(): void {
    console.log('Retry clicked');
    this.loadCourses();
  }
}