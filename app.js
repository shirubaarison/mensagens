const config = require('./utils/config')
const express = require('express')
const app = express()
app.use(express.json())
const connectDB = require('./connect')
const mensagensRouter = require('./controllers/mensagens')

connectDB()

app.use('/api/mensagens', mensagensRouter)

module.exports = app