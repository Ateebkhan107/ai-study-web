import axios, { AxiosError } from 'axios';
import { useAuth } from '@clerk/expo';
import { useEffect, useMemo } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://prepzii.com';

export const createApiClient = (token: string | null) => {
  const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    api.interceptors.request.use((config) => {
      config.headers.set('Authorization', `Bearer ${token}`);
      return config;
    });
  }

  return api;
};

// React hook to use the API client
export function useApi() {
  const { getToken } = useAuth();
  
  return useMemo(() => {
    return {
      fetch: async (endpoint: string, options?: any) => {
        const token = await getToken();
        console.log(`[mobile API] Fetched token: ${token ? 'YES (' + token.substring(0, 10) + '...)' : 'NO'}`);
        const client = createApiClient(token);
        
        try {
          const response = await client(endpoint, options);
          console.log(`[mobile API] Response status: ${response.status}`);
          return { data: response.data, error: null };
        } catch (error) {
          const axiosError = error as AxiosError;
          console.log(`[mobile API] Error name: ${axiosError.name}`);
          console.log(`[mobile API] Error code: ${axiosError.code}`);
          console.log(`[mobile API] Error message: ${axiosError.message}`);
          console.log(`[mobile API] Error status: ${axiosError.response?.status}`);
          return { 
            data: null, 
            error: axiosError.response?.data || axiosError.message 
          };
        }
      },
    };
  }, []); // Remove getToken dependency to avoid infinite loops
}
