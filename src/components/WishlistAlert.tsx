import {Alert} from "react-bootstrap";
import {AlertData} from "../interfaces/AlertData";


interface ErrorMessageProps {
    alertData: AlertData
}

export default function WishlistAlert({alertData}: Readonly<ErrorMessageProps>) {
    return (
        <Alert className={"mt-4"} variant={alertData.variant} >
            {alertData.message}
        </Alert>
    )
}
