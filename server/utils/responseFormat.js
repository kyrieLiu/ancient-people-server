/**
 * author Liu Yin
 * date 2020/9/4
 * Description:格式化返回数据
 */
const responseFormat = new class {
  // 成功返回
  success(ctx, data, msg) {
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data,
      msg
    };
  }
  // 错误返回
  error(ctx, msg) {
    ctx.status = 500;
    ctx.body = {
      code: -1,
      msg
    };
  }
  // 自定义返回
  custom(ctx, status, body) {
    ctx.status = status;
    ctx.body = body;
  }
}();

export default responseFormat;
