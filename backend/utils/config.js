require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

const config = { MONGODB_URI, PORT }

module.exports = config