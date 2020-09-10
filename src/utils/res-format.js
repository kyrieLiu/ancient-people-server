/**
 * author Liu Yin
 * date 2020/9/4
 * Description:格式化返回数据
 */

const resFormat = new class {
  // 成功返回
  success(ctx, msg, data) {
    ctx.status = 200;
    ctx.body = {
      code: 'success',
      data,
      msg
    };
  }
  // 分页列表查询成功返回
  pagingSuccess(ctx, list, total) {
    ctx.status = 200;
    ctx.body = {
      code: 'success',
      list,
      total
    };
  }
  // 错误返回
  error(ctx, msg, error) {
    ctx.status = 500;
    ctx.body = {
      code: 'error',
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

export default resFormat;
