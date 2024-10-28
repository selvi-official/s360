import React, { createContext, useEffect, useState } from "react";

export const SelectedAccountContext = createContext("null");

export const SelectedAccountProvider = ({ children }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  const updateAccount = (account) => {
    setSelectedAccount(account);
  };

  return (
    <SelectedAccountContext.Provider value={{ selectedAccount, updateAccount }}>
      {children}
    </SelectedAccountContext.Provider>
  );
};
