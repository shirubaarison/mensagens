const Mensagem = require('../models/mensagem')
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const mensagensUrl = '/api/mensagens'

const mensagensIniciais = [
    {
        mensagem: 'primeira mensagem xD',
        id: 'm1'
    },
    {
        mensagem: 'segunda mensagem',
        id: 'm2'
    }
]

const mensagensNoDb = async () => {
    const mensagens = await Mensagem.find({})
    return mensagens.map(m => m.toJSON())
}

// Criar 2 usuários para os testes
beforeAll(async () => {
    await User.deleteMany({})

    let passwordHash = await bcrypt.hash('segredo', 10)
    let user = new User({ username: 'teste', passwordHash })
    await user.save()

    passwordHash = await bcrypt.hash('senhalegal', 10)
    user = new User({ username: 'teste2', passwordHash })
    await user.save()
})

// Adicionar as duas mensagens
beforeEach(async () => {
    await Mensagem.deleteMany({})
    let msgObjs = mensagensIniciais.map(m => new Mensagem(m))
    const promisseArray = msgObjs.map(m => m.save())

    await Promise.all(promisseArray)
})

describe('API das mensagens', () => {
    describe('Quando há mensagens no banco de dados...', () => {
        test('Mensagens são retornadas como JSON', async () => {
            await api
                .get(mensagensUrl)
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })

        test('Todas as mensagens são retornadas', async () => {
            const response = await api.get(mensagensUrl)
                
            expect(response.body).toHaveLength(mensagensIniciais.length)
        })
    })

    let token = ''

    describe('Criação de uma mensagem...', () => {
        beforeAll(async () => {
            const usuarioTest = {
                username: 'teste',
                password: 'segredo'
            }

            const response = await api.post('/api/login').send(usuarioTest)
            token = response.body.token
        })

        test('Retorna 201 com sucesso caso há dados válidos', async () => {
            const novaMensagem = {
                mensagem: "oi tudo bem?"
            }

            await api.post('/api/mensagens')
                .send(novaMensagem)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const response = await api.get(mensagensUrl)
            const conteudo = response.body.map(m => m.mensagem)

            expect(response.body).toHaveLength(mensagensIniciais.length + 1)
            expect(conteudo).toContain('oi tudo bem?')
        })

        test('Retorna 400 caso não houver mensagem escrita', async () => {
            const novaMensagem = {
                mensagem: ''
            }

            await api.post('/api/mensagens')
                .send(novaMensagem)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)
        })

        test('Falha retornando 404 se não houver token de autenticação', async () => {
            const novaMensagem = {
                mensagem: 'irei falhar infelizmente'
            }

            await api.post('/api/mensagens')
                .send(novaMensagem)
                .expect(401)
        })
    })

    describe('Deleção de uma mensagem', () => {
        test('Retorna 204 se deletou a mensagem válida', async () => {
            const novaMensagem = {
                mensagem: "oi de novo"
            } 

            const response = await api
                .post(mensagensUrl)
                .send(novaMensagem)
                .set('Authorization', `Bearer ${token}`)

            const deletionId = response.body.id
            
            const mensagensNoInicio = await mensagensNoDb()
            const mensagemParaDeletar = await Mensagem.findById(deletionId)

            await api
                .delete(`${mensagensUrl}/${deletionId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)
            
            const mensagensNoFim = await mensagensNoDb()
            const conteudo = mensagensNoFim.map(m => m.mensagem)
            
            expect(mensagensNoFim).toHaveLength(mensagensNoInicio.length - 1)
            expect(conteudo).not.toContain(mensagemParaDeletar.mensagem)
        })

        test('Retorna 404 se id não existir', async () => {
            const id = new mongoose.Types.ObjectId() 
            await api
                .delete(`${mensagensUrl}/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404)
        })

        test('Falha com 401 se token for inválido', async () => {
            const novaMensagem = {
                mensagem: "oi de novo"
            } 

            const response = await api
                .post(mensagensUrl)
                .send(novaMensagem)
                .set('Authorization', `Bearer ${token}`)

            const deletionId = response.body.id
            
            await api
                .delete(`${mensagensUrl}/${deletionId}`)
                .expect(401)
        })

        test('Falha com 401 se tu não for o autor da mensagem', async () => {
            const novaMensagem = {
                mensagem: "tentando de novo"
            } 

            let response = await api
                .post(mensagensUrl)
                .send(novaMensagem)
                .set('Authorization', `Bearer ${token}`)

            const deletionId = response.body.id 
            
            const novoUsuario = {
                username: 'teste2',
                password: 'senhalegal'
            }

            response = await api.post('/api/login').send(novoUsuario)
            token = response.body.token

            await api
                .delete(`${mensagensUrl}/${deletionId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(401)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})