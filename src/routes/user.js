import Router from 'koa-router';

import Redis from 'koa-redis';

import jwt from 'jsonwebtoken';

import Users from '../dbs/models/users';

import resFormat from '../utils/res-format';
import logger from '../../logs/log4';

const Store = new Redis().client;

const router = new Router({ prefix: '/user' });

/**
 * @api {post} /user/login 用户登录
 * @apiGroup 用户中心
 * @apiDescription 用户登录
 * @apiSampleRequest /user/login
 * @apiParam {String} username 账号
 * @apiParam {String} password 密码
 * @apiParamExample {json} Request-Example:
 * {
    "username":"admin",
    "password":"123456"
}
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/login', async(ctx, next) => {
  const username = ctx.request.body.username;
  if (!username) {
    resFormat.error(ctx, '请输入用户名');
  } else if (!ctx.request.body.password) {
    resFormat.error(ctx, '请输入密码');
  } else {
    let data = null;
    // 生成token
    const token = jwt.sign(
      {
        name: ctx.request.body // 需要放到token的参数
      },
      'ancientApi', // 加密的密文，私钥对应着公钥
      {
        expiresIn: 60 * 60 // 60分钟到期时间
      }
    );
    const exitToken = await Store.hget(username, 'token');
    if (exitToken) {
      await Store.del(exitToken);
    }
    await Store.hset(username, 'token', token);
    data = await Users.findOne({
      username: ctx.request.body.username,
      password: ctx.request.body.password
    });
    await Store.hset(token, 'username', username, '_id', data._id);
    if (data) {
      resFormat.success(ctx, '登录成功', { user_id: data._id, token, userInfo: data });
    } else {
      resFormat.error(ctx, '登录失败');
    }
  }
});

/**
 * @api {post} /user/register 用户注册
 * @apiGroup 用户中心
 * @apiDescription 用户注册
 * @apiSampleRequest /user/register
 * @apiParam {String} username 账号
 * @apiParam {String} password 密码
 * @apiParamExample {json} Request-Example:
 * {
    "username":"admin",
    "password":"123456"
  }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/register', async(ctx, next) => {
  const username = ctx.request.body.username;
  if (!username) {
    resFormat.error(ctx, '请输入用户名');
  } else if (!ctx.request.body.password) {
    resFormat.error(ctx, '请输入密码');
  } else {
    const findUser = await Users.findOne({ username: username });
    if (findUser) {
      resFormat.error(ctx, '用户名已存在');
      return;
    }

    const user = new Users({
      username,
      password: ctx.request.body.password,
      headPortrait: ctx.request.body.headPortrait
    });
    await user.save();
    resFormat.success(ctx, '注册成功');
  }
});
/**
 * @api {get} /user/userInfo 获取用户信息
 * @apiGroup 用户中心
 * @apiDescription 用户信息
 * @apiSampleRequest /user/userInfo
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.get('/userInfo', async(ctx, next) => {
  const id = ctx.userId;
  const data = await Users.findOne({
    _id: id
  });
  resFormat.success(ctx, '查询成功', data);
});

/**
 * @api {post} /user/register 更新用户信息
 * @apiGroup 用户中心
 * @apiDescription 更新用户信息
 * @apiSampleRequest /user/update
 * @apiParam {String} username 账号
 * @apiParam {String} password 密码
 * @apiParam {String} phone 手机号
 * @apiParam {String} nickname 昵称
 * @apiParam {String} headPortrait 头像
 * @apiParamExample {json} Request-Example:
 * {
    "username":"admin",
    "password":"123456",
    "phone":"15001122222",
    "nickname":"詹姆斯",
    "headPortrait":"",
  }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/update', async(ctx, next) => {
  const body = ctx.request.body;
  await Users.where({ _id: body._id }).updateOne(body);
  resFormat.success(ctx, '修改成功');
}
);

module.exports = router;
