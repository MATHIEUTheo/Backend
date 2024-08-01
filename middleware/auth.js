const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
	  const token = req.header('Authorization').split(' ')[1];
	  if (!token) return res.status(401).json({ message: 'Access Denied' });

	  try {
		      const verified = jwt.verify(token, 'SECRET_KEY');
		      req.user = verified;

//		      console.log("ID utilisateur (depuis le token JWT):", req.user._id); // Affiche l'ID utilisateur

		      next();
		    } catch (err) {
			        res.status(400).json({ message: 'Invalid Token' });
			      }
};

