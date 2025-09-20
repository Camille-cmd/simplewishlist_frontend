import axios from "axios"

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

// Function to set the authorization token for API calls
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
}

// Function to get current auth token from new localStorage structure
export const getCurrentAuthToken = (): string | null => {
    try {
        const currentWishlistId = localStorage.getItem('current-wishlist-id');
        if (!currentWishlistId) return null;

        const selections = localStorage.getItem('wishlist-user-selections');
        if (!selections) return null;

        const parsed = JSON.parse(selections);
        const selection = parsed[currentWishlistId];
        return selection?.userToken || null;
    } catch (error) {
        console.error('Error getting current auth token:', error);
        return null;
    }
}

// Set up interceptor to automatically include auth token in requests
api.interceptors.request.use(
    (config) => {
        const token = getCurrentAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
