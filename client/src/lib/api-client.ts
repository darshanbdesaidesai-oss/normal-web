import { supabase } from "./supabase.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export class ApiError extends Error {
  code: string;
  details?: unknown;
  status: number;

  constructor(message: string, code: string = "API_ERROR", status: number = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function getAuthToken(): Promise<string | null> {
  // First check active Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return session.access_token;
  }

  // Fallback to local storage for demo or dev mode
  const localDevToken = localStorage.getItem("agrisage_dev_token");
  if (localDevToken) {
    return localDevToken;
  }

  return null;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...customOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = await getAuthToken();

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = json?.error?.message || response.statusText || "Request failed";
      const errorCode = json?.error?.code || `HTTP_${response.status}`;
      throw new ApiError(errorMessage, errorCode, response.status, json?.error?.details);
    }

    return json;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error connecting to AgriSage Server";
    throw new ApiError(message, "NETWORK_ERROR", 0);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<{ success: boolean; data: T; pagination?: unknown }>(endpoint, { method: "GET", ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<{ success: boolean; data: T; message?: string }>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<{ success: boolean; data: T; message?: string }>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<{ success: boolean; data: T; message?: string }>(endpoint, { method: "DELETE", ...options }),

  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    apiClient<{ success: boolean; data: T; message?: string }>(endpoint, {
      method: "POST",
      body: formData,
      ...options,
    }),
};
