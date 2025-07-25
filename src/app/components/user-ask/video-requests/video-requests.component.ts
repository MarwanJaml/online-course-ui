import { Component, OnInit } from '@angular/core';
import { VideoRequestService } from '../../../services/video-request.service';
import { LoginService } from '../../../services/login.service';
import { VideoRequest } from '../../../models/video-request';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-requests',
  standalone: true,
  imports: [CommonModule, AccordionModule, RouterModule],
  templateUrl: './video-requests.component.html',
  styleUrls: ['./video-requests.component.css']
})
export class VideoRequestsComponent implements OnInit {
  mockVideoRequests: VideoRequest[] = [];

  constructor(
    private videoRequestService: VideoRequestService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.getVideoRequests();
  }

  getVideoRequests(): void {
    if (this.loginService.userId) {
      this.videoRequestService.getByUserId(this.loginService.userId.toString())
        .subscribe(requests => {
          this.mockVideoRequests = requests;
        });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'requested': return 'requested';
      case 'reviewed': return 'reviewed';
      case 'inprocess': return 'inprocess';
      case 'completed': return 'completed';
      case 'published': return 'published';
      default: return '';
    }
  }
}