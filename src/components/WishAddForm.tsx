import {Formik} from "formik";
import {api} from "../api/axiosConfig.tsx";
import {Button, Form} from "react-bootstrap";
import {t} from "i18next";
import {useNavigate, useParams} from "react-router-dom";
import "../assets/wish.css"
import {WishAddFormValues} from "../interfaces/WishAddFormValues";


/**
 * Component to create a new wish
 * @constructor
 */
export default function WishAddForm() {
    const {userToken} = useParams();
    const navigate = useNavigate();

    const initialValues =
        {
            name: '',
            price: '',
            url: ''
        }

    /**
     * Handle the form submission to create the wish
     * @param values
     */
    const handleSubmit = (values: WishAddFormValues) => {
        // Api call to create the wishlist
        api.put('/wish', values, {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 201) {
                navigate(`/link/${userToken}`);
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    return (
        <div className="container add-wish-form">
            <h1 className="mb-5">{t('createWish.pageTitle')} 💫</h1>
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
                        <Button variant="primary" type="submit" disabled={props.isSubmitting}
                                className="btn-custom mt-3 w-50 align-self-end">
                            {t('createWish.buttons.submit')}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
