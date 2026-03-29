import { createBrowserRouter } from "react-router";
import Home from "../pages/Home.jsx";
import Cluster from "../pages/Cluster.jsx";
import LoginPage from "../features/auth/Pages/LoginPage.jsx";
import RegisterPage from "../features/auth/Pages/RegisterPage.jsx";
import Protected from "../features/auth/Components/Protected.jsx";
import Layout from "../components/Layout.jsx";
import Graph from "../pages/Graph.jsx";
import Search from "../pages/Search.jsx";
import Resurface from "../pages/Resurface.jsx";

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Protected><Layout /></Protected>, // Apply layout only to authenticated areas
        children: [
            {
                index: true,
                element: <Home />, // Represents the Dashboard now
            },
            {
                path: "clusters",
                element: <Cluster />, // The new semantic clusters page
            },
            {
                path: "graph",
                element: <Graph />, // D3 Knowledge Graph visualization
            },
            {
                path: "search",
                element: <Search />, // Qdrant Embedded Semantic Search
            },
            {
                path: "resurface",
                element: <Resurface />, // Memory Resurfacing cumulative view
            }
        ]
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
]);

export default appRouter;