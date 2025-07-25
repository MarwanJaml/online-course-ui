import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseEnrollmentModel } from '../../../models/enrollment';
import { EnrollmentService } from '../../../services/enrollment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './enrollments.component.html',
  styleUrls: ['./enrollments.component.css']
})
export class EnrollmentsComponent implements OnInit {
  enrollments: CourseEnrollmentModel[] = [];
  userId: number | null = null;

  constructor(
    private enrollmentService: EnrollmentService,
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.userId = this.loginService.userId;
    if (this.userId) {
      this.loadEnrollments(this.userId);
    }
  }

  private loadEnrollments(userId: number): void {
    this.enrollmentService.getUserEnrollments(userId.toString())
      .subscribe({
        next: (data: CourseEnrollmentModel[]) => {
          this.enrollments = data;
        },
        error: (err) => {
          console.error('Error loading enrollments:', err);
        }
      });
  }

  viewCourseDetails(courseId: number): void {
    this.router.navigate([`/course/session-details/${courseId}`]);
  }
}