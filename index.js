const config = require('./utils/config')
const app = require('./app')

const { startWebSocketServer } = require('./sockets/webSocketServer')
const ws = startWebSocketServer()

const server = app.listen(config.PORT, () => {
	console.log(`Server rodando na porta: ${config.PORT}`)
})

server.on('upgrade', (request, socket, head) => {
	ws.handleUpgrade(request, socket, head, (wss) => {
		ws.emit('connection', wss, request)
	}) 
})
