const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()
const secret_key=process.env.SECRET_KEY
module.exports = function (req, res, next) {
	  const token = req.header('Authorization').split(' ')[1]
	  if (!token) return res.status(401).json({ message: 'Accès refusé' })

	  try {
		      const verified = jwt.verify(token, secret_key)
		      req.user = verified

		      next()
		    } catch (err) {
			        res.status(400).json({ message: 'Invalid Token' })
			      }
}