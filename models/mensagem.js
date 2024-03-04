const mongoose = require('mongoose')

const mensagemSchema = new mongoose.Schema({
    mensagem: String,
    autor: String, 
})

mensagemSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
    }
})


module.exports = mongoose.model('Mensagem', mensagemSchema)