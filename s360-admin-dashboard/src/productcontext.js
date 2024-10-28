import React, { createContext, useEffect, useState } from 'react';

export const SelectedProductContext = createContext('null');

export const SelectedProductProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const updateProduct = (product) => {
    setSelectedProduct(product)
  }

  return (
    <SelectedProductContext.Provider value={{ selectedProduct, updateProduct }}>
      {children}
    </SelectedProductContext.Provider>
  );
};



