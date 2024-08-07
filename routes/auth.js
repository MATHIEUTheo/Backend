const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

router.post('/signup', async (req, res) => {
	  const { email, password } = req.body
	  const salt = await bcrypt.genSalt(10)
	  const hashedPassword = await bcrypt.hash(password, salt)

	  const newUser = new User({ email, password: hashedPassword })
	  try {
		      const savedUser = await newUser.save()
		      res.status(201).json(savedUser)
		    } catch (err) {
			        res.status(400).json({ message: "Compte déjà existant" })
			      }
})

router.post('/login', async (req, res) => {
	  const { email, password } = req.body
	  const user = await User.findOne({ email })
	  if (!user) return res.status(400).json({ message: 'Email ou mot de passe invalide' })

	  const validPass = await bcrypt.compare(password, user.password)
	  if (!validPass) return res.status(400).json({ message: 'Email ou mot de passe invalide' })

	  const token = jwt.sign({ _id: user._id }, '8nTb#98/3HHi)f')
	  const userId = user._id
	  res.status(200).json({ token, userId })
})

module.exports = router

