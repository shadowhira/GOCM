import axios from "axios";
import { cookieUtils } from "./cookies";

// Xác định baseURL từ biến môi trường hoặc mặc định
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5171";
const normalizedBase =
  API_BASE.replace(/\/+$/, ""); // remove trailing slash if any
const baseURL = `${normalizedBase}/api`;

// Tạo instance mặc định
const httpClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request
httpClient.interceptors.request.use(
  async (config) => {
    let token: string | null = null;

    if (typeof window === 'undefined') {
      // SSR: Try to get token from Next.js cookies
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        token = cookieStore.get('auth-token')?.value || null;
      } catch {
        // Fallback: Not available in some contexts
        token = null;
      }
    } else {
      // CSR: Get token from cookies using js-cookie
      token = cookieUtils.getToken();
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
httpClient.interceptors.response.use(
  (response) => response.data, // Trả về trực tiếp data thay vì cả response
  (error) => {
    const status = error.response?.status;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      // Only handle in browser environment
      if (typeof window !== 'undefined') {
        // Clear token from cookies
        cookieUtils.removeToken();
        
        // Clear auth store
        const authStoreString = localStorage.getItem("auth-store");
        if (authStoreString) {
          try {
            const authStore = JSON.parse(authStoreString);
            localStorage.setItem(
              "auth-store",
              JSON.stringify({
                ...authStore,
                state: {
                  ...authStore.state,
                  user: null,
                  token: null,
                  isAuthenticated: false,
                },
              })
            );
          } catch (e) {
            console.error("Error handling auth clear:", e);
          }
        }

        // Redirect to login if we're not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // Handle 403 Forbidden - redirect to forbidden page
    if (status === 403 && typeof window !== 'undefined') {
      window.location.href = "/forbidden";
    }

    return Promise.reject(error);
  }
);

export default httpClient;
