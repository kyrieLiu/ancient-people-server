/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: 文章管理
 */

import Router from 'koa-router';
import Article from '../dbs/models/article';
import resFormat from '../utils/res-format';

const router = new Router({ prefix: '/article' });

/**
 * @api {get} /article/list/:page/:size 列表
 * @apiGroup 文章管理
 * @apiName 文章列表
 * @apiPermission admin
 * @apiUse HeaderExample
 * @apiDescription article列表
 * @apiSampleRequest /article/list/1/10
 * @apiParam {String} [keyWords]  关键字查询
 * @apiParamExample Request-Example:  "
 * /article/list/1/10?keyWords="一"
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {Number} total 总条数
 * @apiSuccess {Array} list 数据列表
 * @apiSuccess {String} list.name article名称
 * @apiSuccess {String} list.explain article说明
 * @apiError NoPermission Only Admins can access the data.
 * @apiUse ErrorResponse
 * @apiSuccessExample {json} Success-Response:
 *  {
    "code":"success",
    "list":[
        {
            "_id":"5f588ef5389b12290bb08c4c",
            "title":"flutter入门",
            "author":"刘",
            "classify":"flutter",
            "updateTime":"2020-09-09T08:21:20.965Z"
        }
    ],
    "total":1
}
 */
router.get('/list/:page/:size', async(ctx) => {
  const query = ctx.request.query;
  const page = parseInt(ctx.params.page);
  const size = parseInt(ctx.params.size);
  const skipNum = (page - 1) * size;
  const params = {};
  if (query.keyWords) {
    const reg = new RegExp(query.keyWords, 'i');
    params.$or = [ // 多条件，数组
      { title: { $regex: reg }},
      { content: { $regex: reg }}
    ];
  }

  if (query.classify) {
    params.classify = query.classify;
  }
  // params.authorId = ctx.userId;
  // 列表不返回详情数据
  // const filter = { _id: 1, title: 1, abstract: 1, classify: 1, author: 1, updateTime: 1, user: { _id: 1, nickname: 1, headPortrait: 1 }};
  // const list = await Article.aggregate([
  //   {
  //     $match: params
  //   },
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'author',
  //       foreignField: '_id',
  //       as: 'user'
  //     }
  //   },
  //   {
  //     $project: filter
  //   }
  // ]).skip(skipNum).limit(size);
  // const count = await Article.find(
  //   params
  // ).count(true);
  const count = await Article.countDocuments(params);
  const list = await Article.find(params).populate({ path: 'author', select: { _id: 1, nickname: 1, headPortrait: 1 }})
    .skip(skipNum).limit(size);
  resFormat.pagingSuccess(ctx, list, count);
});
/**
 * @api {post} /article/save 保存
 * @apiGroup 文章管理
 * @apiName 编辑article
 * @apiDescription 新增编辑article
 * @apiSampleRequest /article/save
 * @apiParam {String} _id article id  编辑需携带
 * @apiParam {String} title 文章标题
 * @apiParam {String} author 作者
 * @apiParam {String} classify 类型
 * @apiParam {String} content 内容
 * @apiParamExample {json} Request-Example:
 * {
    "code":"success",
    "data":{
        "_id":"5f588ef5389b12290bb08c4c",
        "title":"flutter入门",
        "author":"刘",
        "classify":"flutter",
        "content":"<p>你真的懂flutter吗</p>"
    },
    "msg":"查询成功"
}
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/save', async (ctx) => {
  const body = ctx.request.body;
  body.updateTime = new Date();
  if (!ctx.userId) {
    resFormat.auth(ctx);
    return;
  }
  body.author = ctx.userId;
  if (body._id) {
    await Article.where({ _id: body._id }).updateOne(body);
  } else {
    const articleInstance = new Article(body);
    await articleInstance.save();
  }
  resFormat.success(ctx, '操作成功');
});
/**
 * @api {get} /article/detail/:id 详情
 * @apiGroup 文章管理
 * @apiDescription 查询详情信息
 * @apiSampleRequest /article/detail/5f521868cfa77333a4336ac1
 * @apiParamExample Request-Example:
 * /article/detail/5f521868cfa77333a4336ac1
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {Object} data 数据实体
 * @apiSuccess {String} data.title 文章标题
 * @apiSuccess {String} data.author 作者
 * @apiSuccess {String} data.classify 分类
 * @apiSuccess {String} data.content 内容
 * @apiSuccess {String} data.updateTime 更新时间
 * @apiSuccess {String} msg 处理信息
 * @apiSuccessExample {json} Success-Response:
 * {
    "code":"success",
    "data":{
        "_id":"5f588ef5389b12290bb08c4c",
        "title":"flutter入门",
        "author":"刘",
        "classify":"flutter",
        "content":"<p>你真的懂flutter吗</p>",
        "updateTime":"2020-09-09T08:21:20.965Z"
    },
    "msg":"查询成功"
}
 */
router.get('/detail/:id', async (ctx) => {
  try {
    const data = await Article.findOne({ _id: ctx.params.id }).populate({ path: 'author', select: { _id: 1, nickname: 1, headPortrait: 1 }});
    resFormat.success(ctx, '查询成功', data);
  } catch (e) {
    resFormat.error(ctx, '查询失败', e.message);
  }
});
/**
 * @api {post} /article/delete 删除
 * @apiGroup 文章管理
 * @apiDescription 删除
 * @apiParam {String} _id article id
 * @apiSampleRequest /article/delete
 * @apiParamExample Request-Example:
 * {
 *   _id:5f521868cfa77333a4336ac1
 * }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/delete', async (ctx) => {
  const body = ctx.request.body;
  await Article.deleteOne({ _id: body._id });
  resFormat.success(ctx, '操作成功');
});
module.exports = router;
