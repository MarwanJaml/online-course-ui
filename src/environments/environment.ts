
import { EnvironmentConfiguration } from "../app/models/environment-configuration";

export const environment: EnvironmentConfiguration = {
  env_name: 'dev',
  production: false,
  apiUrl: 'https://localhost:7045/api',
  apiEndpoints: {
    userProfile: 'user-profiles'
  },
  adb2cConfig: {
    instance: "https://login.microsoftonline.com/", // Keep the base URL
    clientId: "b1d31625-d3c4-4d54-82d6-0be3c6e5b396", // UI app ID
    tenantId: "f0a76583-1e43-4c9f-bfd2-2b7dc64fa56b", // This specifies your tenant
    domain: "onlinecoursepro.onmicrosoft.com",
    authorityDomain: "login.microsoftonline.com", // Standard endpoint
    signUpSignInPolicyId: "", // Not needed for standard Entra
    redirectUri: "http://localhost:4200",
    postLogoutRedirectUri: "http://localhost:4200",
    readScopeUrl: "api://cf6f8d0a-6707-40a8-b50a-bda7c003b15a/User.Read",
    writeScopeUrl: "api://cf6f8d0a-6707-40a8-b50a-bda7c003b15a/User.Write",
    scopeUrls: [
      "openid",
      "profile",
      "offline_access",
      "api://cf6f8d0a-6707-40a8-b50a-bda7c003b15a/User.Read" // Consistent API scope
    ],
    apiEndpointUrl: "https://localhost:7045/api",
    chatHubUrl: "https://localhost:7045/hubs/chat"
  },
  cacheTimeInMinutes: 30
};