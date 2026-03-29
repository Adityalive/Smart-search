import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import itemsReducer from "../features/items/itemsSlice";
import clustersReducer from "../features/clusters/clustersSlice";
import graphReducer from "../features/graph/graphSlice";
import historyReducer from "../features/history/historySlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        items: itemsReducer,
        clusters: clustersReducer,
        graph: graphReducer,
        history: historyReducer,
    },
});