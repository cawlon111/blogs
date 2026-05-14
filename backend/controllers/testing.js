const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  console.log('Base de datos limpiada') // Para depurar
  response.status(204).end()
})

module.exports = router