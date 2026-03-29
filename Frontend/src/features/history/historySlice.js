import { createSlice } from "@reduxjs/toolkit";

const historySlice = createSlice({
    name: "history",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        setHistory: (state, action) => {
            state.items = action.payload;
        },
        addHistoryItem: (state, action) => {
            // Unshift to keep "latest to older" in state, 
            // though the API should ideally return them sorted.
            state.items = [action.payload, ...state.items].slice(0, 20);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearHistoryState: (state) => {
            state.items = [];
        }
    },
});

export const { setHistory, addHistoryItem, setLoading, setError, clearHistoryState } = historySlice.actions;
export default historySlice.reducer;
