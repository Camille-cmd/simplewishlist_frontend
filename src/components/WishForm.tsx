import {Formik} from "formik";
import {Button, Form, Stack} from "react-bootstrap";
import {t} from "i18next";
import "../assets/wish.css"
import {WishAddFormValues} from "../interfaces/WishAddFormValues";
import {Wish, WishListData} from "../interfaces/WishListData";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {WebSocketSendMessage} from "../interfaces/Websocket";
import * as Yup from "yup";
import {useAuth} from "../contexts/AuthContext.tsx";
import {api} from "../api/axiosConfig.tsx";
import {WishlistUsersResponse} from "../interfaces/Wishlist";

interface WishFormProps {
    initialWish: Wish | undefined,
    setEditWish: Dispatch<SetStateAction<Wish | undefined>>,
    setShowWishForm: Dispatch<SetStateAction<boolean>>,
    sendJsonMessage: (message: WebSocketSendMessage) => void,
    isSuggestionMode: boolean,
    setIsSuggestionMode: Dispatch<SetStateAction<boolean>>,
    wishlistData: WishListData
}


/**
 * Component to create a new wish
 * @constructor
 */
export default function WishForm(
    {
        initialWish,
        setEditWish,
        setShowWishForm,
        sendJsonMessage,
        isSuggestionMode,
        setIsSuggestionMode,
        wishlistData
    }: Readonly<WishFormProps>
) {
    const {userToken} = useAuth();
    // Check if the form is used to update a wish or to create a new one
    const isUpdating = !!initialWish

    const [wishlistUsers, setWishlistUsers] = useState<WishlistUsersResponse | null>(null);

    // Fetch wishlist users with IDs for the suggestion dropdown
    useEffect(() => {
        if (isSuggestionMode) {
            const fetchUsers = async () => {
                try {
                    const response = await api.get(`/wishlist/${wishlistData.wishlistId}/users`);
                    setWishlistUsers(response.data as WishlistUsersResponse);
                } catch (error) {
                    console.error("Error fetching wishlist users:", error);
                }
            };
            fetchUsers();
        }
    }, [isSuggestionMode, wishlistData.wishlistId]);

    // Get other users (excluding current user) for the suggestion dropdown
    const otherUsers = wishlistUsers?.users.filter(user => user.name !== wishlistData.currentUser) || [];

    const initialValues =
        {
            name: initialWish?.name ?? '',
            price: initialWish?.price ?? '',
            url: initialWish?.url ?? '',
            description: initialWish?.description ?? '',
            suggestedForUserId: ''
        }


    const validationSchema = () => {
        return Yup.object().shape({
            url: Yup.string()
                .url(t("errors.wishUrl.correctUrl"))
                .max(200, t("errors.wishUrl.maxLength")),
            name: Yup.string()
                .required(t("errors.wishName.required"))
                .nullable(t("errors.wishName.required")),
            price: Yup.string().max(15, t("errors.wishPrice.maxChar")),
            suggestedForUserId: isSuggestionMode
                ? Yup.string().required(t("suggestWish.selectUserRequired"))
                : Yup.string()
        });
    }


    /**
     * Handle the form submission to create the wish
     * @param values
     */
    const handleCreateWish = (values: WishAddFormValues) => {
        // Create via Websocket
        sendJsonMessage({
            type: 'create_wish',
            currentUser: userToken,
            postValues: values,
            objectId: null
        } as WebSocketSendMessage)
    }

    /**
     * Handle the form submission to update the wish
     * @param values
     */
    const handleUpdateWish = (values: WishAddFormValues) => {
        // Update via Websocket
        sendJsonMessage({
            type: 'update_wish',
            currentUser: userToken,
            postValues: values,
            objectId: initialWish?.id
        } as WebSocketSendMessage)

    }

    /**
     * Handle the form submission to delete the wish
     */
    const handleDelete = () => {
        // Update via Websocket
        sendJsonMessage({
            type: 'delete_wish',
            currentUser: userToken,
            postValues: null,
            objectId: initialWish?.id
        } as WebSocketSendMessage)
    }


    /**
     * Handle the form submission to dispatch between create and update
     * @param values
     */
    const handleSubmit = (values: WishAddFormValues) => {
        if (isUpdating) {
            handleUpdateWish(values)
        } else {
            handleCreateWish(values)
        }
    }

    /**
     * Handle the return to the wishlist, close the form and stop editing if needed
     */
    const handleReturnToWishlist = () => {
        if (isUpdating) {
            setEditWish(undefined)
        }
        setShowWishForm(false)
        // Reset suggestion mode
        if (isSuggestionMode) {
            setIsSuggestionMode(false)
        }
    }

    return (
        <>
            <Stack direction="horizontal" gap={3} className={"mt-3"}>
                <Button
                    as="input"
                    type="button"
                    value={t("createWish.buttons.returnToWishlist")}
                    variant="outline-dark"
                    onClick={handleReturnToWishlist}
                />
                {isUpdating
                    ? <Button variant="danger" className={"ms-auto mx-5"}
                              onClick={handleDelete}>{t('editWish.buttons.delete')}</Button>
                    : null
                }
            </Stack>

            {/* FORM */}
            <div className="container add-wish-form">
                <h1 className="my-2">
                    {isUpdating
                        ? t('editWish.pageTitle')
                        : isSuggestionMode
                            ? t('suggestWish.pageTitle') + ' 🎁'
                            : t('createWish.pageTitle')} 💫
                </h1>
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema()}
                >
                    {props => (

                        <Form onSubmit={props.handleSubmit} className="d-flex flex-column">

                            {/* User selector for suggestion mode */}
                            {isSuggestionMode && !isUpdating && (
                                <Form.Group className="mb-3" controlId="suggestedForUserId">
                                    <Form.Label>{t('suggestWish.selectUser')}</Form.Label>
                                    <Form.Select
                                        name="suggestedForUserId"
                                        value={props.values.suggestedForUserId}
                                        onChange={props.handleChange}
                                        isInvalid={!!(props.touched.suggestedForUserId && props.errors.suggestedForUserId)}
                                    >
                                        <option value="">{t('suggestWish.selectUserPlaceholder')}</option>
                                        {otherUsers.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {props.errors.suggestedForUserId}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3" controlId="wishName">
                                <Form.Label>{t('createWish.name')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={props.values.name}
                                    onChange={props.handleChange}
                                    placeholder={t('createWish.placeholders.name')}
                                    isInvalid={!!(props.touched.name && props.errors.name)}
                                />
                                <Form.Control.Feedback type="invalid">{props.errors.name}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="wishPrice">
                                <Form.Label>{t('createWish.price')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="price"
                                    value={props.values.price}
                                    onChange={props.handleChange}
                                    placeholder={t('createWish.placeholders.price')}
                                    isInvalid={!!(props.touched.name && props.errors.price)}
                                />
                                <Form.Control.Feedback type="invalid">{props.errors.price}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="wishUrl">
                                <Form.Label>{t('createWish.url')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="url"
                                    value={props.values.url}
                                    onChange={props.handleChange}
                                    placeholder={t('createWish.placeholders.url')}
                                    isInvalid={!!(props.touched.name && props.errors.url)}
                                />
                                <Form.Control.Feedback type="invalid">{props.errors.url}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="wishUrl">
                                <Form.Label>{t('createWish.description')}</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={props.values.description}
                                    onChange={props.handleChange}
                                    placeholder={t('createWish.placeholders.description')}
                                    isInvalid={!!(props.touched.name && props.errors.description)}
                                />
                                <Form.Control.Feedback type="invalid">{props.errors.description}</Form.Control.Feedback>
                            </Form.Group>

                            {/*SUBMIT FORM */}
                            <Button variant="primary" type="submit" disabled={props.isValidating}
                                    className="btn-custom mt-3 w-md-50 align-self-end">
                                {isUpdating ? t('editWish.buttons.submit') : t('createWish.buttons.submit')}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    )
}
