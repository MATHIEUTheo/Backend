const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const app = express()
const port = 4000

app.use(express.json())

app.use(cors())
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const authRoutes = require('./routes/auth')
const bookRoutes = require('./routes/book')
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)

app.listen(port, () => {
	  console.log(`Server running on port ${port}`)
})
