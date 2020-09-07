/**
 * @author Liu Yin
 * @date 2020/1/31
 * @Description: 人员信息
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  headPortrait: {
    type: String,
    require: true
  }
});
export default mongoose.model('User', UserSchema);
