const config = require('./utils/config')
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('connecting to', config.MONGODB_URI)
        await mongoose.connect(config.MONGODB_URI)
        console.log('connected to mongoDB')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
    
}

module.exports = connectDB