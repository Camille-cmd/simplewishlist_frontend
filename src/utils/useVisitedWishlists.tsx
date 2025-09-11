import { useState, useEffect, useCallback } from 'react';

interface VisitedWishlist {
    wishlistId: string;
    selectedAt: string;
    name?: string;
}

interface WishlistUserSelection {
    userToken: string;
    selectedAt: string;
    wishlistName?: string;
}

interface WishlistUserSelections {
    [wishlistId: string]: WishlistUserSelection;
}

export const useVisitedWishlists = () => {
    const [visitedWishlists, setVisitedWishlists] = useState<VisitedWishlist[]>([]);

    const getVisitedWishlists = (): VisitedWishlist[] => {
        try {
            const stored = localStorage.getItem('wishlist-user-selections');
            if (!stored) return [];

            const selections: WishlistUserSelections = JSON.parse(stored);
            
            // Convert to array and sort by most recently visited
            return Object.entries(selections)
                .map(([wishlistId, selection]) => ({
                    wishlistId,
                    selectedAt: selection.selectedAt,
                    name: selection.wishlistName
                }))
                .sort((a, b) => new Date(b.selectedAt).getTime() - new Date(a.selectedAt).getTime())
                .slice(0, 5); // Limit to 5 most recent
        } catch (error) {
            console.error('Error parsing visited wishlists:', error);
            return [];
        }
    };

    const refreshVisitedWishlists = useCallback(() => {
        const wishlists = getVisitedWishlists();
        setVisitedWishlists(wishlists);
    }, []);

    useEffect(() => {
        refreshVisitedWishlists();

        // Listen for localStorage changes from other tabs
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'wishlist-user-selections') {
                refreshVisitedWishlists();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [refreshVisitedWishlists]);

    const formatLastVisited = (selectedAt: string): string => {
        const date = new Date(selectedAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return {
        visitedWishlists,
        refreshVisitedWishlists,
        formatLastVisited
    };
};