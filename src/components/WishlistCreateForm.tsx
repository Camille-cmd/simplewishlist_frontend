import {Button, Form, Spinner} from "react-bootstrap";
import '../assets/wishlistcreate.css'
import {FieldArray, Formik} from 'formik';
import {PersonX, PlusCircle} from "react-bootstrap-icons";
import {useTranslation} from "react-i18next";
import * as Yup from "yup";
import {TFunction} from "i18next";
import {FormValues} from "../interfaces/WlCreateFormValues";

/**
 * Interface for the props of the WishlistCreateForm component
 */
interface WishlistCreateFormChildProps {
   handleSubmit: (values: FormValues) => void
}

/**
 * Create the validation schema for the wishlist creation form
 * @param t
 */
const createWLValidationSchema = (t: TFunction<"translation">) => Yup.object().shape({
    wishlist_name: Yup.string()
        .required(t('errors.wishlistName.required')),
    wishlist_admin_name: Yup.string()
        .required(t('errors.wishlistAdminName.required')),
    // TODO prendre en compte le wishlist_admin_name dans la liste des autres utilisateurs
    other_users_names: Yup.array()
        .required(t('errors.otherUsersNames.required'))
        .of(Yup.string())
        .test(
            'unique',
            t('errors.otherUsersNames.noDuplicate'),
            (value: (string | undefined)[]) => value ? value.length === new Set(value)?.size : true
        )
});


/**
 * Component to display the wishlist creation form
 * @param handleSubmit
 * @constructor
 */
export default function WishlistCreateForm({handleSubmit}: Readonly<WishlistCreateFormChildProps>) {
    const {t} = useTranslation();

    const initialValues =
        {
            wishlist_name: '',
            wishlist_admin_name: '',
            allow_see_assigned: false,
            other_users_names: [''],
        }

    // We need to pass translation to the validation schema
    const validationSchema = () => createWLValidationSchema(t)

    return (
        <>

            <h1 className='bold'> {t('createWL.title')} </h1>

            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
            >
                {props => (

                    <Form onSubmit={props.handleSubmit}>

                        {/* WISHLIST NAME*/}
                        <Form.Group className="mb-3" controlId="wishlistName">
                            <Form.Label>{t('createWL.wishlistName')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="wishlist_name"
                                value={props.values.wishlist_name}
                                onChange={props.handleChange}
                                placeholder={t('createWL.placeholders.wishlistName')}
                                isInvalid={!!(props.touched.wishlist_name && props.errors.wishlist_name)}
                            />
                            <Form.Control.Feedback
                                type="invalid">{props.errors.wishlist_name}</Form.Control.Feedback>
                        </Form.Group>

                        {/* WISHLIST ADMIN NAME*/}
                        <Form.Group className="mb-3" controlId="wishlistAdminName">
                            <Form.Label>{t('createWL.wishlistAdminName')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="wishlist_admin_name"
                                value={props.values.wishlist_admin_name}
                                onChange={props.handleChange}
                                placeholder={t('createWL.placeholders.wishlistAdminName')}
                                isInvalid={!!(props.touched.wishlist_admin_name && props.errors.wishlist_admin_name)}
                            />
                            <Form.Control.Feedback
                                type="invalid">{props.errors.wishlist_admin_name}</Form.Control.Feedback>
                        </Form.Group>

                        {/* ALLOW SEE ASSIGNED USERS CHECKBOX*/}
                        <Form.Check
                            type='switch'
                            id="surprise-mode"
                            label={t('createWL.allowSeeAssigned', {checked: props.values.allow_see_assigned ? '🐵' : '🙈'})}
                            name='allow_see_assigned'
                            onChange={props.handleChange}
                        />

                        {/* ADD OTHER USERS*/}
                        <Form.Group className="mb-3" controlId="wishlistOtherUsersName">
                            <h2 className='bold'>{t('createWL.otherUserName')}</h2>

                            <FieldArray
                                name="other_users_names"
                                render={arrayHelpers => (
                                    <div>
                                        {
                                            props.values.other_users_names.map((other_user_name: string, index: number) => (
                                                // Use index as Key, the list can not be reordered
                                                <div key={index} className="d-flex flex-md-row">
                                                    <Form.Control
                                                        className="mb-3"
                                                        type="text"
                                                        name={`other_users_names.${index}`}
                                                        placeholder={t('createWL.placeholders.otherUserName')}
                                                        value={other_user_name}
                                                        onChange={props.handleChange}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                arrayHelpers.push('');
                                                            }
                                                        }}
                                                        isInvalid={!!(props.touched.other_users_names && props.errors.other_users_names)}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{props.errors.other_users_names}</Form.Control.Feedback>

                                                    {/*REMOVE */}
                                                    <button type="button" className="btn" onClick={() => arrayHelpers.remove(index)}>
                                                        <PersonX/>
                                                    </button>

                                                </div>
                                            ))
                                        }

                                        {/* ADD ANOTHER */}
                                        <button type="button" className="btn" onClick={() => arrayHelpers.push('')}>
                                            <PlusCircle/> {t('createWL.buttons.addAnother')}
                                        </button>
                                    </div>
                                )}
                            />
                        </Form.Group>

                        {/*SUBMIT FORM */}
                        <Button variant="primary" type="submit" disabled={props.isSubmitting}>
                            {t('createWL.buttons.submit')}
                            {props.isSubmitting && <Spinner animation="border" size="sm" role="status"></Spinner>}
                        </Button>
                    </Form>
                )}
            </Formik>
        </>
    )
}
