import { EnvironmentConfiguration } from "../app/models/environment-configuration";

const serverUrl = 'https://your-production-api.com/api'; // Update with your production URL

export const environment: EnvironmentConfiguration = {
  env_name: 'prod',
  production: true,
  apiUrl: serverUrl,
  apiEndpoints: {
    userProfile: 'user-profiles'
  },
  // Azure AD B2C Configuration - Production
  adb2cConfig: {
    clientId: 'f6bc2f74-9e28-4f95-b74f-97c75a16b440', // Same or create separate prod registration
    domain: 'onlinecourseenrolment.onmicrosoft.com',
    authorityDomain: 'makotech.b2clogin.com',
    signUpSignInPolicyId: 'susi',
    redirectUri: '/',
    postLogoutRedirectUri: '/',
    // API Scopes - Production
    readScopeUrl: 'https://onlinecourseenrolment.onmicrosoft.com/api/User.Read',
    writeScopeUrl: 'https://onlinecourseenrolment.onmicrosoft.com/api/User.Write',
    scopeUrls: [
      'https://onlinecourseenrolment.onmicrosoft.com/api/User.Read',
      'https://onlinecourseenrolment.onmicrosoft.com/api/User.Write'
    ],
    apiEndpointUrl: serverUrl, // Uses the production server URL
    chatHubUrl: 'https://your-production-api.com/hubs/chat' // Update with production URL
  },
  cacheTimeInMinutes: 30,
};