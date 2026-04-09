import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

// params is an optional object e.g. { range: "week" }
// Changing params triggers a re-fetch automatically
const useFetch = (endpoint, params = {}) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Serialise params so useCallback re-creates when they change
  const paramKey = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useFetch;
