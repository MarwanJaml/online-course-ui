import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  MsalService,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
} from '@azure/msal-angular';
import {
  EventMessage,
  AuthenticationResult,
  InteractionStatus,
  EventType,
  InteractionType,
  PopupRequest,
  PromptValue,
  RedirectRequest,
} from '@azure/msal-browser';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { Claim } from '../models/claim';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private claimsSubject = new BehaviorSubject<Claim[]>([]);
  private userIdSubject = new BehaviorSubject<number | null>(null);
  private _userId: number | null = null;
  private _userRoles: string[] = [];

  // Public observables
  public claims$ = this.claimsSubject.asObservable();
  public userId$ = this.userIdSubject.asObservable().pipe(distinctUntilChanged());
  public loginDisplay = false;
  public isLoggedIn = false;
  public displayedColumns: string[] = ['claim', 'value', 'description'];
  public userName = '';

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration
  ) {
    this.setupMsalEventHandlers();
  }

  get userId(): number | null {
    return this._userId;
  }

  get userRoles(): string[] {
    return [...this._userRoles];
  }

  private setupMsalEventHandlers(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS))
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
        this.processTokenClaims(payload.account?.idTokenClaims);
      });

    this.msalBroadcastService.inProgress$
      .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });
  }

  private checkAndSetActiveAccount(): void {
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts.length > 0 && !this.authService.instance.getActiveAccount()) {
      this.authService.instance.setActiveAccount(accounts[0]);
    }
    this.processTokenClaims(this.authService.instance.getActiveAccount()?.idTokenClaims);
  }

  private setLoginDisplay(): void {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    this.isLoggedIn = this.loginDisplay;
  }

  private processTokenClaims(claims: any): void {
    if (!claims) {
      this.resetUserData();
      return;
    }

    const claimsTable = this.createClaimsTable(claims);
    this.claimsSubject.next(claimsTable);

    // Convert oid/sub to number - improved for practice
    const oidOrSub = claims?.oid || claims?.sub || '';
    this._userId = this.convertToNumber(oidOrSub);
    this.userIdSubject.next(this._userId);

    this._userRoles = claims?.roles || [];
    this.userName = this.getDisplayName(claims);

    // For debugging in practice - log the conversion
    if (oidOrSub) {
      console.log(`🔍 Practice Debug: "${oidOrSub}" -> ${this._userId}`);
    }
  }

  private createClaimsTable(claims: Record<string, any>): Claim[] {
    const claimsTable: Claim[] = [];

    if (!claims) return claimsTable;

    Object.keys(claims).forEach((key) => {
      if (['uti', 'rh', 'aio', 'ver'].includes(key)) return;

      let value = claims[key];
      let description = '';

      switch (key) {
        case 'aud':
          description = "Identifies the intended recipient of the token";
          break;
        case 'iss':
          description = 'Identifies the issuer of the token';
          break;
        case 'iat':
        case 'nbf':
        case 'exp':
          claimsTable.push({
            claim: key,
            value: this.changeDateFormat(+value),
            description: this.getTimestampDescription(key)
          });
          return;
        case 'oid':
        case 'sub':
          const numericValue = this.convertToNumber(value);
          claimsTable.push({
            claim: key,
            value: `${value} -> ${numericValue}`,
            description: key === 'oid'
              ? `Immutable user identifier (converted to: ${numericValue})`
              : `Unique user identifier (converted to: ${numericValue})`
          });
          return;
        case 'roles':
          description = 'Application roles assigned to the user';
          break;
        case 'name':
          description = "User's display name";
          break;
        case 'preferred_username':
          description = 'Primary username (usually email)';
          break;
        case 'email':
          description = "User's email address";
          break;
        default:
          description = '';
      }

      if (Array.isArray(value)) {
        value.forEach((val) => {
          claimsTable.push({ claim: key, value: val, description });
        });
      } else {
        claimsTable.push({ claim: key, value, description });
      }
    });

    return claimsTable;
  }

  // Improved conversion function for practice
  private convertToNumber(id: any): number | null {
    if (typeof id === 'number') return id;
    if (typeof id !== 'string') return null;

    // Case 1: Already numeric string
    if (/^\d+$/.test(id)) {
      const num = parseInt(id, 10);
      return num;
    }

    // Case 2: Create hash for practice (improved algorithm)
    return this.createPracticeHash(id);
  }

  // Hash function - MUST match backend exactly
  private createPracticeHash(str: string): number {
    let hash = 5381; // djb2 algorithm - SAME as backend

    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      // Remove the extra "hash & hash" to match backend exactly
    }

    // SAME logic as backend
    return Math.abs(hash) % 2147483647;
  }

  private getDisplayName(claims: any): string {
    if (claims?.name) return claims.name;
    if (claims?.preferred_username) return claims.preferred_username;
    if (claims?.email) return claims.email;
    return `${claims?.given_name || ''} ${claims?.family_name || ''}`.trim() || 'Unknown User';
  }

  private resetUserData(): void {
    this._userId = null;
    this._userRoles = [];
    this.userName = '';
    this.userIdSubject.next(null);
    this.claimsSubject.next([]);
  }

  login(): void {
    const loginRequest: RedirectRequest | PopupRequest = {
      prompt: PromptValue.SELECT_ACCOUNT,
      scopes: ['openid', 'profile', 'offline_access', 'email'],
    };

    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.loginPopup(loginRequest).subscribe({
        next: (response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
          this.processTokenClaims(response.account?.idTokenClaims);
        },
        error: (error) => console.error('❌ Login failed:', error)
      });
    } else {
      this.authService.loginRedirect(loginRequest);
    }
  }

  logout(): void {
    const activeAccount = this.authService.instance.getActiveAccount() ||
      this.authService.instance.getAllAccounts()[0];

    if (!activeAccount) return;

    const logoutRequest = {
      account: activeAccount,
      postLogoutRedirectUri: 'http://localhost:4200'
    };

    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.logoutPopup(logoutRequest);
    } else {
      this.authService.logoutRedirect(logoutRequest);
    }
  }

  private changeDateFormat(date: number): string {
    const dateObj = new Date(date * 1000);
    return `${date} - [${dateObj.toString()}]`;
  }

  private getTimestampDescription(key: string): string {
    switch (key) {
      case 'iat': return '"Issued At" - when authentication occurred';
      case 'nbf': return '"Not Before" - token not valid before this time';
      case 'exp': return '"Expiration" - token not valid after this time';
      default: return '';
    }
  }

  // Helper method for practice - show current user info
  getCurrentUserDebugInfo(): void {
    console.log('🔍 Current User Debug Info:', {
      userId: this._userId,
      userName: this.userName,
      roles: this._userRoles,
      isLoggedIn: this.isLoggedIn
    });
  }
}