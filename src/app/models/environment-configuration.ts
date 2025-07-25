export interface EnvironmentConfiguration {
  env_name: string;
  production: boolean;
  apiUrl: string;
  apiEndpoints: {
    userProfile: string;
  };
  adb2cConfig: {
    instance: string;
    clientId: string;
    tenantId: string;
    domain: string;
    authorityDomain: string;
    signUpSignInPolicyId: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    readScopeUrl: string;
    writeScopeUrl: string;
    scopeUrls: string[];
    apiEndpointUrl: string;
    chatHubUrl: string;
  };
  cacheTimeInMinutes: number;
}