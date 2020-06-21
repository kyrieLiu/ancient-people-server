/**
 * author Liu Yin
 * date 2020/6/21
 * Description:
 */

import Koa from 'koa';

const index = new Koa();

index.use(async(ctx, next) => {
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  console.log(`${ctx.request.method} ${ctx.request.url}: ${ms}ms`);
  console.log(process.env.NODE_ENV);
  ctx.response.set('X-Response-Time', `${ms}ms`);
});

index.use(async(ctx, next) => {
  await next();
  ctx.response.type = 'text/html';
  ctx.response.body = '<h1>Hello, koa2!</h1>';
});

index.listen(3006);
console.log('app started at port 3003...');

