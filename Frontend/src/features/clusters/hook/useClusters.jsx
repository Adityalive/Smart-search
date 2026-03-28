import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth';
import { getClusters as apiGetClusters } from '../services/clusters.api.jsx';
import { setClusters, setLoading, setError } from '../clustersSlice';

export const useClusters = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const { clusters, loading, error } = useSelector((state) => state.clusters);

  const fetchClusters = async () => {
    dispatch(setLoading(true));
    try {
      const data = await apiGetClusters();
      dispatch(setClusters(data.clusters || []));
      dispatch(setLoading(false));
    } catch (e) {
      dispatch(setError(e.response?.data?.message || e.message));
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      fetchClusters();
    }
  }, [user]);

  return { clusters, loading, error, fetchClusters };
};
