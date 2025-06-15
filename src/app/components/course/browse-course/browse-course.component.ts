import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Course } from '../../../models/course';
import { MOCK_COURSES } from '../../../mock-data/mock-courses';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-browse-course',
  imports: [RouterModule],
  templateUrl: './browse-course.component.html',
  styleUrl: './browse-course.component.css'
})
export class BrowseCourseComponent implements OnInit, OnChanges{

  courses : Course[] = [];
  @Input() categoryId: number = 0;
  constructor() {
    this.courses =MOCK_COURSES;
  }

  processCourses(){
    this.GetCoursesByCategoryId(this.categoryId);

  }
  GetCoursesByCategoryId(categoryId: number) {
    // Filter courses based on the provided categoryId
      this.courses = MOCK_COURSES.filter(f => f.categoryId == categoryId);

  }

  // Implementing OnChanges and OnInit interfaces
  // to handle input changes and initialization logic
  ngOnChanges(changes: SimpleChanges): void {
    this.processCourses();
  }
  ngOnInit(): void {
    // Initial processing of courses when the component is initialized
    this.processCourses();
    alert(this.categoryId);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

}
