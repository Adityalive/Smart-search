import { createSlice } from "@reduxjs/toolkit";

export const authslice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: true,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setUser, setLoading, setError } = authslice.actions;

export default authslice.reducer;