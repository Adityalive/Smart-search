import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth';
import * as api from '../services/history.api.jsx';
import { setHistory, addHistoryItem as addReduxHistory, setLoading, setError, clearHistoryState } from '../historySlice';

export const useHistory = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { items: historyItems, loading, error } = useSelector((state) => state.history);

    const fetchHistory = async () => {
        if (!user) return;
        dispatch(setLoading(true));
        try {
            const data = await api.getHistory();
            dispatch(setHistory(data));
            dispatch(setLoading(false));
        } catch (e) {
            dispatch(setError(e.response?.data?.message || e.message));
            dispatch(setLoading(false));
        }
    };

    const addHistoryItem = async (query, type = "search") => {
        if (!user || !query.trim()) return;
        try {
            const data = await api.createHistory(query, type);
            dispatch(addReduxHistory(data));
            return { success: true, data };
        } catch (e) {
            console.error("Failed to add history item:", e);
            return { success: false, error: e };
        }
    };

    const clearAllHistory = async () => {
        if (!user) return;
        dispatch(setLoading(true));
        try {
            await api.clearHistory();
            dispatch(clearHistoryState());
            dispatch(setLoading(false));
            return { success: true };
        } catch (e) {
            dispatch(setError(e.response?.data?.message || e.message));
            dispatch(setLoading(false));
            return { success: false, error: e };
        }
    };

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    return { historyItems, loading, error, addHistoryItem, fetchHistory, clearAllHistory };
};
