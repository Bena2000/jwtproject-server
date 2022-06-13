
require('dotenv').config()

const express = require('express')
const app =express()
const jwt = require('jsonwebtoken')
var cors = require('cors')
app.use(cors());

app.use(express.json())

let refreshTokens=[]

app.delete('/logout',(req,res)=>{
    console.log(refreshTokens)
    // refreshTokens = refreshTokens.filter(token => token != req.body.token)
    refreshTokens = []
    console.log(refreshTokens)
    res.sendStatus(204)
 })

app.post('/token',(req,res)=>{
   const refreshToken = req.body.token
   if(refreshToken==null) res.sendStatus(401)
   if(!refreshTokens.includes(refreshToken)) res.sendStatus(403)
   jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
       if(err) return res.sendStatus(403)
       const accessToken = generateAccessToken({name:user.name, password:user.pass})
       res.json({accessToken:accessToken})
   })
})

app.post('/login',(req,res)=>{
    console.log(req.body);
    const username = req.body.username
    const password = req.body.password
    const user={name: username, pass: password}

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    refreshTokens.push(refreshToken)

    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

function generateAccessToken(user)
{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'20s'})
}

function generateRefreshToken(user)
{
    return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
}

const posts=[
    {
        username:"Piotr",
        password: "pass1"
    },
    {
        username:"Jan",
        password: "pass2"
    }
]

app.get('/verify',authenticateToken,(req,res)=>{

    const user = posts.filter(post=>post.username === req.user.name);
    res.json(user)
    // const authHeader = req.headers['authorization']
    // res.json({token: authHeader[1]})
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

app.listen(4000)