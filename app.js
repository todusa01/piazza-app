const express = require('express')
const app = express()

const mongoose = require('mongoose')
require('dotenv/config')

const bodyParser = require('body-parser')
const authRoutes = require('./routes/auth')
const postsRoute = require('./routes/posts')
const authMiddleware = require('./middlewares/authMiddleware')

app.use(bodyParser.json())
app.use('/auth', authRoutes);
app.use('/posts',postsRoute)

app.get('/', (req,res) =>{
    res.send('Homepage')
})

mongoose.connect(process.env.DB_CONNECTOR, ()=>{
    console.log("Connected to MongoDB")
})

app.listen(3000, ()=>{
    console.log('server is up and running...')
})