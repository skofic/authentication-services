'use strict'

/**
 * Authentication services
 */

//
// Imports.
//
const dd = require('dedent')
const joi = require('joi')
const aql = require('@arangodb').aql
const status = require('statuses')
const errors = require('@arangodb').errors

//
// Error codes.
//
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code

//
// Application constants.
//
const K = require('../utils/constants')
const Auth = require('../utils/auth')
const Session = require('../utils/sessions')
const Application = require("../utils/application")

//
// Collections.
//
const users = K.db._collection(K.collection.user.name)

//
// Models.
//
const UserCredentialsModel = require('../models/user_credentials')
const UserDisplayModel = require('../models/user_display')
const ErrorModel = require('../models/error_generic')

//
// Instantiate and export router.
//
const createRouter = require('@arangodb/foxx/router')
const router = createRouter()
module.exports = router
router.tag('Authentication')


/**
 * Login user service
 * This service will login a user given its code and password.
 */
router.post('login', doLogin, 'login')
	.summary('Login user')
	.description(dd
		`
            **Login user**
            
            *Use this service to login.*
        `
	)
	.body(UserCredentialsModel, dd
		`
            **Service parameters**
            
            - \`username\`: The username or user code.
            - \`password\`: The user password.
        `
	)
	.response(200, UserDisplayModel, dd
		`
            **User record**
            
            The service will return the user code, roles and default flag.
        `
	)
	.response(401, ErrorModel, dd
		`
            **Invalid password**
            
            Provided a password that does not match the user authentication data.
        `
	)
	.response(404, ErrorModel, dd
		`
            **Unable to find user**
            
            No user exists with the provided username.
        `
	)

/**
 * Who am I? service
 * This service will return the current user record or an empty object.
 */
router.get('whoami', doWhoAmI, 'whoami')
	.summary('Who am I?')
	.description(dd
		`
            **Current session user**
            
            *Use this service to retrieve information on the current session user.*
        `
	)
	.response(200, UserDisplayModel, dd
		`
            **User record**
            
            The service will return the current user code, roles and default flag.
        `
	)
	.response(404, ErrorModel, dd
		`
            **No current user**
            
            The current session does not have a registered user.
        `
	)

/**
 * Logout user service
 * This service will logout the user and return its record.
 */
router.get('logout', doLogout, 'logout')
	.summary('Logout')
	.description(dd
		`
            **Logout user**
            
            *Use this service to logout.*
        `
	)
	.response(200, UserDisplayModel, dd
		`
            **User record**
            
            The service will return the current user code, roles and default flag.
        `
	)
	.response(404, ErrorModel, dd
		`
            **No current user**
            
            The current session does not have a registered user.
        `
	)


//
// Functions.
//

/**
 *
 * @param request: API request.
 * @param response: API response.
 */
function doLogin(request, response)
{
	//
	// Resolve username.
	//
	const username = request.body.username
	const user = users.firstExample({username})
	if (user) {

		//
		// Resolve password.
		//
		if (Auth.Module.verify(user.auth, request.body.password)) {

			//
			// Save session.
			//
			request.session.uid = user._key
			request.session.data = {
				user: {
					username: user.username,
					role: user.role,
					default: user.default
				}
			}
			request.sessionStorage.save(request.session)

			response.send(request.session.data.user)							// ==>

		} // Valid password.

		else {
			response.throw(
				401,
				K.error.kMSG_UNKNOWN_USER.message[module.context.configuration.language]
			)																	// ==>

		} // Invalid password.

	} // Valid user.

	else {
		response.throw(
			404,
			K.error.kMSG_UNKNOWN_USER.message[module.context.configuration.language]
		)																		// ==>

	} // Invalid user.

} // doLogin()

/**
 * Return current user.
 * @param request: API request.
 * @param response: API response.
 */
function doWhoAmI(request, response) {

	//
	// Check if there is a logged in user.
	//
	if (request.session.uid !== null) {
		response.send(request.session.data.user)
		return                                                                  // ==>
	}

	response.throw(
		404,
		K.error.kMSG_NO_CURRENT_USER.message[module.context.configuration.language]
	)

} // doWhoAmI()

/**
 * Logout current user.
 * @param request: API request.
 * @param response: API response.
 */
function doLogout(request, response)
{
	//
	// Check if there is a logged in user.
	//
	if (request.session.uid !== null) {

		//
		// Save current user.
		//
		const user = JSON.parse(JSON.stringify(request.session.data.user))

		//
		// Clear user from session.
		//
		Session.clearUser(request)

		response.send(user)
		return                                                                  // ==>
	}

	response.throw(
		404,
		K.error.kMSG_NO_CURRENT_USER.message[module.context.configuration.language]
	)                                                                           // ==>

} // doLogout()
