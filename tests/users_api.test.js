const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const userUrl = '/api/users'

beforeAll(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('segredo', 10)
    const user = new User({ username: 'teste', passwordHash })
    await user.save()
})

describe('API dos usuários', () => {
    describe('Quando há algum usuário no banco de dados...', () => {
        test('Todos os usuários são retornados como JSON', async () => {
            await api
                .get(userUrl)
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
    })
    describe('Criação de conta', () => {
        test('Retorna 201 se conseguir registrar usuário com dados válidos', async () => {
            const criarUser = {
                username: 'caralegal',
                password: 'senhalegal123'
            }

            await api
                .post(userUrl)
                .send(criarUser)
                .expect(201)
        })
        test('Retorna 409 se nome de usuário já existe', async () => {
            const criarUser = {
                username: 'teste',
                password: 'senhalegal123'
            }

            await api
                .post(userUrl)
                .send(criarUser)
                .expect(409)
        })

        test('Retorna 400 se nome de usuário não for enviado', async () => {
            const criarUser = {
                password: 'senhalegal123'
            }

            await api
                .post(userUrl)
                .send(criarUser)
                .expect(400)
        })

        test('Retorna 400 se senha não for enviado', async () => {
            const criarUser = {
                username: 'legal'
            }

            await api
                .post(userUrl)
                .send(criarUser)
                .expect(400)
        })
    })
    
})

afterAll(async () => {
    await mongoose.connection.close()
})