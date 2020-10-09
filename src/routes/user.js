import Router from 'koa-router';

import Redis from 'koa-redis';

import jwt from 'jsonwebtoken';

import Users from '../dbs/models/users';

import resFormat from '../utils/res-format';

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
    const userData = await Users.findOne({
      username: ctx.request.body.username
    });
    if (userData) {
      if (userData.password === ctx.request.body.password) {
        await Store.hset(token, 'username', username, '_id', userData._id);
        resFormat.success(ctx, '登录成功', { user_id: userData._id, token, userInfo: userData });
      } else {
        resFormat.error(ctx, '密码错误');
      }
    } else {
      resFormat.error(ctx, '该账号还未注册,请先注册');
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
  await addUser(ctx);
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
  const query = ctx.request.query;
  const id = query.userId || ctx.userId;
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
  if (body._id) {
    await Users.where({ _id: body._id }).updateOne(body);
    resFormat.success(ctx, '修改成功');
  } else {
    await addUser(ctx);
  }
});
// 添加用户
async function addUser(ctx) {
  const body = ctx.request.body;
  const username = body.username;
  if (!username) {
    resFormat.error(ctx, '请输入用户名');
  } else if (!body.password) {
    resFormat.error(ctx, '请输入密码');
  } else {
    const findUser = await Users.findOne({ username: username });
    if (findUser) {
      resFormat.error(ctx, '用户名已存在');
      return;
    }

    const user = new Users(body);
    await user.save();
    resFormat.success(ctx, '注册成功');
  }
}

/**
 * @api {get} /user/list/:page/:size 列表
 * @apiGroup 用户中心
 * @apiUse HeaderExample
 * @apiDescription 用户列表
 * @apiSampleRequest /user/list/1/10
 * @apiParam {String} [keyWords]  关键字查询
 * @apiParamExample Request-Example:  "
 * /user/list/1/10?keyWords="一"
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {Number} total 总条数
 * @apiSuccess {Array} list 数据列表
 * @apiSuccess {String} list.username 用户名称
 * @apiSuccess {String} list.phone 电话
 * @apiSuccess {String} list.nickname 昵称
 * @apiError NoPermission Only Admins can access the data.
 * @apiUse ErrorResponse
 * @apiSuccessExample {json} Success-Response:
 *  {
    "code": "success",
    "list": [
        {
            "_id": "5f521868cfa77333a4336ac1",
            "username": "admin",
            "nickname": "超级管理员"
        }
    ],
    "total": 1
}
 */
router.get('/list/:page/:size', async(ctx) => {
  try {
    const query = ctx.request.query;
    const page = parseInt(ctx.params.page);
    const size = parseInt(ctx.params.size);
    const skipNum = (page - 1) * size;
    const params = {};
    if (query.keyWords) {
      const reg = new RegExp(query.keyWords, 'i');
      params.$or = [ // 多条件，数组
        { username: { $regex: reg }},
        { nickname: { $regex: reg }}
      ];
    }

    const list = await Users.find(
      params
    ).skip(skipNum).limit(size)
    // .sort({ _id: -1 })
      .exec();
    const total = await Users.countDocuments(query);
    resFormat.pagingSuccess(ctx, list, total);
  } catch (e) {
    resFormat.error(ctx, '查询失败', e.message);
  }
});

/**
 * @api {post} /user/delete 删除
 * @apiGroup 用户中心
 * @apiDescription 删除
 * @apiParam {String} _id user id
 * @apiSampleRequest /user/delete
 * @apiParamExample Request-Example:
 * {
 *   _id:5f521868cfa77333a4336ac1
 * }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/delete', async (ctx) => {
  const body = ctx.request.body;
  await Users.deleteOne({ _id: body._id });
  resFormat.success(ctx, '操作成功');
});

module.exports = router;
