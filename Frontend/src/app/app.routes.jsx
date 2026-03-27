import { createBrowserRouter } from "react-router";
import Home from "../pages/Home.jsx";
import LoginPage from "../features/auth/Pages/LoginPage.jsx";
import RegisterPage from "../features/auth/Pages/RegisterPage.jsx";
import Protected from "../features/auth/Components/Protected.jsx";

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Protected><Home /></Protected>,
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