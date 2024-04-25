const Mensagem = require('../models/mensagem')
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const loginUrl = '/api/login'

beforeAll(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('segredo', 10)
    const user = new User({ username: 'teste', passwordHash })
    await user.save()
})

describe('API do login', () => {
    test('Retorna 200 se enviar dados válidos', async () => {
        const usuario = {
            username: 'teste',
            password: 'segredo'
        }

        await api
            .post(loginUrl)
            .send(usuario)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('Retorna 404 se não encontrar usuário', async () => {
        const usuario = {
            username: 'teste2',
            password: 'segredo'
        }

        await api
            .post(loginUrl)
            .send(usuario)
            .expect(404)
    })

    test('Retorna 401 se senha estiver incorreta', async () => {
        const usuario = {
            username: 'teste',
            password: 'esqueciasenha'
        }

        await api
            .post(loginUrl)
            .send(usuario)
            .expect(401)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})