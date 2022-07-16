const express = require('express')
const { check, validationResult } = require('express-validator')
const db = require('../db')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secret = 'nullaurora'
//login
router.post(
  '/login',
  [
    check('username')
      .notEmpty()
      .withMessage('用户名不能为空')
      .isLength({ min: 3 })
      .withMessage('用户名长度不能小于三'),
    check('password').notEmpty().withMessage('密码不能为空'),
  ],
  (req, res) => {
    const { errors } = validationResult(req)
    //判断字符串合法性
    if (errors.length === 0) {
      //根据用户名去查
      db.query(
        'select * from ev_users where username = ?',
        [req.body.username],
        (err, result) => {
          if (result.length===0) {
            res.send({
              status:1,
              message:'用户名不存在'
            })
            }else{
              const bool = bcrypt.compareSync(
                req.body.password,
                result[0].password
              )
              if (bool){
                let obj = result[0]
                delete obj.password
                delete obj.user_pic
                const token = jwt.sign({
                  exp:Math.floor(Date.now()/1000)+60*60,
                  data:obj
                },secret)
                res.send({
                  status:0,
                  message:'登陆成功',
                  token:'Bearer '+token
                })
              }else{
                res.send({
                  status:1,
                  message:'密码输入错误'
                })
              }
          }
        }
      )
    } else {
      res.send({
        status: 1,
        message: errors[0].msg,
      })
    }
  }
)
//register
router.post(
  '/register',
  [
    check('username')
      .notEmpty()
      .withMessage('用户名不能为空')
      .isLength({ min: 3 })
      .withMessage('用户名长度不能小于三'),
    check('password').notEmpty().withMessage('密码不能为空'),
  ],
  (req, res) => {
    const { errors } = validationResult(req)
    //判断字符串合法性
    if (errors.length === 0) {
      //查询相同的用户名
      db.query(
        'SELECT count(*) as total from ev_users where username=?',
        [req.body.username],
        (err, result) => {
          if (err) throw new Error(err)
          if (result[0].total === 0) {
            req.body.password = bcrypt.hashSync(req.body.password, 10)
            db.query(
              'insert into ev_users (username, password) values (?,?)',
              [req.body.username, req.body.password],
              (err, result) => {
                if (err) throw new Error(err)
                if (result.affectedRows === 1) {
                  res.send({
                    status: 0,
                    message: '注册成功',
                  })
                } else {
                  throw new Error('注册失败')
                }
              }
            )
          } else {
            return res.send({
              status: 1,
              message: '用户名不能重复',
            })
          }
        }
      )
    } else {
      res.send({
        status: 1,
        message: errors[0].msg,
      })
    }
  }
)
module.exports = router
