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
    userId: 0,
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
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.loginService.userId$
      .pipe(
        takeUntil(this.destroy$),
        filter((userId): userId is number => userId !== null),
        switchMap((userId: number) => {
          return this.userService.getUserProfile(userId);
        })
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isLoading = false;
        },
        error: (err) => {
          this.handleProfileError(err);
          this.isLoading = false;
        }
      });
  }

  private handleProfileError(error: any): void {
    console.error('Profile load failed:', error);

    if (error.status === 404) {
      this.errorMessage = 'Profile not found. Please complete your profile setup.';
    } else {
      this.errorMessage = 'Failed to load profile data. Please try again later.';
    }
  }
}