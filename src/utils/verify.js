/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: 校验token信息
 */

import Redis from 'koa-redis';
const Store = new Redis().client;
const verify = async function(ctx, next) {
  const headerToken = ctx.request.header['x-access-token'];
  if (ctx.request.header && headerToken) {
    const _id = await Store.hget(headerToken, '_id');
    const username = await Store.hget(headerToken, 'username');
    if (_id) {
      ctx.userId = _id;
      ctx.username = username;
      await next();
    } else {
      ctx.body = {
        code: 401,
        message: '无效token'
      };
    }
  } else {
    await next();
  }
};
const verifyUser = function() {
  return verify;
};
export default verifyUser;
