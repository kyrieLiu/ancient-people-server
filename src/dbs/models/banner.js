/**
 * @author Liu Yin
 * @date 2020/1/31
 * @Description: banner图
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const BannerSchema = new Schema({
  // 图片名称
  name: {
    type: String,
    require: true
  },
  // 图片链接
  linkUrl: {
    type: String
  },
  // 是否启用 0不启用  1启用
  showStatus: {
    type: Number
  },
  // 类型  1滚动  2固定
  bannerType: {
    type: Number
  },
  // 图片地址
  picturePath: {
    type: String
  }
}, { versionKey: false });
export default mongoose.model('Banner', BannerSchema);
