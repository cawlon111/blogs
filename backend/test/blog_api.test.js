const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

// ✅ OPTIMIZADO: Usa Promise.all para ejecutar saves en paralelo
beforeEach(async () => {
  await Blog.deleteMany({})
  
  const savePromises = helper.initialBlogs.map(blog => {
    const blogObject = new Blog(blog)
    return blogObject.save()
  })
  
  await Promise.all(savePromises)
})

describe('GET /api/blogs', () => {
  
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns the correct number of blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blogs have an id property (not _id)', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('returns 404 if blog does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()
    
    await api
      .get(`/api/blogs/${nonExistingId}`)
      .expect(404)
  })

  test('returns 400 if id is malformed', async () => {
    await api
      .get('/api/blogs/12345')
      .expect(400)
  })
})

describe('POST /api/blogs', () => {
  
  test('creates a new blog successfully', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://test.com',
      likes: 7
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    
    const titles = blogsAtEnd.map(blog => blog.title)
    assert.ok(titles.includes('Test Blog'))
  })

  test('if likes is missing, defaults to 0', async () => {
    const newBlog = {
      title: 'Blog Without Likes',
      author: 'Test Author',
      url: 'https://test.com'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('returns 400 if title is missing', async () => {
    const newBlog = {
      author: 'Test Author',
      url: 'https://test.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('returns 400 if url is missing', async () => {
    const newBlog = {
      title: 'Blog Without URL',
      author: 'Test Author',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('DELETE /api/blogs/:id', () => {
  
  test('deletes a blog successfully', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const ids = blogsAtEnd.map(blog => blog.id)
    assert.ok(!ids.includes(blogToDelete.id))
  })

  test('a blog can be deleted and content is removed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(blog => blog.title)
    
    assert.ok(!titles.includes(blogToDelete.title))
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })

  test('returns 400 if id is malformed', async () => {
    await api
      .delete('/api/blogs/12345')
      .expect(400)
  })
})

describe('PUT /api/blogs/:id', () => {
  
  test('updates a blog successfully', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 10
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
  })

  test('returns 400 if id is malformed', async () => {
    await api
      .put('/api/blogs/12345')
      .send({ likes: 5 })
      .expect(400)
  })
})

// Cerrar la conexión de mongoose después de todas las pruebas
after(async () => {
  await mongoose.connection.close()
})