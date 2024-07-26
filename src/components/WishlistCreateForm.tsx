import {Button, Form, OverlayTrigger, Popover, Spinner, Stack, Tooltip} from "react-bootstrap";
import '../assets/wishlistcreate.css'
import {FieldArray, Formik} from 'formik';
import {PatchQuestion, PersonDash, PersonX, PlusCircle, Trash} from "react-bootstrap-icons";
import {useTranslation} from "react-i18next";
import * as Yup from "yup";
import {TFunction} from "i18next";
import {FormValues} from "../interfaces/WlCreateFormValues";
import {TestContext} from "yup";

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
        .required(t('errors.wishlistAdminName.required'))
        .test(
            'unique',
            t('errors.wishlistAdminName.noDuplicate'),
            (value: string, context: TestContext) => {
                // We want to prevent duplicates in the list of users (wishlist_admin_name included)
                const allNamesIncludingAdmin = context.parent.other_users_names ? context.parent.other_users_names.concat(value) : [value]
                return allNamesIncludingAdmin ? allNamesIncludingAdmin.length === new Set(allNamesIncludingAdmin)?.size : true
            }
        ),
    other_users_names: Yup.array()
        .required(t('errors.otherUsersNames.required'))
        .of(Yup.string())
        .test(
            'unique',
            t('errors.otherUsersNames.noDuplicate'),
            (value: (string | undefined)[], context: TestContext) => {
                // We want to prevent duplicates in the list of users (wishlist_admin_name included)
                const allNamesIncludingAdmin = value ? value.concat(context.parent.wishlist_admin_name) : []
                return allNamesIncludingAdmin ? allNamesIncludingAdmin.length === new Set(allNamesIncludingAdmin)?.size : true
            }
        )
});


/**
 * Component to display the wishlist creation form
 * @param handleSubmit
 * @constructor
 */
export default function WishlistCreateForm({handleSubmit}: Readonly<WishlistCreateFormChildProps>) {
    const {t} = useTranslation();

    /**
     * Focus on the last input when a new one is added
     */
    const focusNewInput = () => {
        // Focus on the last input when a new one is added
        // setTimeout is required to allow the new input to render so that it returns the newly created input
        setTimeout(() => {
            const inputs = document.querySelectorAll('[name^=other_users_names]');
            const lastInput = inputs[inputs.length - 1];
            if (lastInput) {
                lastInput.focus();
            }
        }, 0)
    }

    const initialValues =
        {
            wishlist_name: '',
            wishlist_admin_name: '',
            allow_see_assigned: false,
            other_users_names: [''],
        }

    // We need to pass translation to the validation schema
    const validationSchema = () => createWLValidationSchema(t)

    // Popover for the surprise mode description
    const surpriseModePopover = (
        <Popover id="popover-basic">
            <Popover.Body>
                {t('createWL.surpriseModeDescription')}
            </Popover.Body>
        </Popover>
    );

    return (
        <>

            <h1 className='wishlist-title my-4 my-md-5 p-2'>
                {t('createWL.title')}
                <div>💫</div>
            </h1>

            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
            >
                {props => (

                    <Form onSubmit={props.handleSubmit} className={"wishlist-container"}>

                        {/* WISHLIST NAME*/}
                        <Form.Group className="mb-3" controlId="wishlistName">
                            <Form.Label>{t('createWL.wishlistName')}*</Form.Label>
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
                            <Form.Label>{t('createWL.wishlistAdminName')}*</Form.Label>
                            <Form.Control
                                type="text"
                                name="wishlist_admin_name"
                                value={props.values.wishlist_admin_name}
                                onChange={props.handleChange}
                                placeholder={t('createWL.placeholders.wishlistAdminName')}
                                isInvalid={!!(props.touched.wishlist_admin_name && props.errors.wishlist_admin_name)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {props.errors.wishlist_admin_name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* ALLOW SEE ASSIGNED USERS CHECKBOX*/}
                        <Stack direction="horizontal" gap={2}>
                            <Form.Check
                                type='switch'
                                id="surprise-mode"
                                reverse={true}
                                checked={!props.values.allow_see_assigned}
                                label={t('createWL.allowSeeAssigned', {checked: props.values.allow_see_assigned ? '🐵' : '🙈'})}
                                name='allow_see_assigned'
                                onChange={() => props.setFieldValue('allow_see_assigned', !props.values.allow_see_assigned)}
                            />
                            <OverlayTrigger trigger={["hover", "click"]} placement="auto" overlay={surpriseModePopover}
                                            rootClose>
                                <PatchQuestion/>
                            </OverlayTrigger>
                        </Stack>

                        {/* ADD OTHER USERS*/}
                        <Form.Group controlId="wishlistOtherUsersName">
                            <h2 className='bold'>{t('createWL.otherUserName')}</h2>

                            <FieldArray
                                name="other_users_names"
                                render={arrayHelpers => (
                                    <div>
                                        {
                                            props.values.other_users_names.map((other_user_name: string, index: number) => (
                                                // Use index as Key, the list can not be reordered
                                                <Stack direction={"horizontal"} gap={1} key={index}>

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
                                                                focusNewInput();
                                                            }
                                                        }}
                                                        isInvalid={!!(props.touched.other_users_names && props.errors.other_users_names)}
                                                    />
                                                    <Form.Control.Feedback className="mb-3" type="invalid">{props.errors.other_users_names}</Form.Control.Feedback>

                                                    {/*REMOVE */}
                                                    <Button className="btn-remove btn-sm mb-3" onClick={() => arrayHelpers.remove(index)}>
                                                        <Trash/>
                                                    </Button>
                                                </Stack>
                                            ))
                                        }

                                        {/* ADD ANOTHER */}
                                        <Button className="btn-add-another btn-sm float-end" onClick={() => arrayHelpers.push('')}>
                                            <PlusCircle/> {t('createWL.buttons.addAnother')}
                                        </Button>
                                    </div>
                                )}
                            />
                        </Form.Group>

                        {/*SUBMIT FORM */}
                        <div className="text-center create-wl-btn-container">
                            <Button className={"btn-custom"} type="submit" disabled={props.isSubmitting}>
                                {t('createWL.buttons.submit')} 🪄
                                {props.isSubmitting && <Spinner animation="border" size="sm" role="status"></Spinner>}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}
