import React, { createContext, useEffect, useState } from 'react';

export const DateContext = createContext(null);

export const DateProvider = ({ children }) => {
    const [fromDate, setFromDate] = useState(new Date(new Date() - 7 * 24 * 60 * 60 * 1000))
    const [toDate, setToDate] = useState(new Date())
    const [rangeSelection, setRangeSelection] = useState('7days')

    const updateDateRange = (fromDate, toDate) => {
        setFromDate(fromDate)
        setToDate(toDate)
    }

    const handleRangeSelectionChange = (selection) => {
        // const range = selection;

        setRangeSelection(selection);

        if (selection === '7days') {
            const today = new Date();
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - 7);

            updateDateRange(pastDate, today);
        } else if (selection === '1month') {
            const today = new Date();
            const pastDate = new Date();
            pastDate.setMonth(today.getMonth() - 1);
            if (today.getMonth() === 0) {
                pastDate.setFullYear(today.getFullYear() - 1);
            }
            pastDate.setDate(1);

            updateDateRange(pastDate, today);
        } else if (selection === '3months') {
            const today = new Date();
            const pastDate = new Date();
            pastDate.setMonth(today.getMonth() - 3);
            if (today.getMonth() < 2) {
                pastDate.setFullYear(today.getFullYear() - 1);
            }
            pastDate.setDate(1);

            updateDateRange(pastDate, today);
        } else if (selection === 'custom') {
            // Custom range is already being handled separately
        }
        // console.log(fromDate, "..", toDate)

    }

    return (
        <DateContext.Provider value={{ fromDate, toDate, updateDateRange, rangeSelection, handleRangeSelectionChange }}>
            {children}
        </DateContext.Provider>
    );
};