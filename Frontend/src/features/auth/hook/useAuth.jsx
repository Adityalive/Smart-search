import { useSelector, useDispatch } from "react-redux";
import { setUser, setLoading, setError } from "../authSlice";
import { register, login, getme, logout } from "../services/auth.api";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);
    
    const handleRegister = async (name, email, password) => {
        dispatch(setLoading(true));
        try {
            const response = await register(name, email, password);
            dispatch(setUser(response.user));
            
            // Sync with Chrome Extension
            if (response.token) {
                window.dispatchEvent(new CustomEvent("SMART_SEARCH_LOGIN", {
                    detail: { token: response.token }
                }));
            }

            dispatch(setLoading(false));
            return response;
        } catch (error) {
            dispatch(setError(error?.response?.data || error.message));
            dispatch(setLoading(false));
            throw error;
        }
    }
    
    const handleLogin = async (email, password) => {
        dispatch(setLoading(true));
        try {
            const response = await login(email, password);
            dispatch(setUser(response.user));
            
            // Sync with Chrome Extension
            if (response.token) {
                window.dispatchEvent(new CustomEvent("SMART_SEARCH_LOGIN", {
                    detail: { token: response.token }
                }));
            }

            dispatch(setLoading(false));
            return response;
        } catch (error) {
            dispatch(setError(error?.response?.data || error.message));
            dispatch(setLoading(false));
            throw error;
        }
    }
    
    const handleGetme = async () => {
        dispatch(setLoading(true));
        try {
            const response = await getme();
            dispatch(setUser(response.user));
            
            // Sync with Chrome Extension on initial load
            if (response.token) {
                window.dispatchEvent(new CustomEvent("SMART_SEARCH_LOGIN", {
                    detail: { token: response.token }
                }));
            }

            dispatch(setLoading(false));
            return response;
        } catch (error) {
            dispatch(setError(error?.response?.data || error.message));
            dispatch(setLoading(false));
            throw error;
        }
    }
    
    const handleLogout = async () => {
        dispatch(setLoading(true));
        try {
            const response = await logout();
            dispatch(setUser(null));
            dispatch(setLoading(false));
            return response;
        } catch (error) {
            dispatch(setError(error?.response?.data || error.message));
            dispatch(setLoading(false));
            throw error;
        }
    }
    
    // We return user, loading, and error so our Components can read the state directly from the hook!
    return { user, loading, error, handleRegister, handleLogin, handleGetme, handleLogout };
};
