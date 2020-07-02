/**
 * author Liu Yin
 * date 2020/6/21
 * Description:
 */

import Koa from 'koa';

const bodyParser = require('koa-bodyparser');
import cors from 'koa-cors';
import mongoose from 'mongoose';

import dbConfig from './dbs/config';

import verifyUser from './utils/verify';
import user from './interface/user';
import goods from '../server/interface/goods';

const app = new Koa();

app.use(bodyParser({
  extendTypes: ['json', 'form', 'text']
}));
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use(cors());

// 验证用户信息
app.use(verifyUser());
// 配置接口路径
app.use(user.routes()).use(user.allowedMethods());
app.use(goods.routes()).use(goods.allowedMethods());

app.use(async(ctx, next) => {
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  console.log(`${ctx.request.method} ${ctx.request.url}: ${ms}ms`);
  console.log(process.env.NODE_ENV);
  ctx.response.set('X-Response-Time', `${ms}ms`);
});

/* app.use(async(ctx, next) => {
  await next();
  ctx.response.type = 'text/html';
  ctx.response.body = '<h1>Hello, koa2!</h1>';
});*/

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3002;
app.listen(port, host);
console.log(`Server listening on http://${host}:${port}`);
