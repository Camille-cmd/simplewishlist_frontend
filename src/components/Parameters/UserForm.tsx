import {Formik} from "formik";
import * as Yup from "yup";
import {Button, Form, Stack} from "react-bootstrap";
import {PlusCircle} from "react-bootstrap-icons";
import {useTranslation} from "react-i18next";
import {api} from "../../api/axiosConfig.tsx";
import WishlistAlert from "../WishlistAlert.tsx";
import {Dispatch, SetStateAction, useState} from "react";
import {AlertData} from "../../interfaces/AlertData";
import {UserData} from "../../interfaces/UserToken";
import {useAuth} from "../../contexts/AuthContext.tsx";

class UserFormProps {
    editMode: boolean | undefined;
    setShowUserForm!: Dispatch<SetStateAction<boolean>>;
    otherUsersNames: Array<string> | undefined;
    setUsersData: Dispatch<SetStateAction<Array<UserData>>> | undefined;
    initialData: UserData | undefined;
}

/**
 *Component that displays the form to add/update user
 * @param editMode (whether we are updating rather than creating)
 * @param setShowUserForm (to close the form)
 * @param otherUsersNames
 * @param setUsersData
 * @param initialData
 * @constructor
 */
export function UserForm(
    {
        editMode,
        setShowUserForm,
        otherUsersNames,
        setUsersData,
        initialData
    }: Readonly<UserFormProps>) {
    const {t} = useTranslation();
    const {userToken} = useAuth();
    const [alertData, setAlertData] = useState<AlertData>();
    const [currentUserToken] = useState<string | undefined>(initialData?.id);

    const initialValues = {
        name: initialData?.name || "",
    }

    /**
     * Handle the form submission to update a user
     * @param values - The form values {name: string}
     */
    const handleSubmitUpdate = (values: { name: string; }) => {
        api.post(
            `/wishlist/users/${currentUserToken}`,
            {"name": values.name},
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 200 && setUsersData && setShowUserForm) {
                // Update the user in the list of users
                setUsersData((prevState) => {
                    return prevState.map((user) => {
                        if (currentUserToken === user.id) {
                            return {...user, name: response.data.name};
                        }
                        return user;
                    });
                });

                setShowUserForm(false);
            }
        })
            .catch((error) => {
                setAlertData({
                    variant: "danger",
                    message: error.response.data.error.message || t('errors.generic')
                });
                setTimeout(() => setAlertData(undefined), 5000);
            })
    }

    /**
     * Handle the form submission to create a new user
     * @param values - The form values {name: string}
     */
    const handleSubmitCreate = (values: { name: string; }) => {
        api.put(
            `/wishlist/users`,
            {"name": values.name},
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 201 && setUsersData && setShowUserForm) {
                const newUser = response.data as UserData;

                // Add the new user to the list of users
                setUsersData((prevState) => [...prevState, newUser] as [UserData]);
                // Close the form
                setShowUserForm(false);
            }
        })
            .catch((error) => {
                setAlertData({
                    variant: "danger",
                    message: error.response.data.error.message || t('errors.generic')
                });
                setTimeout(() => setAlertData(undefined), 5000);
            })
    };

    /**
     * Handle the form submission
     * @param values - The form values {name: string}
     */
    const handleSubmit = (values: { name: string; }) => {
        if (editMode) {
            handleSubmitUpdate(values);
        } else {
            handleSubmitCreate(values);
        }
    }

    /**
     * Validation schema for the form
     */
    const validationSchema = () => {
        return Yup.object({
            name: Yup.string()
                .required(t('errors.addUser.required'))
                .test(
                    'unique',
                    t('errors.otherUsersNames.noDuplicate'),
                    (value: (string | undefined)) => {
                        // We want to prevent duplicates in the list of users
                        if (editMode) {
                            // If we are editing a user, we want to allow the current name
                            otherUsersNames = otherUsersNames?.filter((name) => name !== initialData?.name);
                        }
                        return !(otherUsersNames?.includes(value as string));
                    }
                ),
        })
    }

    return (
        <>
            {/* Alert*/}
            {alertData && <WishlistAlert alertData={alertData}/>}

            {/*Form */}
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validationSchema={validationSchema()}
            >
                {props => (
                    <Form
                        onSubmit={props.handleSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                props.handleSubmit();
                            }
                        }}
                        className="d-flex flex-column"
                    >

                        <Form.Group className={!editMode ? 'mt-3' : ''} controlId="userName">
                            <Form.Control
                                type="text"
                                name="name"
                                value={props.values.name}
                                onChange={props.handleChange}
                                placeholder={!editMode ? t('createUser.placeholders.name') : ""}
                                isInvalid={!!(props.touched.name && props.errors.name)}
                            />
                            <Form.Control.Feedback type="invalid">{props.errors.name}</Form.Control.Feedback>

                            {/* Buttons */}
                            <Stack direction={"horizontal"} gap={3}>
                                <Button
                                    variant="success"
                                    type="submit"
                                    disabled={props.isValidating}
                                    className="my-3"
                                >
                                    {t('createUser.buttons.submit')}
                                    <PlusCircle className="ms-2"/>
                                </Button>
                                <Button
                                    variant="danger"
                                    type="reset"
                                    onClick={() => setShowUserForm?.(false)}
                                    className="my-3"
                                >
                                    {t('createUser.buttons.cancel')}
                                </Button>
                            </Stack>

                        </Form.Group>

                    </Form>
                )}

            </Formik>
        </>
    )
}
