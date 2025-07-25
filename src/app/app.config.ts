import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptor,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
  MsalBroadcastService,
  MsalGuard,
  MsalService,
  ProtectedResourceScopes
} from '@azure/msal-angular';
import {
  IPublicClientApplication,
  PublicClientApplication,
  BrowserCacheLocation,
  LogLevel,
  InteractionType,
  Configuration
} from '@azure/msal-browser';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SafePipe } from './pipes/safe.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { RatingModule } from 'ngx-bootstrap/rating';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { HttpRequestInterceptor } from './services/spinner-interceptor';
import { GlobalErrorHandler } from './components/core/error-handling/global-error-handling.service';
import { GlobalErrorInterceptor } from './components/core/error-handling/global-error-handling.interceptor';

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}
export function MSALInstanceFactory(): IPublicClientApplication {
  const authority = 'https://login.microsoftonline.com/f0a76583-1e43-4c9f-bfd2-2b7dc64fa56b'; // Your tenant ID


  const config: Configuration = {
    auth: {
      clientId: 'b1d31625-d3c4-4d54-82d6-0be3c6e5b396', // Your UI app ID
      authority: 'https://login.microsoftonline.com/f0a76583-1e43-4c9f-bfd2-2b7dc64fa56b',
      knownAuthorities: ['login.microsoftonline.com'],
      redirectUri: '/auth',
      postLogoutRedirectUri: '/',
      navigateToLoginRequestUrl: false
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: true
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message) => console.log(message),
        logLevel: LogLevel.Verbose
      }
    }
  };
  return new PublicClientApplication(config);
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.apiUrl, [
    'api://cf6f8d0a-6707-40a8-b50a-bda7c003b15a/User.Read'
  ]);
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.adb2cConfig.scopeUrls
    },
    loginFailedRoute: '/login-failed'
  };
} export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      CarouselModule.forRoot(),
      AccordionModule.forRoot(),
      RatingModule.forRoot(),
      ModalModule.forRoot(),
      PopoverModule.forRoot(),
      SafePipe,
      BrowserModule,
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }),
      NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalErrorInterceptor,
      multi: true,
    },
    provideAnimationsAsync(),
    //provideNoopAnimations(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
};