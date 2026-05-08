const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      name: 'Superuser',
      passwordHash
    })
    await user.save()
    
    // Verificar que se guardó correctamente
    const saved = await User.findOne({ username: 'root' })
    console.log('Saved user in beforeEach:', saved ? saved.username : 'NOT FOUND')
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'samuel',
      name: 'Samuel',
      password: 'password123'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    const usernames = usersAtEnd.map(u => u.username)
    assert.ok(usernames.includes('samuel'))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await User.find({})
    
    // Verificar que el usuario root existe
    const rootUser = await User.findOne({ username: 'root' })
    console.log('Root user exists:', rootUser ? rootUser.username : 'NO')

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'password123'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await User.find({})
    assert.strictEqual(result.body.error, 'username must be unique')
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails if username is too short (<3)', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'ab',
      name: 'Too Short',
      password: 'password123'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await User.find({})
    assert.strictEqual(result.body.error, 'username must be at least 3 characters long')
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails if password is too short (<3)', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'validuser',
      name: 'Valid User',
      password: '12'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await User.find({})
    assert.strictEqual(result.body.error, 'password must be at least 3 characters long')
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})