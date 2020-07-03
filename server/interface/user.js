import Router from 'koa-router';

import Redis from 'koa-redis';

import jwt from 'jsonwebtoken';

import Users from '../dbs/models/users';

const Store = new Redis().client;

const router = new Router({ prefix: '/user' });

router.post('/login', async(ctx, next) => {
  const username = ctx.request.body.username;
  if (!username) {
    ctx.body = { message: '请输入用户名' };
  } else if (!ctx.request.body.password) {
    ctx.body = { message: '请输入密码' };
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
    await Store.hset(token, 'username', username, 'password', ctx.request.body.password);
    await Store.hset(username, 'token', token);
    data = await Users.findOne({
      username: ctx.request.body.username,
      password: ctx.request.body.password
    });

    if (data) {
      ctx.body = {
        data: { user_id: data._id, token, userInfo: data },
        code: 0,
        message: '登陆成功'
      };
    } else { ctx.body = { message: '登陆失败' }; }
  }
});

router.post('/register', async(ctx, next) => {
  const username = ctx.request.body.username;
  if (!username) {
    ctx.body = { message: '请输入用户名' };
  } else if (!ctx.request.body.password) {
    ctx.body = { message: '请输入密码' };
  } else {
    const findUser = await Users.findOne({ username: username });
    if (findUser) {
      ctx.body = { message: '用户名已存在' };
      return;
    }

    const user = new Users({
      username,
      password: ctx.request.body.password,
      headPortrait: ctx.request.body.headPortrait
    });
    try {
      await user.save();
      ctx.body = {
        code: 0,
        message: '注册成功'
      };
    } catch (e) {
      ctx.body = {
        code: -1,
        message: '注册失败'
      };
    }
  }
});

export default router;
