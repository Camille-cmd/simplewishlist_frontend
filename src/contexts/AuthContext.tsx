import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {setAuthToken} from '../api/axiosConfig.tsx';

interface WishlistUserSelection {
    userToken: string;
    selectedAt: string;
    wishlistName?: string;
}

interface WishlistUserSelections {
    [wishlistId: string]: WishlistUserSelection;
}

interface AuthContextType {
    userToken: string | null;
    wishlistId: string | null;
    setAuth: (wishlistId: string, token: string, wishlistName?: string) => void;
    clearAuth: (wishlistId?: string) => void;
    isAuthenticated: boolean;
    isAuthenticatedForWishlist: (wishlistId: string) => boolean;
    switchToWishlist: (wishlistId: string) => boolean;
    updateWishlistName: (wishlistId: string, newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [wishlistId, setWishlistId] = useState<string | null>(null);

    // Helper functions for managing wishlist-specific user selections
    const getWishlistUserSelections = (): WishlistUserSelections => {
        try {
            const stored = localStorage.getItem('wishlist-user-selections');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error parsing wishlist user selections:', error);
            return {};
        }
    };

    const setWishlistUserSelection = (wishlistId: string, userToken: string, wishlistName?: string) => {
        const selections = getWishlistUserSelections();
        selections[wishlistId] = {
            userToken,
            selectedAt: new Date().toISOString(),
            wishlistName
        };
        setUserToken(userToken)
        setWishlistId(wishlistId)
        localStorage.setItem('wishlist-user-selections', JSON.stringify(selections));
    };

    const getWishlistUserSelection = (wishlistId: string): WishlistUserSelection | null => {
        const selections = getWishlistUserSelections();
        return selections[wishlistId] || null;
    };

    const removeWishlistUserSelection = (wishlistId: string) => {
        const selections = getWishlistUserSelections();
        delete selections[wishlistId];
        localStorage.setItem('wishlist-user-selections', JSON.stringify(selections));
    };

    useEffect(() => {
        // Load current wishlist from localStorage
        const currentWishlistId = localStorage.getItem('current-wishlist-id');

        if (currentWishlistId) {
            const selection = getWishlistUserSelection(currentWishlistId);
            if (selection) {
                try {
                    setUserToken(selection.userToken);
                    setWishlistId(currentWishlistId);
                    // For API calls
                    setAuthToken(selection.userToken);
                } catch (error) {
                    console.error('Error loading wishlist user selection:', error);
                    clearAuth();
                }
            }
        }
    }, []);

    const setAuth = (wishlistId: string, token: string, wishlistName?: string) => {
        setUserToken(token);
        setWishlistId(wishlistId);

        // Set the auth token for API calls
        setAuthToken(token);

        // Store per-wishlist user selection
        setWishlistUserSelection(wishlistId, token, wishlistName);

        // Update current active wishlist
        localStorage.setItem('current-wishlist-id', wishlistId);
    };

    const clearAuth = (specificWishlistId?: string) => {
        if (specificWishlistId) {
            // Clear auth for specific wishlist only
            removeWishlistUserSelection(specificWishlistId);

            // If clearing current active wishlist, reset state
            if (wishlistId === specificWishlistId) {
                setUserToken(null);
                setWishlistId(null);
                setAuthToken(null);
                localStorage.removeItem('current-wishlist-id');
            }
        } else {
            // Clear all auth data
            setUserToken(null);
            setWishlistId(null);
            setAuthToken(null);

            // Clear all localStorage
            localStorage.removeItem('wishlist-user-selections');
            localStorage.removeItem('current-wishlist-id');
        }
    };

    const isAuthenticated = !!userToken;

    const isAuthenticatedForWishlist = (targetWishlistId: string): boolean => {
        const selection = getWishlistUserSelection(targetWishlistId);
        return !!selection;
    };

    const switchToWishlist = (targetWishlistId: string): boolean => {
        // Select a different wishlist from the same user in the storage
        const selection = getWishlistUserSelection(targetWishlistId);
        if (selection) {
            setUserToken(selection.userToken);
            setWishlistId(targetWishlistId);
            setAuthToken(selection.userToken);
            localStorage.setItem('current-wishlist-id', targetWishlistId);
            return true;
        }
        return false;
    };

    const updateWishlistName = (wishlistId: string, newName: string) => {
        const selections = getWishlistUserSelections();
        if (selections[wishlistId]) {
            selections[wishlistId] = {
                ...selections[wishlistId],
                wishlistName: newName
            };
            localStorage.setItem('wishlist-user-selections', JSON.stringify(selections));
        }
    };

    const value: AuthContextType = {
        userToken,
        wishlistId,
        setAuth,
        clearAuth,
        isAuthenticated,
        isAuthenticatedForWishlist,
        switchToWishlist,
        updateWishlistName,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
