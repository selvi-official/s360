import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Reliability from "./scenes/reliability";
import OKRs from "./scenes/okrs";
import Scalability from "./scenes/scalability";
import MyButton from "./scenes/test";
import KPIs from "./scenes/kpis";
import { SelectedProductProvider } from "./productcontext";
import { DateProvider } from "./datecontext";
import { SelectedBUProvider } from "./BUcontext";
import Login from "./Login";
import DetailsPage from "./components/DetailsPage";
import Incidents from "./scenes/incidents";

import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useIsAuthenticated,
} from "@azure/msal-react";
import { SetUserContext, UserProvider } from "./UserContext";
import Cost from "./scenes/cost";
import { CostReport } from "./scenes/costreport";
import Security from "./scenes/security";
import AI from "./scenes/ai";
import { WellArchitected } from "./scenes/wellArchitected";
import { SelectedAccountProvider } from "./accountContext";
import { WAControls } from "./scenes/WAControls";
import MyGraph from "./scenes/test";

import PAndE from "./scenes/pe";
import PAndE2 from "./scenes/pe2";
import OKR2 from "./scenes/okr2";
import { SelectedRegionProvider } from "./RegionContext";
import { TechStack } from "./scenes/TechStack";
import { SelectedEnvProvider } from "./EnvContext";
import { ComingSoonPage } from "./components/ComingSoonPage";


function App() {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserSet, setIsUserSet] = useState(false);

  const updateIsCollapsed = (newValue) => {
    setIsCollapsed(newValue);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <UnauthenticatedTemplate>
            <Login />
          </UnauthenticatedTemplate>
          <AuthenticatedTemplate>
            <SetUserContext setIsUserSet={setIsUserSet} />
            {isUserSet && (
              <div className="app">
                <Sidebar
                  updateIsCollapsed={updateIsCollapsed}
                  className="sidebar"
                />
                <main
                  className="content"
                  style={{ marginLeft: isCollapsed ? "80px" : "280px"}}
                >
                  {/* <Topbar /> */}
                  <div style={{marginTop: '24px'}}></div> 
                  <SelectedBUProvider>
                    <SelectedProductProvider>
                      <SelectedEnvProvider>
                        <SelectedAccountProvider>
                          <SelectedRegionProvider>
                            <DateProvider>
                              <Routes>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="well_architected" element={<WellArchitected />} />
                                <Route path="reliability" element={<PAndE />} />
                                <Route path="security" element={<Security />} />
                                <Route path="scalability" element={<Scalability />} />
                                <Route path="deployability" element={<Scalability />} />
                                <Route path="cost" element={<Cost />} />
                                <Route path="costreport" element={<CostReport/>} />
                                <Route path="ai" element={<AI />} />
                                <Route path="okrs" element={<OKR2 />} />
                                <Route path="kpis" element={<KPIs />} />
                                <Route path="incidents" element={<Incidents />} />
                                <Route path="controls" element={<WAControls />} />
                                <Route path="techstack" element={<TechStack /> } />
                                {/* <Route path="pe" element={<PAndE2 /> } /> */}
                                <Route path="/incident-details/:bu/:firstIndexValue" element={<DetailsPage />} />
                                <Route path="form" element={<MyButton />} />
                                <Route path="faq" element={<ComingSoonPage />} />
                                <Route path="/*" element={<Navigate to="/" replace={true} />} />
                                <Route path="/" element={<WellArchitected />} />
                              </Routes>
                            </DateProvider>
                          </SelectedRegionProvider>
                        </SelectedAccountProvider>
                      </SelectedEnvProvider>
                    </SelectedProductProvider>
                  </SelectedBUProvider>
                </main>
              </div>
            )}
          </AuthenticatedTemplate>
        </UserProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;