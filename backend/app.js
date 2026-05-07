const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

// ✅ Ruta de bienvenida en la raíz
app.get('/', (request, response) => {
  response.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Blog List API</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          h1 {
            color: #4a90e2;
          }
          .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          code {
            background: #e0e0e0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            margin: 10px 0;
          }
          .endpoint {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <h1>📝 Blog List API</h1>
        <div class="card">
          <h2>Bienvenido a la API de Blogs</h2>
          <p>Esta API REST permite gestionar blogs. Los blogs se guardan en MongoDB Atlas.</p>
        </div>
        
        <div class="card">
          <h2>📌 Endpoints disponibles:</h2>
          <ul>
            <li>
              <strong>GET</strong>
              <code>/api/blogs</code>
              <span>- Obtener todos los blogs</span>
            </li>
            <li>
              <strong>POST</strong>
              <code>/api/blogs</code>
              <span>- Crear un nuevo blog</span>
            </li>
          </ul>
        </div>

        <div class="card">
          <h2>🚀 Ejemplo de uso (POST):</h2>
          <div class="endpoint">
            POST /api/blogs<br/>
            Content-Type: application/json<br/><br/>
            {<br/>
            &nbsp;&nbsp;"title": "Mi primer blog",<br/>
            &nbsp;&nbsp;"author": "Samuel",<br/>
            &nbsp;&nbsp;"url": "https://samuel.dev",<br/>
            &nbsp;&nbsp;"likes": 10<br/>
            }
          </div>
        </div>

        <div class="card">
          <h2>🔗 Probar la API:</h2>
          <ul>
            <li><a href="/api/blogs" target="_blank">Ver todos los blogs → /api/blogs</a></li>
          </ul>
        </div>
      </body>
    </html>
  `)
})

// Rutas de la API
app.use('/api/blogs', blogsRouter)

// Middleware para endpoints no encontrados (404)
app.use(middleware.unknownEndpoint)

// Middleware para manejo de errores
app.use(middleware.errorHandler)

module.exports = app