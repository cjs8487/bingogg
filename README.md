# bingo.gg
*The new way to bingo*

bingo.gg is a video game bingo hosting service designed to modernize, streamline, and improve the functionality provided by [Bingosync](https://bingosync.com), and add new features to improve the bingo experience.

## What is video game bingo?
Video game bingo is a subset of the larger speedrun community, where rather than aiming to simply complete the game, runners aim to complete a set of goals within the game. These goals vary from game to game, and generally games have many more goals than needed to fill a bingo board, creating a unique experience every time you play.

## Setup
bingo.gg consists of two main core modules - the api module and the web module.
The api module can be run independently, but many features are unavailable
without accessing the api via a client. The web module requires the api module
for most of its functionality.

### Requirements
- Node.js version 18 or higher
- A Postgres server
  - bingo.gg is only tested against Postgres, though it should also work with MySQL

### Environment Variables
bingo.gg requires several environment variables to be specified in order to function.

#### Required
##### API
- ROOM_TOKEN_SECRET is the secret key used to generate tokens for room level authentication
- SESSION_SECRET is the secret key used to encrypt sessions
- CLIENT_URL is the url that the web client is running at
- DATABASE_URL is the connection string for the database server

##### Web
- NEXT_PUBLIC_API_PATH is the url that the api service is running at
  
#### Optional
##### API
- SMTP_HOST is the host of an SMTP mail server
- SMTP_USER is the email address of the user to send emails as using the SMTP server
- SMTP_PASSWORD is the password of the email account
- PORT is the port the server runs on (defaults to 8000)


### API
1. cd to the api directory
2. Run `npm install` to install dependencies
3. Create a `.env` file. You must provide `ROOM_TOKEN_SECRET`, `SESSION_SECRET`, and `CLIENT_URL`
4. Run `npx prisma migrate dev` to setup your database
5. Run `npm run dev` to start the server

### Web
1. cd to the web directory
2. Run `npm install` to install dependencies
3. Create a `.env.local` file and provide `NEXT_PUBLIC_API_PATH`
4. Run `npm run dev` to start the development server

## Modules
bingo.gg consists of several modules, which divide the functionality between platforms, hosts, etc.

### API
The API module is the primary server module, providing the public facing API for the application as well as the database interface. The API module also contains the websocket layer.

### Web
The web module is bingo.gg's primary client. It provides the web interface through which the majority of users interact with the service.

### Schema
The schema module contains json typeschema definitions for the project along with compiled TypeScript definitions for the schemas. The types are also available on npm in the `@bingogg/types` package.