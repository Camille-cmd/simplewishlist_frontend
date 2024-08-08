import {useTranslation} from "react-i18next";
import {api} from "../../api/axiosConfig.tsx";
import {useEffect, useState} from "react";
import {WishlistSettingsInterface} from "../../interfaces/WishlistSettings";
import {useParams} from "react-router-dom";
import {Formik} from "formik";
import {Button, Form, OverlayTrigger, Popover, Spinner, Stack} from "react-bootstrap";
import {PatchQuestion} from "react-bootstrap-icons";
import * as Yup from "yup";
import {handleReturnToWishlist} from "../../utils/returnToWishlist.tsx";
import WishlistAlert from "../WishlistAlert.tsx";
import {AlertData} from "../../interfaces/AlertData";


/**
 * Component to display the wishlist settings form
 * @constructor
 */
export function WishlistSettings() {
    const {t} = useTranslation();

    const {userToken} = useParams();
    const [wishlistSettings, setWishlistSettings] = useState<WishlistSettingsInterface>();
    const [alertData, setAlertData] = useState<AlertData>();

    const initialValues = {
        wishlistName: wishlistSettings?.wishlistName ?? '',
        allowSeeAssigned: wishlistSettings?.allowSeeAssigned ?? false,
    }


    /**
     * Get the wishlist settings from the api
     */
    const getWishlistSettings = () => {
        api.get('/wishlist/settings', {headers: {'Authorization': `Bearer ${userToken}`}})
            .then((response) => {
                setWishlistSettings(response.data as WishlistSettingsInterface);
            })
    }


    /**
     * Handle the form submission to update the wishlist settings
     * @param values
     */
    const handleSubmit = (values) => {
        api.post(
            `/wishlist`,
            values,
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 200) {
                setWishlistSettings(response.data as WishlistSettingsInterface);
                // Show success alert
                setAlertData({
                    "variant": "success",
                    "message": t("updateWL.success")
                } as AlertData);
                setTimeout(() => setAlertData(undefined), 5000);
            }
        }).catch((error) => {
            const errorMessage = error.response.data.detail[0].msg;
            setAlertData({
                "variant": "danger",
                "message": errorMessage
            } as AlertData);
        });
    }

    const validationSchema = () => Yup.object().shape({
        wishlistName: Yup.string().required(t('errors.wishlistName.required')),
    });

    // Popover for the surprise mode description
    // TODO: dry popover with createWL
    const surpriseModePopover = (
        <Popover id="popover-basic">
            <Popover.Body>
                {t('createWL.surpriseModeDescription')}
            </Popover.Body>
        </Popover>
    );

    useEffect(() => {
        getWishlistSettings();
    }, []);

    return (
        <>

            {/*Return to wishlist button*/}
            <Button
                as="input"
                type="button"
                value={t("createWish.buttons.returnToWishlist")}
                variant="outline-dark"
                onClick={() => handleReturnToWishlist(userToken as string)}
            />

            {/*Title */}
            <h1 className='wishlist-title my-4 my-md-5 p-2'>
                {t('updateWL.title')}
                <div>💫</div>
            </h1>

            {/*Alerts*/}
            {alertData &&<WishlistAlert alertData={alertData as AlertData}></WishlistAlert>}

            {/*Form*/}
            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
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

                        {/* ALLOW SEE ASSIGNED USERS CHECKBOX*/}
                        <Stack direction="horizontal" gap={2}>
                            <Form.Check
                                type='switch'
                                id="surprise-mode"
                                reverse={true}
                                checked={!props.values.allowSeeAssigned}
                                label={t('createWL.allowSeeAssigned', {checked: props.values.allowSeeAssigned ? '🐵' : '🙈'})}
                                name='allowSeeAssigned'
                                onChange={() => props.setFieldValue('allowSeeAssigned', !props.values.allowSeeAssigned)}
                            />
                            <OverlayTrigger trigger={["hover", "click"]} placement="auto" overlay={surpriseModePopover} rootClose>
                                <PatchQuestion/>
                            </OverlayTrigger>
                        </Stack>


                        {/*SUBMIT FORM */}
                        <div className="text-center create-wl-btn-container">
                            <Button className={"btn-custom"} type="submit">
                                {t('updateWL.buttons.submit')} 🪄
                                {props.isSubmitting && <Spinner animation="border" size="sm" role="status"></Spinner>}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}
