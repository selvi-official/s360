import React, { createContext, useEffect, useState } from "react";

export const SelectedRegionContext = createContext("null");

export const SelectedRegionProvider = ({ children }) => {
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");

  const updateRegion = (region) => {
    setSelectedRegion(region);
  };

  return (
    <SelectedRegionContext.Provider value={{ selectedRegion, updateRegion }}>
      {children}
    </SelectedRegionContext.Provider>
  );
};
