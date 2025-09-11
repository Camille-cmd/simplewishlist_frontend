import React from 'react';
import {Badge, Stack} from 'react-bootstrap';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {useVisitedWishlists} from '../utils/useVisitedWishlists';

const VisitedWishlists: React.FC = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const {switchToWishlist} = useAuth();
    const {visitedWishlists, formatLastVisited} = useVisitedWishlists();

    // Hide component if we're on a wishlist page
    if (location.pathname.includes('/wishlist/')) {
        return null;
    }

    const handleEnterWishlist = (wishlistId: string) => {
        const success = switchToWishlist(wishlistId);
        if (success) {
            window.location.href = `/wishlist/${wishlistId}`;
        } else {
            // Fallback if no stored credentials - redirect to user selection
            window.location.href = `/wishlist/${wishlistId}`;
        }
    };

    if (visitedWishlists.length === 0) {
        return null; // Don't show the section if no wishlists are found
    }

    return (
        <div className="recent-wishlists-container">
            <Stack direction="horizontal" gap={2} className="align-items-center justify-content-center flex-wrap">
                <span className="recent-wishlists-label">
                    🕒 {t('welcomePage.visitedWishlists.title')}:
                </span>
                {visitedWishlists.map((wishlist) => (
                    <Badge
                        key={wishlist.wishlistId}
                        pill
                        className="recent-wishlist-pill"
                        role="button"
                        onClick={() => handleEnterWishlist(wishlist.wishlistId)}
                        title={`${t('welcomePage.visitedWishlists.lastVisited')}: ${formatLastVisited(wishlist.selectedAt)}`}
                    >
                        {wishlist.name || `Wishlist #${wishlist.wishlistId.slice(-8)}`}
                    </Badge>
                ))}
            </Stack>
        </div>
    );
};

export default VisitedWishlists;
