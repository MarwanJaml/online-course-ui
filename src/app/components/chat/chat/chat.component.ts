import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { UserModel } from '../../../models/usermodel';
import { UserProfileService } from '../../../services/user-profile.service';
import { RouterModule } from '@angular/router';

interface ConnectedUser {
  connectionId: string;
  userId: number;
  displayName: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  userId: number | null = null; // Changed from hardcoded to use loginService

  user: UserModel = {
    userId: 0, // Changed to number
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    adObjId: '',
    profilePictureUrl: '',
    bio: '',
  };

  loggedInUser: UserModel = {
    userId: 0, // Changed to number
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    adObjId: '',
    profilePictureUrl: '',
    bio: '',
  };

  isAdmin = false;
  message = '';
  connectedUsers$: any;
  chatQueue$: any;
  isAdminConnected$: any;
  chatStarted$: any;
  chatEnded: ConnectedUser | null = null;
  currentChatUser: any = null;
  messages: { sender: string; content: string }[] = [];
  statusMessage = 'You are not connected yet with anyone to chat!';
  private messagesSubscription!: Subscription;

  messagesToAdmin: { sender: string; content: string }[] = [];
  private messagesToAdminSubscription!: Subscription;
  messageToAdmin = '';

  constructor(
    private chatService: ChatService,
    private loginService: LoginService,
    private toastrService: ToastrService,
    private userService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.initializeUserData();
    this.setupChatServices();
    this.setupSubscriptions();
    this.getUserProfile();
  }

  private initializeUserData(): void {
    this.isAdmin = this.loginService.userRoles.includes('Admin');
    this.userId = this.loginService.userId;
  }

  private setupChatServices(): void {
    this.connectedUsers$ = this.chatService.connectedUsers$;
    this.chatQueue$ = this.chatService.chatQueue$;
    this.isAdminConnected$ = this.chatService.isAdminConnected$;
    this.chatStarted$ = this.chatService.chatStarted$;

    this.chatService.startConnection();
  }

  private setupSubscriptions(): void {
    this.chatService.chatEnded$.subscribe((user) => {
      this.chatEnded = user;
      if (this.messages.length > 0) {
        this.toastrService.info(
          'Your chat has been ended. You can check the transcript from the website.',
          'Chat Ended'
        );
      }
      this.messages = [];
    });

    this.chatService.isAdminConnected$.subscribe((isAdmin) => {
      if (isAdmin) {
        this.chatService.registerAdmin();
      }
    });

    this.messagesSubscription = this.chatService.messages$.subscribe(
      (messages) => {
        this.messages = messages;
      }
    );

    this.chatService.chatStarted$.subscribe((data) => {
      this.statusMessage = data
        ? `You are now connected with ${data?.displayName}`
        : this.statusMessage;
    });

    this.messagesToAdminSubscription =
      this.chatService.messagestoAdmin$.subscribe((messages) => {
        this.messagesToAdmin = messages;
      });

    setTimeout(() => {
      if (this.isAdmin) {
        this.chatService.registerAdmin();
      } else {
        this.joinChatQueue();
      }
    }, 3000);
  }

  connectWithUser(connectionIdOfUser: string): void {
    this.chatService.connectWithUser(connectionIdOfUser);
    this.currentChatUser = connectionIdOfUser;
  }

  sendMessage(message: string): void {
    if (message.trim()) {
      this.chatService.sendMessage(message);
      this.message = '';
    }
  }

  sendMessageToAdmin(message: string): void {
    if (message.trim()) {
      this.chatService.sendMessageToAdmin(message);
      this.messageToAdmin = '';
    }
  }

  endChat(): void {
    this.chatService.endChat();
  }

  joinChatQueue(): void {
    this.chatService.joinChatQueue();
  }

  registerAdmin(): void {
    this.chatService.registerAdmin();
  }

  private getUserProfile(): void {
    if (this.userId) {
      this.userService.getUserProfile(this.userId.toString()).subscribe({
        next: (data) => {
          this.user = {
            ...data,
            userId: Number(data.userId)
          };
        },
        error: (err) => {
          console.error('Error fetching user profile', err);
        },
      });
    }

    this.loginService.userId$
      .pipe(filter((userId): userId is number => userId !== null))
      .subscribe((userId) => {
        this.userService.getUserProfile(userId.toString()).subscribe({
          next: (data) => {
            this.loggedInUser = {
              ...data,
              userId: Number(data.userId)
            };
          },
          error: (err) => {
            console.error('Error fetching user profile', err);
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
    this.messagesSubscription?.unsubscribe();
    this.messagesToAdminSubscription?.unsubscribe();
  }

  @HostListener('window:beforeunload')
  unloadNotification(): void {
    this.chatService.stopConnection();
  }
}