require('dotenv').config()

const PORT = process.env.PORT || 3003

// Usar base de datos de prueba si NODE_ENV es 'test'
const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI 
  : process.env.MONGODB_URI

// Debug: ver qué está pasando (opcional, puedes borrar después)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', PORT)
console.log('MONGODB_URI:', MONGODB_URI ? 'definida' : 'NO DEFINIDA')

const config = { MONGODB_URI, PORT }

module.exports = config