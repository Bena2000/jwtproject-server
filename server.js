
require('dotenv').config()

const express = require('express')
const app =express()
const jwt = require('jsonwebtoken')
// app.use(logger('dev'));
app.use(express.json())

const posts=[
    {
        username:"Piotr",
        title: "title 1"
    },
    {
        username:"Jan",
        title: "title 2"
    }
]


app.get('/', function(req, res, next) {
    res.render('index', { error: false,logged: false });
  });

app.get('/posts',authenticateToken,(req,res)=>{

    res.json(posts.filter(post=>post.username === req.user.name))
})

function authenticateToken(req,res,next)
{
    console.log("Authenticate")
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] //poniewaz: Bearer TOKEN
    if(token==null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403)
        console.log("Jest ok")
        req.user = user
        next()
    })
}

app.listen(5000)