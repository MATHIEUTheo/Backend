const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
	  const token = req.header('Authorization').split(' ')[1]
	  if (!token) return res.status(401).json({ message: 'Accès refusé' })

	  try {
		      const verified = jwt.verify(token, '8nTb#98/3HHi)f')
		      req.user = verified

		      next()
		    } catch (err) {
			        res.status(400).json({ message: 'Invalid Token' })
			      }
}