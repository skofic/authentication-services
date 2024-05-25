'use strict'

//
// Application.
//
const K = require("./utils/constants")
const Session = require('./utils/sessions')

//
// Routes.
//
module.context.use('/auth', require('./routes/authentication'), 'auth')
module.context.use('/user', require('./routes/credentials'), 'user')
module.context.use('/util', require('./routes/utils'), 'utils')

//
// Sessions.
//
module.context.use(Session.Session)

//
// Ensure a user is logged in.
//
module.context.use(
	(request, response, next) => {

		//
		// Request has user _key.
		//
		if(request.session.uid)
		{
			try
			{
				//
				// Get user.
				//
				const user =
					K.db._collection(K.collection.user.name)
						.document(request.session.uid)

				//
				// Save in session.
				//
				Session.setUser(request, user)

			} catch (error) {
				Session.clearUser(request)
			}
		}
		next()
	}
)
