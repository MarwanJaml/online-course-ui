import { Component, OnInit } from '@angular/core';
import { VideoRequestService } from '../../../services/video-request.service';
import { VideoRequest } from '../../../models/video-request';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-requests-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './video-requests-list.component.html',
  styleUrl: './video-requests-list.component.css'
})

export class VideoRequestsListComponent implements OnInit {
  videoRequests: VideoRequest[] = [];

  constructor(
    private videoRequestService: VideoRequestService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadVideoRequests();
  }

  loadVideoRequests(): void {
    this.videoRequestService.getAll().subscribe(
      (requests) => {
        this.videoRequests = requests;
      },
      (error) => {
        console.error('Error fetching video requests:', error);
      }
    );
  }

  editRequest(requestId: string): void {
    this.router.navigate(['/admin/technology/requests/edit', requestId]);
  }
}
