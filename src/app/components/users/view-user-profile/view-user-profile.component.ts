import { Component, Input, OnInit } from '@angular/core';
import { UserProfileService } from '../../../services/user-profile.service';
import { UserModel } from '../../../models/usermodel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-user-profile.component.html',
  styleUrls: ['./view-user-profile.component.css']
})
export class ViewUserProfileComponent implements OnInit {
  @Input() userId!: number; // Strictly numeric input
  user: UserModel = {
    userId: 0,
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    adObjId: '',
    profilePictureUrl: '',
    bio: ''
  };
  isLoading = true;
  error = '';

  constructor(private userService: UserProfileService) { }

  ngOnInit(): void {
    if (!this.userId || isNaN(this.userId)) {
      this.error = 'Invalid user ID provided';
      this.isLoading = false;
      return;
    }
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.userService.getUserProfile(this.userId).subscribe({
      next: (user) => {
        this.user = {
          ...user,
          bio: user.bio?.replace(/\n/g, '<br>') || ''
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.status === 404
          ? 'Profile not found'
          : 'Failed to load profile';
        this.isLoading = false;
        console.error('Profile load error:', err);
      }
    });
  }
}