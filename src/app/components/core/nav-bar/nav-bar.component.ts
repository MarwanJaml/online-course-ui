import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { Claim } from '../../../models/claim';
import { MsalModule, MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, RedirectRequest, PopupRequest, AuthenticationResult } from '@azure/msal-browser';
import { LoginService } from '../../../services/login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../../services/user-profile.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule, MsalModule, CommonModule, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  isIframe = false;
  loginDisplay = false;
  isAdmin = false;
  private readonly _destroying$ = new Subject<void>();
  claims: Claim[] = [];
  profilePictureUrl = '';
  isLoading = false;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private loginService: LoginService,
    private router: Router,
    private userService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    this.setupAuthListeners();
    this.setupUserProfileListener();
  }

  private setupAuthListeners(): void {
    this.authService.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult | null) => {
        if (result) {
          const redirectStartPage = localStorage.getItem('redirectStartPage');
          if (redirectStartPage) {
            this.router.navigate([redirectStartPage]);
            localStorage.removeItem('redirectStartPage');
          }
        }
      }
    });

    this.authService.instance.enableAccountStorageEvents();

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) =>
          msg.eventType === EventType.ACCOUNT_ADDED ||
          msg.eventType === EventType.ACCOUNT_REMOVED
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        if (this.authService.instance.getAllAccounts().length === 0) {
          window.location.pathname = '/';
        } else {
          this.setLoginDisplay();
        }
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });
  }

  private setupUserProfileListener(): void {
    this.loginService.userId$
      .pipe(
        filter((userId): userId is number => userId !== null),
        takeUntil(this._destroying$)
      )
      .subscribe(userId => {
        this.loadUserProfile(userId);
      });

    this.loginService.claims$
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: (claims) => {
          this.claims = claims;
          this.checkAdminRole(claims);
        }
      });
  }

  private checkAdminRole(claims: Claim[]): void {
    const roles = claims.filter(f => f.claim === 'extension_userRoles');
    if (roles.length) {
      this.isAdmin = roles[0].value.split(',').includes('Admin');
    }
  }

  private loadUserProfile(userId: number): void {
    this.isLoading = true;
    this.userService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profilePictureUrl = profile.profilePictureUrl || '';
        this.isLoading = false;
      },
      error: () => {
        this.profilePictureUrl = '';
        this.isLoading = false;
      }
    });
  }

  setLoginDisplay(): void {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  checkAndSetActiveAccount(): void {
    const activeAccount = this.authService.instance.getActiveAccount();
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      const accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  loginRedirect(): void {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  loginPopup(): void {
    const request = this.msalGuardConfig.authRequest
      ? { ...this.msalGuardConfig.authRequest } as PopupRequest
      : undefined;

    this.authService.loginPopup(request).subscribe({
      next: (response: AuthenticationResult) => {
        this.authService.instance.setActiveAccount(response.account);
      },
      error: (err) => console.error('Login failed:', err)
    });
  }

  logout(popup?: boolean): void {
    const activeAccount = this.authService.instance.getActiveAccount() ||
      this.authService.instance.getAllAccounts()[0];

    if (!activeAccount) return;

    const logoutRequest = {
      account: activeAccount,
      mainWindowRedirectUri: '/'
    };

    if (popup) {
      this.authService.logoutPopup(logoutRequest);
    } else {
      this.authService.logoutRedirect(logoutRequest);
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}