import { createSlice } from "@reduxjs/toolkit";

export const clustersSlice = createSlice({
  name: "clusters",
  initialState: {
    clusters: [],
    loading: false,
    error: null,
  },
  reducers: {
    setClusters: (state, action) => {
      state.clusters = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setClusters, setLoading, setError } = clustersSlice.actions;

export default clustersSlice.reducer;
