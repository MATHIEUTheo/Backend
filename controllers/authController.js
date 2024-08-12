const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const dotenv = require('dotenv')

dotenv.config()
const secret_key=process.env.SECRET_KEY

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
  return regex.test(password)
}

exports.signup = async (req, res) => {
  const { email, password } = req.body
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Le mot de passe doit contenir au moins 8 caractères, incluant des lettres minuscules, majuscules, des chiffres et au moins un caractère spécial."
    })
  }
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser = new User({ email, password: hashedPassword })
  try {
    const savedUser = await newUser.save()
    res.status(201).json(savedUser)
  } catch (err) {
    res.status(409).json({ message: "Compte déjà existant" })
  }
}

exports.login = async (req, res) => {
  let validPass
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Les champs doivent tous être rempli' })
  const user = await User.findOne({ email })
  if (user) validPass = await bcrypt.compare(password, user.password)
  if (!user || !validPass) return res.status(401).json({ message: 'Email ou mot de passe invalide' })

  const token = jwt.sign({ _id: user._id }, secret_key)
  const userId = user._id
  res.status(200).json({ token, userId })
}
