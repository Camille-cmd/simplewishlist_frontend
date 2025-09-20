// Bootstrap CSS
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/main.css'

// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

// i18n
import './i18n.tsx'

// Routing
import {RouterProvider} from "react-router-dom";
import {router} from "./routes.tsx";


function App() {
    return (
        <RouterProvider router={router}/>
    )
}

export default App
