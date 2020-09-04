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
import banner from '../server/interface/banner';
import goods from '../server/interface/goods';
import uploadFile from '../server/interface/uploadFile';

const app = new Koa();

const koaBody = require('koa-body');

import responseFormat from './utils/responseFormat';

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认200M
  }
}));

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
app.use(uploadFile.routes()).use(uploadFile.allowedMethods());
app.use(banner.routes()).use(banner.allowedMethods());
app.use(goods.routes()).use(goods.allowedMethods());

app.use(async(ctx, next) => {
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  console.log(`${ctx.request.method} ${ctx.request.url}: ${ms}ms`);
  ctx.response.set('X-Response-Time', `${ms}ms`);
});

app.use(async(ctx, next) => {
  await next();
  responseFormat.custom(ctx, 404, { code: -1, msg: 'not found ' + ctx.request.path });
  // responseFormat.success(ctx, { msg: '注册成功' });
});

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3002;
app.listen(port, host);
console.log(`Server listening on http://${host}:${port}`);
