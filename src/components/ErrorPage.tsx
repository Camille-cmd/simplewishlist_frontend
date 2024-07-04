import { useRouteError } from "react-router-dom";


/**
 * Interface for the error object
 */
interface RouteError {
    statusText: string;
    message: string;
}

/**
 * Component to display the error page
 * @constructor
 */
export default function ErrorPage() {
  const error = useRouteError() as RouteError;

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
