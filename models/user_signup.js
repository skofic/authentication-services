'use strict'

const _ = require('lodash')
const joi = require('joi')

/**
 * User signup model
 * This model represents the data needed to signup a new user.
 */
module.exports = {
	schema: {
		// Describe the attributes with joi here
		username: joi.string().required(),
		password: joi.string().required(),
		role: joi.array().items(joi.string()).required()
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
