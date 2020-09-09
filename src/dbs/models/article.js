/**
 * @author Liu Yin
 * @date 2020/1/31
 * @Description: banner图
 */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ArticleSchema = new Schema({
  // 文章标题
  title: {
    type: String,
    require: true
  },
  // 文章内容
  content: {
    type: String
  },
  // 文章分类
  classify: {
    type: String
  },
  // 作者
  author: {
    type: String
  },
  // 作者ID
  authorId: {
    type: String
  },
  // 更新时间
  updateTime: {
    type: Date
  }
}, { versionKey: false });
export default mongoose.model('Article', ArticleSchema);
