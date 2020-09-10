/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: 校验token信息
 */

import Redis from 'koa-redis';
import logger from '../../logs/log4';
const Store = new Redis().client;
const verify = async function(ctx, next) {
  logger.debug('请求  request.header.x_access_token==', ctx.request.header.x_access_token);
  logger.debug('请求  request.header==', ctx.request.header);
  if (ctx.request.header && ctx.request.header.x_access_token) {
    const headerToken = ctx.request.header.x_access_token;
    const _id = await Store.hget(headerToken, '_id');
    const username = await Store.hget(headerToken, 'username');
    logger.debug('验证  _id==', _id, 'headerToken', headerToken);
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
