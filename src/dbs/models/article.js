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
  // 摘要
  abstract: {
    type: String
  },
  // 文章分类
  classify: {
    type: String
  },
  // 作者ID
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 更新时间
  updateTime: {
    type: Date
  },
  // 点赞
  likeList: [
    {
      _id: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  // 收藏
  collectList: [
    {
      _id: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  // 已阅读
  readList: [
    {
      _id: {
        type: Schema.Types.ObjectId
      }
    }
  ]
}, { versionKey: false });
export default mongoose.model('Article', ArticleSchema);
