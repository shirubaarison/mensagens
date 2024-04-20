const bcrypt = require('bcrypt')
const User = require('../models/user')
const usersRouter = require('express').Router() 

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})

    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, password } = request.body
    
    if (!password || !username) return response.status(400).json({ error: 'missing username and/or password' })
    if (password.length < 3) return response.status(400).json({ error: 'password must be more than 3 characters' })

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})


module.exports = usersRouter