const express = require('express')
const router = express.Router()
const db = require('../db')
const { check, validationResult } = require('express-validator')
//获取用户信息
router.get('/userinfo', (req, res) => {
  let id = req.auth.data.id
  db.query(
    'select id,username,nickname,email,user_pic from ev_users where id =?',
    [id],
    (err, result) => {
      if (result === 0) {
        res.send({
          status: 1,
          message: '查询失败',
        })
      } else {
        res.send({
          status: 0,
          message: '查询成功',
          data: result[0],
        })
      }
    }
  )
})
//更新用户基本信息
router.post(
  '/userinfo',
  [
    check('id').isInt().withMessage('id必须是整数'),
    check('nickname').isLength({ min: 4 }).withMessage('昵称长度要大于4'),
    check('email').isEmail().withMessage('邮箱格式不正确'),
  ],
  (req, res) => {
    const { errors } = validationResult(req)
    if (errors.length === 0) {
      db.query(
        'update ev_users set nickname=?,email=?where id =?',
        [req.body.nickname, req.body.email, req.body.id],
        (err, result) => {
          if (result.affectedRows === 1) {
            res.send({
              status: 0,
              message: '更新成功',
            })
          } else {
            res.send({
              status: 1,
              message: '更新失败',
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
//更换头像
router.post(
  '/update/avatar',
  [check('avatar').isDataURI().withMessage('头像格式不是base64')],
  (req, res) => {
    const { errors } = validationResult(req)
    if (errors.length === 0) {
      db.query(
        'update ev_users set user_pic=?where id =?',
        [req.body.avatar,req.auth.data.id],
        (err, result) => {
          if (result.affectedRows === 1) {
            res.send({
              status: 0,
              message: '更新成功',
            })
          } else {
            res.send({
              status: 1,
              message: '更新失败',
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

//

module.exports = router
