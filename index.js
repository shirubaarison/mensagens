const config = require('./utils/config')
const app = require('./app')
const WebSocket = require('ws')

const ws = new WebSocket.Server({ port: 3002 })

ws.on('connection', (wss) => {
	console.log('new websocket connection')

	wss.on('message', (data, isBinary) => {
		const message = isBinary ? data : data.toString()
		console.log('received ', message)
		ws.clients.forEach(client => {
			if (client !== wss && client.readyState === WebSocket.OPEN) {
				client.send(message)
			}
		})
	})
})

const server = app.listen(config.PORT, () => {
	console.log(`Server running on port ${config.PORT}`)
})

server.on('upgrade', (request, socket, head) => {
	ws.handleUpgrade(request, socket, head, (wss) => {
		ws.emit('connection', wss, request)
	}) 
})
