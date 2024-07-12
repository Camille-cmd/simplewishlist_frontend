import {Alert, Button, ListGroup, Stack} from "react-bootstrap";
import {generateLink} from "../utils/generateLink.tsx";
import {UserToken} from "../interfaces/UserToken";
import {useTranslation} from "react-i18next";
import {useState} from "react";

export default function UserLinkItem({userToken}: Readonly<{ userToken: UserToken }>) {
    const {t} = useTranslation();

    const [link, setLink] = useState<string>(generateLink(userToken.token, userToken.name));
    const [linkCopied, setLinkCopied] = useState<boolean>(false);

    const copyToClipboard = (link: string) => {
        navigator.clipboard.writeText(link).then(function () {
            setLinkCopied(true);
            setTimeout(() => {
                setLinkCopied(false);
            }, 2000);
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }
    return (
        <ListGroup.Item key={userToken.name} className={"user-links wishlist-list-group h-100"}>
            <Stack direction={"horizontal"} gap={3} className={"mb-3 py-2"}>
                <div className={"user-links" }>
                    <b>{userToken.name}</b>
                </div>
                <Button className="btn-sm btn-custom ms-auto" onClick={() => copyToClipboard(link)}>
                    {linkCopied ? t('WLCreated.copied') : t('WLCreated.copy')}
                </Button>
            </Stack>
            <Alert.Link href={link} target={"_blank"} >
                {link}
            </Alert.Link>
        </ListGroup.Item>
    )
}
