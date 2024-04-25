const config = require('./utils/config')
const mongoose = require('mongoose');

mongoose.set('strictQuery', false)

const connectDB = async () => {
    try {
        console.log('conectando em ', config.MONGODB_URI)
        mongoose.connect(config.MONGODB_URI)
        console.log('conectado ao mongoDB')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB