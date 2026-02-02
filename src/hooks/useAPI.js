import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useAPI = (endpoint, enabled = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(endpoint);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    getData();
  }, [getData]);

  return { data, loading, error, refetch: getData };
};

export default useAPI;
