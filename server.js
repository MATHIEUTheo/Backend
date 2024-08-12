const express = require('express')
const mongoose = require('mongoose')
const dotenv = require ('dotenv')
const cors = require('cors')
const path = require('path')

const app = express()
const port = 4000

app.use(express.json())

app.use(cors())
dotenv.config()

const dbName=process.env.MONGODB_DB
const dbHost=process.env.MONGODB_HOST
const dbPort=process.env.MONGODB_PORT
const uriDb=`mongodb://${dbHost}:${dbPort}/${dbName}`
mongoose.connect(uriDb, { useNewUrlParser: true, useUnifiedTopology: true })

app.use('/images', express.static(path.join(__dirname, 'images')))

const authRoutes = require('./routes/auth')
const bookRoutes = require('./routes/book')
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)

app.listen(port, () => {
	  console.log(`Server running on port ${port}`)
})
