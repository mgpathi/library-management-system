/**
 * Custom hooks
 */

import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from '../store/slices/uiSlice';
import { toast } from 'react-toastify';

/**
 * useAsync hook - Handle async operations
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  useState(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};

/**
 * useApi hook - Make API calls
 */
export const useApi = () => {
  const dispatch = useDispatch();
  const [loading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (apiCall, options = {}) => {
    try {
      setApiLoading(true);
      setError(null);
      dispatch(setLoading(true));

      const response = await apiCall();

      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      setApiLoading(false);
      dispatch(setLoading(false));

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);

      if (options.showError !== false) {
        toast.error(errorMessage);
      }

      setApiLoading(false);
      dispatch(setLoading(false));

      throw err;
    }
  }, [dispatch]);

  return { makeRequest, loading, error };
};

/**
 * useDebounce hook - Debounce values
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default {
  useAsync,
  useApi,
  useDebounce,
};
