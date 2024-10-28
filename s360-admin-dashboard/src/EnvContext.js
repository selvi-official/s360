import React, { createContext, useEffect, useState } from "react";

export const SelectedEnvContext = createContext("null");

export const SelectedEnvProvider = ({ children }) => {
  const [selectedEnv, setSelectedEnv] = useState("Production");

  const updateEnv = (env) => {
    setSelectedEnv(env);
  };

  return (
    <SelectedEnvContext.Provider value={{ selectedEnv, updateEnv }}>
      {children}
    </SelectedEnvContext.Provider>
  );
};
