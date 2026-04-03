import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const useFetch = (endpoint) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError("Session expired. Please log in again.");
      else if (status === 403) setError("You don't have permission to view this.");
      else if (!err.response) setError("Cannot reach the server. It may be starting up.");
      else setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useFetch;
