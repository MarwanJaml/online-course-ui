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
  @Input() userId: number | string = ''; // Accept both number and string input
  user: UserModel = {
    userId: 0, // Changed to number
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    adObjId: '',
    profilePictureUrl: '',
    bio: ''
  };

  constructor(private userService: UserProfileService) { }

  ngOnInit(): void {
    this.getUserProfile();
  }

  getUserProfile(): void {
    // Convert to string if needed (assuming API expects string)
    const userIdStr = typeof this.userId === 'number'
      ? this.userId.toString()
      : this.userId;

    this.userService.getUserProfile(userIdStr).subscribe({
      next: (data) => {
        this.user = {
          ...data,
          userId: Number(data.userId) // Ensure userId is number
        };
        this.user.bio = this.user.bio?.replace(/\n/g, '<br>');
      },
      error: (err) => {
        console.error('Error fetching user profile', err);
      }
    });
  }
}