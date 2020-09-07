/**
 * @author Liu Yin
 * @date 2020/1/31
 * @Description: banner图
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ClassifySchema = new Schema({
  // 类型名称
  name: {
    type: String,
    require: true
  },
  // 说明
  explain: {
    type: String
  }
}, { versionKey: false });
export default mongoose.model('Classify', ClassifySchema);
