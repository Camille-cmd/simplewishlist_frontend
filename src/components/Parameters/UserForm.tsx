import {Formik} from "formik";
import * as Yup from "yup";
import {Button, Form, Stack} from "react-bootstrap";
import {PlusCircle} from "react-bootstrap-icons";
import {useTranslation} from "react-i18next";
import {api} from "../../api/axiosConfig.tsx";
import {useParams} from "react-router-dom";
import WishlistAlert from "../WishlistAlert.tsx";
import {useState} from "react";
import {AlertData} from "../../interfaces/AlertData";
import {UserData} from "../../interfaces/UserToken";

class UserFormProps {
    editMode: boolean;
    setShowUserForm: (value: boolean) => void;
    otherUsersNames: Array<string>;
    setUsersData: (value: (((prevState: [UserData]) => [UserData]) | [UserData])) => void;
    initialData: UserData | undefined;
}

export function UserForm({editMode, setShowUserForm, otherUsersNames, setUsersData, initialData}: Readonly<UserFormProps>) {
    const {t} = useTranslation();
    const {userToken} = useParams();
    const [alertData, setAlertData] = useState<AlertData>();
    const [currentUserToken, setCurrentUserToken] = useState<string | undefined>(initialData?.token);


    const initialValues = {
        name: initialData?.name || "",
    }

    /**
     * Handle the form submission to update a user
     * @param values - The form values {name: string}
     */
    const handleSubmitUpdate = (values) => {
        api.post(
            `/wishlist/users/${currentUserToken}`,
            {"name": values.name},
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 200) {
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
    const handleSubmitCreate = (values) => {
        api.put(
            `/wishlist/users`,
            {"name": values.name},
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 201) {
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
    const handleSubmit = (values) => {
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
                            otherUsersNames = otherUsersNames.filter((name) => name !== initialData.name);
                        }
                        return !(otherUsersNames.includes(value as string));
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
                            props.handleSubmit;
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
                        {!editMode &&
                        <Stack direction={"horizontal"} gap={3}>
                            <Button variant="success" type="submit" disabled={props.isValidating} className="ms-auto mt-3">
                                {t('createUser.buttons.submit')}<PlusCircle className="ms-2"/>
                            </Button>
                            <Button variant="danger" type="submit" onClick={()=> setShowUserForm(false)} className="mt-3">
                                {t('createUser.buttons.cancel')}
                            </Button>
                        </Stack>
                        }
                    </Form.Group>

                </Form>
                )}

        </Formik>
            </>
    )
}
