/**
 * @author Liu Yin
 * @date 2020/1/31
 * @Description: 服务器配置
 */
export default {
  dbs: 'mongodb://121.36.173.121:27017/ancient',
  // dbs: 'mongodb://root:ly652992429123@127.0.0.1:27017/ancient?authSource=admin',
  redis: {
    get host() {
      return '127.0.0.1';
    },
    get port() {
      return 6379;
    }
  }
};
