import { LogLevel, PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID,
    // clientId: '6cbdbf80-df26-4a0b-a787-c24f34f09f92',      // service360
    // clientId: '4f17b5f9-c17a-4ca6-a8ba-e60adbff76b7',         // s360
    authority: 'https://login.microsoftonline.com/8a791446-3f74-41af-be7d-470e2f985275',
    redirectUri: "/",
   },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },

};

export const loginRequest = {
  scopes: ['openid', 'profile','User.Read','Group.Read.All','GroupMember.Read.All'],
};



export const pca = new PublicClientApplication(msalConfig);