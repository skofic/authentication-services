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

The database will be initialised with the default *administrator* user, the default password is "`secret`", so it is a good idea to change it as soon as possible. To do so:

1. From the service `API` tab *login* (`/auth/login`) as the *default administrator* with `admin` as the username and `secret` as the password.
2. Go to the `settings` tab in the service. Update the *password* (`adminPass`), optionally you can also change the *username* (`adminCode`).
3. Go back to the service `API` tab and execute the *Reset users* (`/auth/reset`) service setting the `default` parameter to `true`.
4. From the service `API` tab *login* (`/auth/login`) again as the default administrator with the new password and eventual new username.

This way you will have an administrator with a safer password. This administrator comes by default with only the `admin` role, which means the only operations this user can do is manage users. So the next thing to do is to create new users that can *use* and *manage* the data dictionary.

*Note that the roles are not cumulative: the `dict` role allows to create dictionary terms and relationships, but it doesn't imply the `read` role that allows reading the dictionary.*

## Database

This set of services expects the collections that are created during the setup phase:

- `collectionUser`: This collection contains all users that can be authenticated, the record is structured as follows:
    - `username`: The user code or name, *must be unique*.
    - `role`: An array of terms that define what a user can do. It is possible to set custom codes for custom purposes, these are the terms that the system *currently recognises*:
        - `admin`: The user can *create* and *manage users* and *consult session information*.
    - `default`: A boolean indicating whether the user is default or not.
    - `auth`: This property is never visible using the services, it contains authentication data structured as follows:
        - `method`: The hashing algoritm used to create passwords.
        - `salt`: The password salt.
        - `hash`: The password hash.
- `collectionSession`: This collection stores *user sessions*, it features the `uid`, the session creation, `created`, and expiration, `expires`, time stamps and the session `data` which contains the session `user` record.
- `collectionSettings`: This collection contains the *settings* for the *administrator* and *other users* holding the *token key*, *code* and *password*. It also contains the *cookie secret*.
- `collectionError`: This collection is supposed to contain standard error records, *this collection is not yet in use*.
- `collectionLog`: This collection is supposed to contain the logs,  *this collection is not yet in use*.

These collection should be only managed by services, their access should be reserved to specific services.

## Services

The services are divided into three sections: one section handling user authentication, another handling user credentials creation and management, and a utilities section containing a selection of general purpose helper services.

### Authentication

This set of services can be used to authenticate users and determine the current user.

#### Login

Use this service to authenticate.

The service expects the user code, `username`, and password, `password`, in the body.

The service will return:

- `200`: If *successful*, the service will return the `username`, `role` and `default` flag of the *authenticated user*.
- `401`: *Invalid password*: provided a password that does not match the user authentication data.
- `404`: *Unable to find user*: no user exists with the provided username.
- `500`: *Other errors*.

#### Who am I?

Use this service to get information on the current user.

The service will return:

- `200`: If *successful*, the service will return the `username`, `role` and `default` flag of the *currently authenticated user*.
- `404`: *No current user*: the current session does not have a registered user.
- `500`: *Other errors*.

#### Logout

Use this service to de-register the current user.

The service will return:

- `200`: If *successful*, the service will return the `username`, `role` and `default` flag of the *currently de-registered user*.
- `404`: *No current user*: the current session does not have a registered user.
- `500`: *Other errors*.

### Credentials

This section contains services that allow the management of users and their credentials.

#### Signup

Use this service to create a new user. *This service can only be used by authenticated users that have the* `admin` *role*.

The service expects the user credentials provided in the body:

- `username`: Provide the username or code.
- `password`: Provide the user password.
- `role`: Provide the list of roles assigned to the user, these services handle the following codes:
    - `admin`: role allows to manage users and sessions.

Besides the above codes, you may set other values in the roles list, if you intent to use them for purposes other than service permissions.

The service will return:

- `200`: If *successful*, the service will return the `username`, `role` and `default` flag of the *newly created user*.
- `401`: *No current user*: the current session does not have a registered user.
- `403`: *Unauthorised user*: the service will return this code if the current user is not an administrator.
- `409`: *Username conflict*: the service will return this code if the provided user already exists.
- `500`: *Other errors*.

#### List users

Use this service to consult registered users. *This service can only be used by authenticated users that have the* `admin` *role*.

The service will return the list of users that match the selection criteria provided in the request body:

- `username`: Username search pattern. The supported wildcards are `_` to match a single arbitrary character, and `%` to match any number of arbitrary characters. Literal % and _ need to be escaped with a backslash. Backslashes need to be escaped themselves.
- `password`: Provide the user password.
- `role`: The user roles, set all roles that the selected users must match.
- `default`: Set `true` to select *default users*, `false` to select all *others*.
- `start`: Results list start position, zero based.
- `limit`: Number of records to be returned.

Any of these can be omitted to disable the selection, except `start` and `limit`.

The service will return:

- `200`: If *successful*, the service will return the list of selected user records featuring the `username`, `role` and `default` flag.
- `401`: *No current user*: the current session does not have a registered user.
- `403`: *Unauthorised user*: the service will return this code if the current user is not an administrator.
- `500`: *Other errors*.

#### Reset users

This service will reset users and authentication data. *This service can only be used by authenticated users that have the* `admin` *role*.

This service can be used to:

- *Delete default users*: If you provide `true` in the `default` body parameter, the service will delete all default users.
- *Delete created users*: If you provide `true` in the `created` body parameter, the service will delete all created users.
- *Refresh authentication data*: If you provide `true` in the `auth` body parameter, the service will refresh *administrator*, *user* and *cookie authentication* data.

