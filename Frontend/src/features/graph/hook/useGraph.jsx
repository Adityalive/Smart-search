import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth';
import { getGraphData as apiGetGraphData, getRelatedItems as apiGetRelated, semanticSearch as apiSearch } from '../services/graph.api.jsx';
import { setGraphData, setLoading, setError } from '../graphSlice';

export const useGraph = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const { graphData, loading, error } = useSelector((state) => state.graph);

  const fetchGraph = async () => {
    dispatch(setLoading(true));
    try {
      const data = await apiGetGraphData();
      dispatch(setGraphData(data || { nodes: [], links: [] }));
      dispatch(setLoading(false));
    } catch (e) {
      dispatch(setError(e.response?.data?.message || e.message));
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      fetchGraph();
    }
  }, [user]);

  // Utility to fetch related item explicitly (not stored in Redux for modularity per item UI)
  const getRelated = async (itemId) => {
      try {
          return await apiGetRelated(itemId);
      } catch (err) {
          console.error("Failed to fetch related items", err);
          return { items: [] };
      }
  }

  const searchItems = async (query) => {
      try {
          return await apiSearch(query);
      } catch (err) {
          console.error("Search failed", err);
          return { items: [] };
      }
  }

  return { graphData, loading, error, fetchGraph, getRelated, searchItems };
};
