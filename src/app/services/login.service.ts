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

    // Convert oid/sub to number
    const oidOrSub = claims?.oid || claims?.sub || '';
    this._userId = this.convertToNumber(oidOrSub);
    this.userIdSubject.next(this._userId);

    this._userRoles = claims?.roles || [];
    this.userName = this.getDisplayName(claims);
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
          value = this.convertToNumber(value);
          description = key === 'oid'
            ? 'Immutable user identifier (as number)'
            : 'Unique user identifier (as number)';
          break;
        case 'roles':
          description = 'Application roles assigned to the user';
          break;
        // ... other cases remain similar
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

  private convertToNumber(id: any): number | null {
    if (typeof id === 'number') return id;
    if (typeof id !== 'string') return null;

    if (/^\d+$/.test(id)) {
      return parseInt(id, 10);
    }
    return this.hashStringToNumber(id);
  }

  private hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private getDisplayName(claims: any): string {
    if (claims?.name) return claims.name;
    if (claims?.preferred_username) return claims.preferred_username;
    return `${claims?.given_name || ''} ${claims?.family_name || ''}`.trim();
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
        error: (error) => console.error('Login failed:', error)
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
}