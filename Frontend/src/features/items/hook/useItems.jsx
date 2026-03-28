import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth';
import { saveItem as apiSaveItem, getItems as apiGetItems } from '../services/items.api.jsx';
import { setItems, addItem as addReduxItem, setLoading, setError } from '../itemsSlice';

export const useItems = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Select items, loading, and error from the Redux store
  const { items, loading, error } = useSelector((state) => state.items);

  const fetchItems = async () => {
    dispatch(setLoading(true));
    try {
      const data = await apiGetItems();
      dispatch(setItems(data.items || []));
      dispatch(setLoading(false));
    } catch (e) {
      dispatch(setError(e.response?.data?.message || e.message));
      dispatch(setLoading(false));
    }
  };

  const addItem = async (formData) => {
    dispatch(setLoading(true));
    try {
      const data = await apiSaveItem(formData);
      dispatch(addReduxItem(data.item));
      dispatch(setLoading(false));
      return { success: true };
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Failed to save item";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return { success: false, error: e };
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  return { items, loading, error, addItem, fetchItems };
};