When deleting users, the service will also delete eventual sessions connected to the deleted users, this means that these users will also be disconnected.

Default users can be managed through the services settings, you can change the username and the password: to register these changes you call this service with the `default` parameter set to `true`: this will remove the former user, clear related sessions, and will re-create the modified default user.

*Note that in all cases default users will be created, if not already there.*

The service expects the following properties in the body:

- `default`: *Boolean*, delete default users.
- `created`: *Boolean*, delete created users.
- `auth`: *Boolean*, refresh authentication data.

The service will return:

- `200`: If *successful*, the service will return the list of performed operations as an array of message strings.
- `401`: *No current user*: the current session does not have a registered user.
- `403`: *Unauthorised user*: the service will return this code if the current user is not an administrator.
- `500`: *Other errors*.

#### Set user password

This service is used by administrators to change the password of a specific user. *This service can only be used by authenticated users that have the* `admin` *role*.

The service expects the user *primary key* in the `key` *query path parameter*. Note that this is the `_key` property of the user record. *Performing this operation by using the username is not implemented, so that only who has access to the* `_key` *can call this service*.

The new password should be provided in the `password` property of the body.

The service will return:

- `200`: If *successful*, the service will return the `username` and `role` of the user.
- `401`: *No current user*: the current session does not have a registered user.
- `403`: *Unauthorised user*: the service will return this code if the current user is not an administrator.
- `404`: *User not found*: no user is associated with the provided key.
- `409`: *Conflict*: the user document was modified in between the time it was read and the time it was modified.
- `500`: *Other errors*.

#### Change my password

This service can be used to change the password of the current user.

The new password should be provided in the `password` property of the body.

The service will return:

- `200`: If *successful*, the service will return `{ success: true }`.
- `401`: *No current user*: the current session does not have a registered user.
- `404`: *User not found*: the session user key is not associated with any users.
- `409`: *Conflict*: the user document was modified in between the time it was read and the time it was modified.
- `500`: *Other errors*.

#### Set user roles

This service is used by administrators to change the roles of a specific user. *This service can only be used by authenticated users that have the* `admin` *role*.

The service expects the user *primary key* in the `key` *query path parameter*. Note that this is the `_key` property of the user record. *Performing this operation by using the username is not implemented, so that only who has access to the* `_key` *can call this service*.

Provide the array of *user roles* in the `role` property of the body.

The service will return:

- `200`: If *successful*, the service will return the `username`, `role` and `default` flag of the user.
- `401`: *No current user*: the current session does not have a registered user.
- `403`: *Unauthorised user*: the service will return this code if the current user is not an administrator.
- `404`: *User not found*: no user is associated with the provided key.
- `409`: *Conflict*: the user document was modified in between the time it was read and the time it was modified.
- `500`: *Other errors*.

#### Delete user

This service is used by administrators to delete a specific user. *This service can only be used by authenticated users that have the* `admin` *role*.

The service expects the user *primary key* in the `key` *query path parameter*. Note that this is the `_key` property of the user record. *Performing this operation by using the username is not implemented, so that only who has access to the* `_key` *can call this service*.

The service will return:

- `200`: If *successful*, the service will return the `username`, `role` and `default` flag of the deleted user.
- `404`: *User not found*: no user is associated with the provided key.
- `500`: *Other errors*.

#### Delete current user

This service can be used to delete the current user. Once deleted, the former current user will not be able to login and all related sessions will be deleted.

If you are logged in as the default administrator, that user will be re-created automatically.

The service will return:

- `200`: If *successful*, the service will return the operation outcome as a message.
- `404`: *User not found*: this error is either returned if the current session user cannot be located, or if there is no current user in the session.
- `500`: *Other errors*.

### Utilities

This set of services provide a set of helper functions.

#### Ping

This service will ping the database, it will return the string "`pong`" if successful.

#### Mirror the GET request data

This service will return the full GET request contents. *This service can only be used by authenticated users that have the* `admin` *role*.

The service will return:

- `200`: If *successful*, the service will return the full request body.
- `500`: *Any error*.

#### Mirror the GET response data

This service will return the full GET response contents. *This service can only be used by authenticated users that have the* `admin` *role*.

The service will return:

- `200`: If *successful*, the service will return the full response body.
- `500`: *Any error*.

#### Mirror the POST request data

This service will return the full POST request contents. *This service can only be used by authenticated users that have the* `admin` *role*.

You can set any data in the body.

The service will return:

- `200`: If *successful*, the service will return the full request body.
- `500`: *Any error*.

#### Mirror the POST response data

This service will return the full POST response contents. *This service can only be used by authenticated users that have the* `admin` *role*.

You can set any data in the body.

The service will return:

- `200`: If *successful*, the service will return the full response body.
- `500`: *Any error*.

#### Return the base path

This service will return the base path of the service application. *This service can only be used by authenticated users that have the* `admin` *role*.

The service will return:

- `200`: If *successful*, the service will return the base application file path.
- `500`: *Any error*.

#### Return the temp path

This service will return the temporary files path of the service application. *This service can only be used by authenticated users that have the* `admin` *role*.

The service will return:

- `200`: If *successful*, the service will return the base temporary files path.
- `500`: *Any error*.

#### Return the temp file path

The service will return the path to a temporary file, *the file will not be created*. *This service can only be used by authenticated users that have the* `admin` *role*.

The service will return:

- `200`: If *successful*, the service will return the path to the temporary file.
- `500`: *Any error*.

#### Return the current session

The service will return the current session record. *This service can only be used by authenticated users that have the* `admin` *role*.

The service will return:

- `200`: If *successful*, the `collectionSession` record of the current session.
- `500`: *Any error*.
