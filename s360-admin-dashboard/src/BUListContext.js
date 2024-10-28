import React, { createContext, useEffect, useState } from 'react';

export const BUListContext = createContext('null');

export const BUListProvider = ({ children }) => {
    const [BUList, setBUList] = useState([]);

    const updateBUList = (bu) => {
        setBUList(bu)
    }

    return (
        <BUListContext.Provider value={{  BUList, updateBUList }}>
            {children}
        </BUListContext.Provider>
    );
};



