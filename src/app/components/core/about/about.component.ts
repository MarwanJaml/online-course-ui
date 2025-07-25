import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserProfileService } from '../../../services/user-profile.service';
import { LoginService } from '../../../services/login.service';
import { UserModel } from '../../../models/usermodel';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, switchMap, filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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

  isLoading = false;
  errorMessage = '';

  constructor(
    private userService: UserProfileService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.getUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.loginService.userId$
      .pipe(
        takeUntil(this.destroy$),
        filter((userId: number | null): userId is number => userId !== null),
        switchMap((userId: number) => this.userService.getUserProfile(userId.toString()))
      )
      .subscribe({
        next: (data) => {
          this.user = {
            ...data,
            userId: Number(data.userId) // Ensure userId is number
          };
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching user profile', err);
          this.errorMessage = err.message || 'Failed to load user profile';
          this.isLoading = false;

          if (err.status === 404) {
            this.errorMessage = 'User profile not found. Please complete your profile setup.';
          }
        }
      });
  }
}