const bcrypt = require('bcrypt')
const User = require('../models/user')
const usersRouter = require('express').Router() 

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})

    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, password } = request.body
    
    if (!password || !username) return response.status(400).json({ error: 'ta faltando username ou a senha' })

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        passwordHash
    })

    try {
        const savedUser = await user.save()
        return response.status(201).json(savedUser)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return response.status(400).json({ error: "usuario ja existe pai..." })
        }
    }
})


module.exports = usersRouter