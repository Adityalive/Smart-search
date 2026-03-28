import { createSlice } from "@reduxjs/toolkit";

export const graphSlice = createSlice({
  name: "graph",
  initialState: {
    graphData: { nodes: [], links: [] },
    loading: false,
    error: null,
  },
  reducers: {
    setGraphData: (state, action) => {
      state.graphData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setGraphData, setLoading, setError } = graphSlice.actions;

export default graphSlice.reducer;
