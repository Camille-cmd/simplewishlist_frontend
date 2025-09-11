import {useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {Alert, Container, Spinner} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {api} from "../api/axiosConfig.tsx";
import {useAuth} from "../contexts/AuthContext.tsx";
import {WishlistUsersResponse} from "../interfaces/Wishlist";


/**
 * Component for user selection when accessing a wishlist by ID
 * Allows users to choose who they are from the list of wishlist participants
 */
export default function UserSelection() {
    const {t} = useTranslation();
    const {wishlistId} = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {setAuth, clearAuth, isAuthenticatedForWishlist, switchToWishlist} = useAuth();

    const [wishlistData, setWishlistData] = useState<WishlistUsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authenticating, setAuthenticating] = useState<string | null>(null);

    // Check if this is a forced user selection (switching users)
    const isForceSelection = searchParams.get('switch') === 'true';

    /**
     * Check if user is already authenticated for this wishlist (only if not forcing selection)
     */
    const isUserAuthenticatedForWishlist = (): boolean => {
        return wishlistId ? isAuthenticatedForWishlist(wishlistId) && !isForceSelection : false;
    };

    /**
     * Load wishlist users from the API
     */
    const loadWishlistUsers = async (): Promise<void> => {
        if (!wishlistId) return;

        try {
            const response = await api.get(`/wishlist/${wishlistId}/users`);
            setWishlistData(response.data as WishlistUsersResponse);

            // If user is already authenticated for this wishlist and not forcing selection, switch and redirect
            if (isUserAuthenticatedForWishlist()) {
                switchToWishlist(wishlistId);
                navigate(`/wishlist/${wishlistId}/view`, {replace: true});
                return;
            }

            setLoading(false);
        } catch (err) {
            setError(t('userSelection.errorLoadingUsers'));
            setLoading(false);
        }
    };

    /**
     * Authenticate as a selected user
     */
    const authenticateUser = async (userId: string): Promise<void> => {
        if (!wishlistId) return;

        setAuthenticating(userId);

        try {
            const response = await api.post(`/wishlist/${wishlistId}/authenticate`, {
                userId: userId
            });

            const userData = response.data;

            setAuth(wishlistId, userData.id, wishlistData?.wishlistName);

            // Navigate to wishlist view
            navigate(`/wishlist/${wishlistId}/view`, {replace: true});
        } catch (err) {
            setError(t('userSelection.errorAuthenticating'));
            setAuthenticating(null);
        }
    };

    /**
     * Handle user selection
     */
    const handleUserSelect = (userId: string): void => {
        // Clear any existing auth if this is a user switch
        if (isForceSelection) {
            clearAuth();
        }
        authenticateUser(userId);
    };

    // Load wishlist users on mounts
    useEffect(() => {
        if (wishlistId) {
            loadWishlistUsers();
        }
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "50vh"}}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">{t('common.loading')}</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>{t('common.error')}</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    if (!wishlistData) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    {t('userSelection.noWishlistData')}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="wishlist-container">
                <div className="text-center mb-4">
                    <h1 className="wishlist-title">{wishlistData.wishlistName}</h1>
                    <p className="mb-0">
                        {isForceSelection
                            ? t('userSelection.switchingUser')
                            : t('userSelection.selectUser')
                        }
                    </p>
                </div>

                <div className="row g-4 flex-column flex-md-row justify-content-center">
                    {wishlistData.users.map((user) => (
                        <div key={user.id} className="col-md-6 col-lg-4">
                            <div
                                className={`user-selection-card ${authenticating === user.id ? 'authenticating' : ''}`}
                                style={{cursor: authenticating ? 'wait' : 'pointer'}}
                                onClick={() => authenticating ? null : handleUserSelect(user.id)}
                            >
                                <div className="card-body text-center">
                                    {authenticating === user.id ? (
                                        <Spinner animation="border" size="sm" className="text-primary"/>
                                    ) : (
                                        <h5 className="card-title">
                                            {user.name}
                                        </h5>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isForceSelection && (
                    <div className="text-center mt-4">
                        <p className="text-muted small">
                            {t('userSelection.choiceWillBeRemembered')}
                        </p>
                    </div>
                )}
            </div>
        </Container>
    );
}
