import { Component, OnInit } from '@angular/core';
import { CourseDetails } from '../../../models/course';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'ngx-bootstrap/rating';
import { MOCK_COURSE_DETAILS } from '../../../mock-data/course-details';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-course-details',
  imports: [
    CommonModule,
    FormsModule,
    RatingModule,
    RouterModule,
  ],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css'
})
export class CourseDetailsComponent implements OnInit {
  courseDetails: CourseDetails | null = null;
  videoUrl: string | null = null;
  courseId!: number;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    
    if (this.courseId) {
      this.loadCourseDetails();
    } else {
      this.error = 'Invalid course ID';
    }
  }

  private loadCourseDetails(): void {
    this.loading = true;
    this.error = null;
    
    this.courseService.getCourseDetails(this.courseId).subscribe({
      next: (courseDetails) => {
        this.courseDetails = courseDetails;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course details:', error);
        this.error = 'Failed to load course details. Please try again.';
        this.loading = false;
        
        // Fallback to mock data if needed
        // this.courseDetails = MOCK_COURSE_DETAILS;
      }
    });
  }

  openVideo(videoUrl: string): void {
    const videoId = this.extractVideoId(videoUrl);
    this.videoUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  closeVideo(): void {
    this.videoUrl = null;
  }

  private extractVideoId(url: string): string {
    const regex = /youtube\.com\/watch\?v=([^"&?/]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  getAverageRating(): number {
    if (!this.courseDetails?.reviews || this.courseDetails.reviews.length === 0) {
      return 0;
    }
    
    const totalRating = this.courseDetails.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / this.courseDetails.reviews.length;
  }
}