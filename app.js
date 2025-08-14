const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

//local imports
const scraping = require('./utils/scraping')
const scrapeFormBlueprint = require('./utils/blueprint')
const prisma = require('./config/prisma/client')
const authRoutes = require('./routes/authRoutes')

//config
dotenv.config()
const port = process.env.PORT
const app = express()

//middlewares
app.use(express.json())
app.use(cors({
    origin : '*'
}))

//server check
app.get('/', (req,res,next)=>{
    res.send("Hellow to server")
}) 
app.use('/api', authRoutes)

//server listen
async function startServer() {
  await prisma.$connect();
  console.log('Database connected');
}
startServer();


