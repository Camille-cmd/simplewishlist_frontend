import {Formik} from "formik";
import {api} from "../api/axiosConfig.tsx";
import {Button, Form, Stack} from "react-bootstrap";
import {t} from "i18next";
import {useParams} from "react-router-dom";
import "../assets/wish.css"
import {WishAddFormValues} from "../interfaces/WishAddFormValues";
import {Wish} from "../interfaces/WishListData";
import {Dispatch, SetStateAction} from "react";
import {WebSocketSendMessage} from "../interfaces/Websocket";

interface WishFormProps {
    initialWish: Wish | undefined,
    setEditWish: Dispatch<SetStateAction<Wish | undefined>>,
    setShowWishForm: Dispatch<SetStateAction<boolean>>,
    sendJsonMessage: (message: any) => void
}
/**
 * Component to create a new wish
 * @constructor
 */
export default function WishForm({initialWish, setEditWish, setShowWishForm, sendJsonMessage}  : Readonly<WishFormProps>){
    const {userToken} = useParams();
    const isUpdating = !!initialWish

    const initialValues =
        {
            name: initialWish?.name ?? '',
            price: initialWish?.price ?? '',
            url: initialWish?.url ?? '',
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
            post_values: values,
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
            post_values: values,
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
            post_values: null,
            objectId: initialWish?.id
        } as WebSocketSendMessage)
    }

    const handleSubmit = (values: WishAddFormValues) => {
        if (isUpdating){
            handleUpdateWish(values)
        }else {
            handleCreateWish(values)
        }
    }

    const handleReturnToWishlist = () => {
        if (isUpdating){
            setEditWish(undefined)
        }
        setShowWishForm(false)
    }

    return (
        <>
        <Stack direction="horizontal" gap={3} className={"mt-3"}>
            <Button
                as="input"
                type="button"
                value="Return to wishlist"
                variant="outline-dark"
                onClick={handleReturnToWishlist}
            />
            {isUpdating
                ? <Button variant="danger" className={"ms-auto mx-5"} onClick={handleDelete} disabled={initialWish?.assigned_user != null}>Delete the wish</Button>
                : null
            }
        </Stack>
        <div className="container add-wish-form">
            <h1 className="mb-5">{isUpdating ? t('editWish.pageTitle') : t('createWish.pageTitle')} 💫</h1>
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {props => (

                    <Form onSubmit={props.handleSubmit} className="d-flex flex-column">

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


                        {/*SUBMIT FORM */}
                        <Button variant="primary" type="submit" disabled={props.isSubmitting} className="btn-custom mt-3 w-50 align-self-end">
                            {isUpdating ? t('editWish.buttons.submit') : t('createWish.buttons.submit')}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
        </>
    )
}
