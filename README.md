# Authentication Services

This repository contains the [ArangoDB](https://www.arangodb.com) [Foxx micro services](https://www.arangodb.com/docs/stable/foxx.html) to manage users and credentials.

## Installation

1. You must first either install [ArangoDB](https://www.arangodb.com), or have an existing database available.
2. *Create* or *select* an existing *database*.
3. In the `Services` *left tab* press the `+ Add service` button.
4. Select the `GitHub` *top tab*, set the `Repository*` field to **skofic/authentication-services** and the `Version*` field to **main**; press the `Install` button.
5. An alert will be presented requesting the `Mount point` for the service, you can provide *any suitable value*, ensure the `Run setup?` checkbox is *checked*. Press the `Install` button.

At this point the service will do the following actions:

1. It will create the necessary *collections*, if not already there:
    - The *error* collection that will hold eventual errors.
    - The *user* collection to store users.
    - The *sessions* collection to keep track of user sessions.
    - The *settings* collection that holds default settings.
2. It will initialise *root level directories*, if not already there:
    - It will create the default *data directory*.
3. It will create and initialise the *authentication file* with the *administrator*, *user* and *cookies* authentication data.
4. It will create the *default administrator* user.

You will see that in the Services left tab there is a top tab called `Settings`: this can be used to *customise* the general *settings*:

- Default administrator:
    - `adminCode`: Default administrator user code.
    - `adminPass`: Default administrator password.
- General standards:
    - `dataDir`: The name of the root level data directory.
    - `language`: Default language ISO code: this is the code used in the [data dictionary](https://github.com/skofic/data-dictionary-service).
- Cryptographic settings:
    - `cookie`: Cookie name
    - `method`: Hashing algorithm for creating passwords.
    - `saltLength`: Length of the salt that will be generated for password hashes.
    - `secretLength`: Length of the cookie secret.
    - `timeToLive`: Cookie time to live (60 x 60 x 24 x 7).
- Collection names:
    - `collectionUser`: Users.
    - `collectionSession`: Sessions.
    - `collectionSettings`: Settings.
    - `collectionError`: Errors.
    - `collectionLog`: Logs.

## Database

This set of services expects the collections that are created during the setup phase:

- 

## Services

The service settings contain the default values for a set of environment variables, as well as the collection names and default user code and password.

The services are divided into sections:

### Authentication

This set of services can be used to create and manage users and their authentication.

Users have the following properties:

- `username`: The user code or name, must be unique.
- `role`: An array of terms that define what a user can do. Any string can do, bu these are the terms that the system currently handles:
    - `admin`: The user can create and manage users and consult session information.
    - `dict`: The user can create and manage data dictionary items.
    - `read`: The user can use the data dictionary, but he/she cannot change its elements.

The database will be initialised with a default *administrator* user whose credentials can be found in the service settings tab. The default password is "`secret`", so it is a good idea to change it as soon as possible. To do so:

1. From the service *API* tab *login* (`/auth/login`) as the default administrator with `admin` as the username and `secret` as the password.
2. Go to the *settings* tab in the service. Update the *password* (`adminPass`), optionally you can also change the *username* (`adminCode`).
3. Go back to the service *API* tab and execute the *Reset users* (`/auth/reset`) service setting the `default` parameter to `true`.
4. From the service *API* tab *login* (`/auth/login`) again as the default administrator with the new password and eventual username.

This way you will have an administrator with a safer password. This administrator comes by default with only the `admin` role, which means the only operations this user can do is manage users. So the next thing to do is to create new users that can *use* and *manage* the data dictionary.

*Note that the roles are not cumulative: the `dict` role allows to create dictionary terms and relationships, but it doesn't imply the `read` role that allows reading the dictionary.*

### Administration utilities

-- IN PROGRESS --

### Enumerated types

-- IN PROGRESS --

### Structured types

-- IN PROGRESS --

### Validation services

-- IN PROGRESS --

## The data dictionary

The dictionary is under development, there is not yet public documentation on *what it does*, *how to use it* and the business logic to make it useful, this will come in time and will be integrated into the [FORGENIUS](https://www.forgenius.eu) project.

Stay tuned...
