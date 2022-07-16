const express = require('express')
const app = express()
//cors middleware
const cors = require('cors')
app.use(cors())
app.use(express.urlencoded({ extended: false }))
//解析jwt的数据，只有my开头的才有效果
const {expressjwt} =require('express-jwt')
const secret = 'nullaurora'
app.use('/my',expressjwt({secret,algorithms:['HS256']}))
//api router
const apiRouter = require('./router/api')
app.use('/api', apiRouter)
//my router
const myRouter = require('./router/my')
app.use('/my', myRouter)
//err middleware
app.use((err, req, res, next) => {
  console.log(err)
  res.send({
    status: 1,
    message: err.message,
  })
})
app.listen(3007, () => console.log('service started successful'))
