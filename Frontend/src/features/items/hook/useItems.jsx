import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hook/useAuth';
import { saveItem as apiSaveItem, getItems as apiGetItems } from '../services/items.api.jsx';

export const useItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await apiGetItems();
      setItems(data.items || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (formData) => {
    setLoading(true);
    try {
      const data = await apiSaveItem(formData);
      setItems(prev => [data.item, ...prev]);
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save item");
      return { success: false, error: e };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  return { items, loading, error, addItem, fetchItems };
};
