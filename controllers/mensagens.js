const mensagensRouter = require('express').Router()
const Mensagem = require('../models/mensagem')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { getConnectedClients } = require('../sockets/webSocketServer')

const getTokenFrom = request => {
    const auth = request.get('authorization')
    if (auth && auth.startsWith('Bearer ')) {
        return auth.replace('Bearer ', '')
    }
    return null
}


mensagensRouter.get('/', async (request, response) => {
    const mensagens = await Mensagem.find({}).populate('user', { username: 1})

    response.json(mensagens)
})

mensagensRouter.post('/', async (request, response) => {
    console.log(request.body)
    
    const { mensagem } = request.body

    if (!mensagem) {
        return response.status(400).end()
    }
    
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'Token inválido' })
	}
    
    const user = await User.findById(decodedToken.id)

    const novaMensagem = new Mensagem({
        mensagem: mensagem,
        user: user.id
    })

    const mensagemSalva = await novaMensagem.save()
    user.mensagens = user.mensagens.concat(mensagemSalva._id)
	await user.save()

    await mensagemSalva.populate('user', { username: 1 })

    response.status(201).json(mensagemSalva)
})

mensagensRouter.delete('/:id', async (request, response) => {    
    const mensagem = await Mensagem.findById(request.params.id)
	if (!mensagem) {
		return response.status(404).end()
	}
    
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'Token inválido' })
	}

    const user = await User.findById(decodedToken.id)

    if (mensagem.user.toString() !== user.id) {
		return response.status(401).end()
	}

    await Mensagem.findByIdAndDelete(request.params.id)
	return response.status(204).end()
})

mensagensRouter.get('/usuariosConectados', async (request, response) => {
    const valores = getConnectedClients()
    
    response.json(valores)
})

mensagensRouter.post('/reset', async(request, response) => {
    await Mensagem.deleteMany({})

    console.log('reset')
    response.status(204).end()
})

module.exports = mensagensRouter