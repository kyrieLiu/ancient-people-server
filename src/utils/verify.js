/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: 校验token信息
 */

import Redis from 'koa-redis';

const Store = new Redis().client;
const verify = async function(ctx, next) {
  if (ctx.request.header && ctx.request.header.x_access_token) {
    const headerToken = ctx.request.header.x_access_token;
    const userInfo = await Store.hget(headerToken, 'username');
    if (userInfo) {
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
