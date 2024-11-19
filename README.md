# Simplewishlist frontend

This is the frontend part of the Simplewishlist project. It is a simple wishlist application where users can create, update, delete and view their wishlists.

The full instructions to run the application with the backend can be found [on the docker compose repository](https://github.com/Camille-cmd/simplewishlist-docker-compose).

## Requirements
- Node.js
- npm

## Installation
See the installations instructions for both frontend and backend in the root directory README.md file.

### Docker
1. Clone this repository
2. Create the environment file for the frontend by copying the `.env.example` file and renaming it to `.env`, available [here](https://github.com/Camille-cmd/simplewishlist-docker-compose)..
3. Run the following command to start the application:
    ```bash
    docker build -t simplewishlist_frontend .
    docker run simplewishlist_frontend
    ```

### Manual
```
npm install
npm run dev
```

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the `LICENSE.md` file for details
