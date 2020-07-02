/**
 * @author Liu Yin
 * @date 2020/1/31
 * @Description: 物资表
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const GoodsSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  note: {
    type: String
  },
  type: {
    type: Number
  }
}, { versionKey: false });
export default mongoose.model('Goods', GoodsSchema);
