import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { pca } from "./authConfig";
import { EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );

pca.addEventCallback(event => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    // console.log(event)
    pca.setActiveAccount(event.payload.account)
  }
  else {
    // console.log("other event: ",event)
  }
})



ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <MsalProvider instance={pca}>
          <App  />
      </MsalProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);