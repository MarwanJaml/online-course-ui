import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserProfileService } from '../../../services/user-profile.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isInstructor = false;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private loginService: LoginService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      bio: [{ value: '', disabled: true }, Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    if (!this.loginService.isLoggedIn) {
      this.router.navigate(['/home']);
      return;
    }

    this.loginService.userId$
      .pipe(
        filter((userId): userId is number => userId !== null), // Type guard for number
        takeUntil(this.destroy$)
      )
      .subscribe(userId => {
        this.loadUserProfile(userId);
      });
  }

  private loadUserProfile(userId: number): void {
    this.isLoading = true;
    this.userProfileService.getUserProfile(userId).subscribe({
      next: (response) => {
        this.isInstructor = this.loginService.userRoles.includes('Instructor');
        this.updateFormState();
        this.profileForm.patchValue({
          bio: response.bio || ''
        });
        this.previewUrl = response.profilePictureUrl || null;
        this.isLoading = false;
      },
      error: () => {
        this.toastrService.error('Failed to load profile data');
        this.isLoading = false;
      }
    });
  }

  private updateFormState(): void {
    if (this.isInstructor) {
      this.profileForm.get('bio')?.enable();
    } else {
      this.profileForm.get('bio')?.disable();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.previewImage(this.selectedFile);
    }
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.loginService.userId) return;

    const formData = new FormData();
    formData.append('userId', this.loginService.userId.toString());
    formData.append('bio', this.profileForm.get('bio')?.value || '');

    if (this.selectedFile) {
      formData.append('picture', this.selectedFile);
    }

    this.userProfileService.updateProfile(formData).subscribe({
      next: () => {
        this.toastrService.success('Profile updated successfully');
      },
      error: () => {
        this.toastrService.error('Failed to update profile');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}