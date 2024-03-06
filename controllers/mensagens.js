const mensagensRouter = require('express').Router()
const Mensagem = require('../models/mensagem')
const { getConnectedClients } = require('../sockets/webSocketServer')

mensagensRouter.get('/', async (request, response) => {
    const mensagens = await Mensagem.find({})

    response.json(mensagens)
})

mensagensRouter.post('/', async (request, response) => {
    const body = request.body
    console.log(body)
    const { mensagem, autor } = request.body

    if (!mensagem || !autor) {
        return response.status(400).end()
    }

    const novaMensagem = new Mensagem({
        mensagem: mensagem,
        autor: autor
    })

    const mensagemSalva = await novaMensagem.save()

    response.status(201).json(mensagemSalva)
})

mensagensRouter.delete('/:id', async (request, response) => {    
    try {
        await Mensagem.findByIdAndDelete(request.params.id)
        return response.status(204).end()
    } catch (error) {
        return response.status(404).end()
    }
})

mensagensRouter.get('/usuariosConectados', async (request, response) => {
    const valores = getConnectedClients()
    
    return response.json(valores)
})

module.exports = mensagensRouter