const WebSocket = require('ws')

const connectedClients = new Set()

const startWebSocketServer = () => {
    const wss = new WebSocket.Server({ port: 3002 })

    wss.on('connection', (ws) => {
        console.log('nova conexão no webSocket')
    
        ws.on('message', (data, isBinary) => {
            const message = isBinary ? data : data.toString()
            console.log('received ', message)
            
            const parsed = JSON.parse(message)
            if (parsed.novoUser) {
                connectedClients.add(parsed.novoUser)
                ws.user = parsed.novoUser
            }

            if (parsed.saiuUser) {
                connectedClients.delete(parsed.saiuUser)
            }
            
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message)
                }
            })
        })

        ws.on('close', (code, data) => {
            console.log('client desconectado: ', ws.user)
            connectedClients.delete(ws.user)
        })
    })

    return wss
}

const getConnectedClients = () => {
    return Array.from(connectedClients)
}

module.exports = { startWebSocketServer, getConnectedClients }