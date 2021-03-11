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
  const filter = { content: 0 };
  const count = await Article.countDocuments(params);
  const list = await Article.find(params, filter).populate({ path: 'author', select: { _id: 1, nickname: 1, headPortrait: 1 }}).lean()
    .skip(skipNum).limit(size);
  const userId = ctx.userId;
  if (userId) {
    list.forEach(item => {
      // 点赞数据
      const likeList = item.likeList;
      const likeObj = getUserAction(userId, item, likeList);
      item.likeNumber = likeObj.doneNumber;
      item.isLike = likeObj.isDone;
      // 收藏数据
      const collect_list = item.collect_list;
      const collectObj = getUserAction(userId, item, collect_list);
      item.collectNumber = collectObj.doneNumber;
      item.isCollect = collectObj.isDone;
    });
  }
  resFormat.pagingSuccess(ctx, list, count);
});
function getUserAction(userId, item, list) {
  const isDone = list.some(collectItem => {
    const _id = collectItem._id.toString();
    if (_id === userId) {
      return true;
    }
  });
  const doneNumber = list.length;
  return { isDone, doneNumber };
}
/**
 * @api {get} /article/collect/:page/:size 列表
 * @apiGroup 文章管理
 * @apiName 我的收藏
 * @apiPermission admin
 * @apiUse HeaderExample
 * @apiDescription article收藏列表
 * @apiSampleRequest /article/collect/1/10
 * @apiParam {String} [keyWords]  关键字查询
 * @apiParamExample Request-Example:  "
 * /article/collect/1/10?keyWords="一"
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
router.get('/collect/:page/:size', async(ctx) => {
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
  const filter = { content: 0 };
  const userId = ctx.userId;
  params.collect_list = userId;
  const count = await Article.countDocuments(params);
  const list = await Article.find(params, filter).populate({ path: 'author', select: { _id: 1, nickname: 1, headPortrait: 1 }}).lean()
    .skip(skipNum).limit(size);

  if (userId) {
    list.forEach(item => {
      // 点赞数据
      const likeList = item.likeList;
      const likeObj = getUserAction(userId, item, likeList);
      item.likeNumber = likeObj.doneNumber;
      item.isLike = likeObj.isDone;
      // 收藏数据
      const collect_list = item.collect_list;
      const collectObj = getUserAction(userId, item, collect_list);
      item.collectNumber = collectObj.doneNumber;
      item.isCollect = collectObj.isDone;
    });
  }
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
  // const req = ctx.req;
  // const ip = req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
  //   req.connection.remoteAddress || // 判断 connection 的远程 IP
  //   req.socket.remoteAddress || // 判断后端的 socket 的 IP
  //   req.connection.socket.remoteAddress;
  // logger.error(req.ip);
  const data = await Article.findOne({ _id: ctx.params.id }).populate({ path: 'author', select: { _id: 1, nickname: 1, headPortrait: 1 }}).lean();
  resFormat.success(ctx, '查询成功', data);
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
/**
 * @api {post} /article/like 点赞
 * @apiGroup 文章管理
 * @apiDescription 点赞
 * @apiParam {String} _id article id
 * @apiParam {String} type 点赞类型: 1点赞  0取消点赞
 * @apiSampleRequest /article/like
 * @apiParamExample Request-Example:
 * {
 *   _id:5f521868cfa77333a4336ac1
 * }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/like', async (ctx) => {
  const body = ctx.request.body;
  if (!ctx.userId) {
    resFormat.auth(ctx);
    return;
  }
  const userId = ctx.userId;
  const article = await Article.findOne({ _id: body._id });
  const likeList = article.likeList || [];
  if (body.type === 1) {
    likeList.push({ _id: userId });
  } else {
    likeList.some((item, index) => {
      const _id = item._id.toString();
      if (_id === userId) {
        likeList.splice(index, 1);
        return true;
      }
    });
  }
  if (body._id) {
    await Article.where({ _id: body._id }).updateOne(article);
  }
  resFormat.success(ctx, '操作成功');
});
/**
 * @api {post} /article/collect 收藏
 * @apiGroup 文章管理
 * @apiDescription 收藏
 * @apiParam {String} _id article id
 * @apiParam {String} type 收藏类型: 1收藏  0取消收藏
 * @apiSampleRequest /article/collect
 * @apiParamExample Request-Example:
 * {
 *   _id:5f521868cfa77333a4336ac1
 * }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/collect', async (ctx) => {
  const body = ctx.request.body;
  if (!ctx.userId) {
    resFormat.auth(ctx);
    return;
  }
  const userId = ctx.userId;
  if (body.type === 1) {
    await Article.update({ _id: body._id }, { $addToSet: { collect_list: userId }});
  } else {
    await Article.update({ _id: body._id }, { $pull: { collect_list: userId }});
  }
  resFormat.success(ctx, '操作成功');
});
module.exports = router;
