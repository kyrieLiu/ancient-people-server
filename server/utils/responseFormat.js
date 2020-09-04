/**
 * author Liu Yin
 * date 2020/9/4
 * Description:格式化返回数据
 */
const responseFormat = new class {
  // 成功返回
  success(ctx, msg, data) {
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data,
      msg
    };
  }
  // 分页列表查询成功返回
  pagingSuccess(ctx, list, total) {
    ctx.status = 200;
    ctx.body = {
      code: 0,
      list,
      total
    };
  }
  // 错误返回
  error(ctx, msg, error) {
    ctx.status = 500;
    ctx.body = {
      code: -1,
      msg,
      error
    };
  }
  // 自定义返回
  custom(ctx, status, body) {
    ctx.status = status;
    ctx.body = body;
  }
}();

export default responseFormat;
