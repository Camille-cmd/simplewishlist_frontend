// Bootstrap CSS
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/main.css'

// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

// Components
import SimpleWishlistHeader from "./components/WishlistHeader.tsx";

// Context
import { AuthProvider } from "./contexts/AuthContext.tsx";

// i18n
import './i18n.tsx'

// Routing
import {router} from "./routes.tsx";
import {RouterProvider} from "react-router-dom";


function App() {
    return (
        <AuthProvider>
            <SimpleWishlistHeader></SimpleWishlistHeader>
            <main className='container text'>
                <RouterProvider router={router} />
            </main>
        </AuthProvider>
    )
}

export default App
