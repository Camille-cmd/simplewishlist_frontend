import {Button} from "react-bootstrap";

export default function WelcomePage() {
    return (
        <div className="welcome-container">
            <h1>Welcome to SimpleWishlist! 💫</h1>

            <p>SimpleWishlist is a web application that allows you to create wishlists and share them with your friends and family.</p>
            <p>The application aims to be simple without any account creation or login required.</p>
            <p>On creation, a personal link will be attributed to each user, with this link each user will be able to access its wishlist data</p>
            <p>Click on the "Create a Wishlist" button to get started!</p>
            <Button className={"btn-custom"} href={(`/wishlist/create`)}>
                Create a Wishlist
            </Button>
        </div>
    );
}
