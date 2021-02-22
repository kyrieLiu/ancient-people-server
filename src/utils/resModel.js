/**
 * author Liu Yin
 * date 2021/1/14
 * Description:返回工具类
 */
class BaseModel {
  constructor(data, msg) {
    this.data = data;
    this.msg = msg;
  }
}
class SuccessModel extends BaseModel {
  constructor(data, msg) {
    super(data, msg);
    this.code = 'success';
  }
}
class ErrorModel extends BaseModel {
  constructor(data, msg) {
    super(data, msg);
    this.code = 'sucess';
  }
}
export {
  SuccessModel,
  ErrorModel
};
