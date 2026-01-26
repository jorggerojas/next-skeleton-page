import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// Create axios instance with default config
const client: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEXT_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Export typed request methods
export const apiClient = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return client.get<T>(url, config);
  },

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return client.post<T>(url, data, config);
  },

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return client.put<T>(url, data, config);
  },

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return client.patch<T>(url, data, config);
  },

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return client.delete<T>(url, config);
  },
};

// Export the raw client for advanced usage
export { client };
export default apiClient;
