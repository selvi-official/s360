import React, { createContext, useEffect, useState } from 'react';

export const SelectedBUContext = createContext('null');

export const SelectedBUProvider = ({ children }) => {
    const [selectedBU, setSelectedBU] = useState('All');

    const updateBU = (bu) => {
        setSelectedBU(bu)
    }

    return (
        <SelectedBUContext.Provider value={{ selectedBU, updateBU }}>
            {children}
        </SelectedBUContext.Provider>
    );
};



