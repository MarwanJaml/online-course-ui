import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../../services/login.service';
import { UserProfileService } from '../../../services/user-profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  contactForm!: FormGroup;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toastrService: ToastrService,
    private loginService: LoginService,
    private userService: UserProfileService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userId = this.loginService.userId;
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const formData = {
        ...this.contactForm.value,
        userId: this.userId?.toString() // Convert to string if needed by backend
      };

      this.contactService.sendMessage(formData).subscribe({
        next: (response) => {
          this.toastrService.success('Message sent successfully!');
          this.contactForm.reset();
        },
        error: (error) => {
          this.toastrService.error('Error sending message. Please try again.');
        }
      });
    }
  }
}