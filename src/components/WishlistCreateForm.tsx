import {Button, Form, OverlayTrigger, Popover, Spinner, Stack} from "react-bootstrap";
import '../assets/wishlistcreate.css'
import {FieldArray, Formik} from 'formik';
import {PatchQuestion, PlusCircle, Trash} from "react-bootstrap-icons";
import {useTranslation} from "react-i18next";
import * as Yup from "yup";
import {FormValues} from "../interfaces/WlCreateFormValues";
import {TestContext} from "yup";

/**
 * Interface for the props of the WishlistCreateForm component
 */
interface WishlistCreateFormChildProps {
    handleSubmit: (values: FormValues) => void
}

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
            const inputs = document.querySelectorAll('[name^=otherUsersNames]');
            const lastInput = inputs[inputs.length - 1] as HTMLElement;
            if (lastInput) {
                lastInput.focus();
            }
        }, 0)
    }

    const initialValues =
        {
            wishlistName: '',
            wishlistAdminName: '',
            surpriseModeEnabled: true,
            allowSeeAssigned: false,
            otherUsersNames: [''],
        }

    // We need to pass translation to the validation schema
    const validationSchema = () => {
        return Yup.object().shape({
            wishlistName: Yup.string()
                .required(t('errors.wishlistName.required')),
            wishlistAdminName: Yup.string()
                .required(t('errors.wishlistAdminName.required'))
                .test(
                    'unique',
                    t('errors.wishlistAdminName.noDuplicate'),
                    (value: string, context: TestContext) => {
                        // We want to prevent duplicates in the list of users (wishlist_admin_name included)
                        const allNamesIncludingAdmin = context.parent.otherUsersNames ? context.parent.otherUsersNames.concat(value) : [value]
                        return allNamesIncludingAdmin ? allNamesIncludingAdmin.length === new Set(allNamesIncludingAdmin)?.size : true
                    }
                ),
            otherUsersNames: Yup.array()
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
    }

    // Popover for the surprise mode description
    const surpriseModePopover = (
        <Popover id="surprise-mode-popover">
            <Popover.Body>
                {t('createWL.surpriseModeEnabledDescription')}
            </Popover.Body>
        </Popover>
    );

    // Popover for the default surprise mode state
    const surpriseModeDefaultPopover = (
        <Popover id="surprise-mode-default-popover">
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
                                name="wishlistName"
                                value={props.values.wishlistName}
                                onChange={props.handleChange}
                                placeholder={t('createWL.placeholders.wishlistName')}
                                isInvalid={!!(props.touched.wishlistName && props.errors.wishlistName)}
                            />
                            <Form.Control.Feedback
                                type="invalid">{props.errors.wishlistName}</Form.Control.Feedback>
                        </Form.Group>

                        {/* WISHLIST ADMIN NAME*/}
                        <Form.Group className="mb-3" controlId="wishlistAdminName">
                            <Form.Label>{t('createWL.wishlistAdminName')}*</Form.Label>
                            <Form.Control
                                type="text"
                                name="wishlistAdminName"
                                value={props.values.wishlistAdminName}
                                onChange={props.handleChange}
                                placeholder={t('createWL.placeholders.wishlistAdminName')}
                                isInvalid={!!(props.touched.wishlistAdminName && props.errors.wishlistAdminName)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {props.errors.wishlistAdminName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* SURPRISE MODE SETTINGS */}
                        <div className="surprise-mode-section mb-4">
                            <h3 className="mb-3">{t('createWL.surpriseModeSection')}</h3>

                            {/* ENABLE SURPRISE MODE CHECKBOX */}
                            <Stack direction="horizontal" gap={2} className="mb-3">
                                <Form.Check
                                    type='switch'
                                    id="surprise-mode-enabled"
                                    checked={props.values.surpriseModeEnabled}
                                    label={t('createWL.enableSurpriseMode', {enabled: props.values.surpriseModeEnabled ? '🎁' : '👀'})}
                                    name='surpriseModeEnabled'
                                    onChange={() => props.setFieldValue('surpriseModeEnabled', !props.values.surpriseModeEnabled)}
                                />
                                <OverlayTrigger trigger={["hover", "click"]}
                                                placement="auto"
                                                overlay={surpriseModePopover}
                                                rootClose>
                                    <PatchQuestion/>
                                </OverlayTrigger>
                            </Stack>

                            {/* DEFAULT SURPRISE MODE STATE (only if surprise mode is enabled) */}
                            {props.values.surpriseModeEnabled && (
                                <Stack direction="horizontal" gap={2} className="ms-4">
                                    <Form.Check
                                        type='switch'
                                        id="surprise-mode-default"
                                        reverse={true}
                                        checked={!props.values.allowSeeAssigned}
                                        label={t('createWL.allowSeeAssigned', {checked: props.values.allowSeeAssigned ? '🐵' : '🙈'})}
                                        name='allowSeeAssigned'
                                        onChange={() => props.setFieldValue('allowSeeAssigned', !props.values.allowSeeAssigned)}
                                    />
                                    <OverlayTrigger trigger={["hover", "click"]}
                                                    placement="auto"
                                                    overlay={surpriseModeDefaultPopover}
                                                    rootClose>
                                        <PatchQuestion/>
                                    </OverlayTrigger>
                                </Stack>
                            )}
                        </div>

                        {/* ADD OTHER USERS*/}
                        <Form.Group controlId="wishlistOtherUsersName">
                            <h2 className='bold'>{t('createWL.otherUserName')}</h2>

                            <FieldArray
                                name="otherUsersNames"
                                render={arrayHelpers => (
                                    <div>
                                        {
                                            props.values.otherUsersNames.map((otherUsersName: string, index: number) => (
                                                // Use index as Key, the list can not be reordered
                                                <Stack direction={"horizontal"} gap={1} key={index}>

                                                    <Form.Control
                                                        className="mb-3"
                                                        type="text"
                                                        name={`otherUsersNames.${index}`}
                                                        placeholder={t('createWL.placeholders.otherUserName')}
                                                        value={otherUsersName}
                                                        onChange={props.handleChange}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                arrayHelpers.push('');
                                                                focusNewInput();
                                                            }
                                                        }}
                                                        isInvalid={!!(props.touched.otherUsersNames && props.errors.otherUsersNames)}
                                                    />
                                                    <Form.Control.Feedback className="mb-3"
                                                                           type="invalid">{props.errors.otherUsersNames}</Form.Control.Feedback>

                                                    {/*REMOVE */}
                                                    <Button className="btn-remove btn-sm mb-3"
                                                            onClick={() => arrayHelpers.remove(index)}>
                                                        <Trash/>
                                                    </Button>
                                                </Stack>
                                            ))
                                        }

                                        {/* ADD ANOTHER */}
                                        <Button className="btn-add-another btn-sm float-end"
                                                onClick={() => arrayHelpers.push('')}>
                                            <PlusCircle/> {t('createWL.buttons.addAnother')}
                                        </Button>
                                    </div>
                                )}
                            />
                        </Form.Group>

                        {/*SUBMIT FORM */}
                        <div className="text-center create-wl-btn-container">
                            <Button className={"btn-custom"} type="submit">
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
