'use strict'

const _ = require('lodash')
const joi = require('joi')

/**
 * User change password model
 * This model represents the user document returned by authentication services
 * when changing the user password.
 */
module.exports = {
	schema: {
		// Describe the attributes with joi here
		username: joi.string().required(),
		default: joi.boolean().default(false).required()
	},

	forClient(obj) {
		// Implement outgoing transformations here
		obj = _.omit(obj, ['_id', '_rev', '_oldRev', 'auth'])
		return obj
	},

	fromClient(obj) {
		// Implement incoming transformations here
		return obj
	}
}
