import { createSlice } from "@reduxjs/toolkit";

export const itemsSlice = createSlice({
  name: "items",
  initialState: {
    items: [],
    resurfacedClusters: [], // Store clusters for memory resurface
    loading: false,
    error: null,
  },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setResurfacedClusters: (state, action) => {
      state.resurfacedClusters = action.payload;
    },
    addItem: (state, action) => {
      state.items = [action.payload, ...state.items];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setItems, setResurfacedClusters, addItem, setLoading, setError } = itemsSlice.actions;

export default itemsSlice.reducer;
