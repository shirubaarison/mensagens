const WebSocket = require('ws')

const connectedClients = new Set()

const startWebSocketServer = () => {
    const wss = new WebSocket.Server({ port: 3002 })

    wss.on('connection', (ws) => {
        console.log('nova conexão no webSocket')

        connectedClients.add(ws)

        ws.on('message', (data, isBinary) => {
            const message = isBinary ? data : data.toString()
            console.log('received ', message)
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message)
                }
            })
        })

        ws.on('close', () => {
            console.log('client desconectado')
            connectedClients.delete(wss)
        })
    })

    return wss
}

const getConnectedClients = () => {
    return Array.from(connectedClients)
}

module.exports = { startWebSocketServer, getConnectedClients }