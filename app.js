const config = require('./utils/config')
const express = require('express')
const connectDB = require('./connect')
const usersRouter = require('./controllers/users')
const mensagensRouter = require('./controllers/mensagens')
const loginRouter = require('./controllers/login')


const app = express()
const cors = require('cors')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
connectDB()

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/mensagens', mensagensRouter)

module.exports = app