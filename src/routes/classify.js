/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: 分类管理路由接口
 */

import Router from 'koa-router';
import Classify from '../dbs/models/classify';
import responseFormat from '../utils/responseFormat';

const router = new Router({ prefix: '/classify' });

/**
 * @api {get} /classify/list/:page/:size 列表
 * @apiGroup 分类管理
 * @apiName 分类列表
 * @apiPermission admin
 * @apiUse HeaderExample
 * @apiDescription classify列表
 * @apiSampleRequest /classify/list/1/10
 * @apiParam {String} [keyWords]  关键字查询
 * @apiParamExample Request-Example:  "
 * /classify/list/1/10?keyWords="一"
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {Number} total 总条数
 * @apiSuccess {Array} list 数据列表
 * @apiSuccess {String} list.name classify名称
 * @apiSuccess {String} list.explain classify说明
 * @apiError NoPermission Only Admins can access the data.
 * @apiUse ErrorResponse
 * @apiSuccessExample {json} Success-Response:
 *  {
    "code": 0,
    "list": [
        {
            "_id": "5f521868cfa77333a4336ac1",
            "name": "flutter",
            "explain": "谷歌出品"
        }
    ],
    "total": 1
}
 */
router.get('/list/:page/:size', async(ctx) => {
  try {
    const query = ctx.request.query;
    const page = parseInt(ctx.params.page);
    const size = parseInt(ctx.params.size);
    const skipNum = (page - 1) * size;
    const params = {};
    if (query.keyWords) {
      const reg = new RegExp(query.keyWords, 'i');
      params.$or = [ // 多条件，数组
        { name: { $regex: reg }}
      ];
    }

    if (query.showStatus) {
      params.showStatus = 1;
    }

    const list = await Classify.find(
      params
    ).skip(skipNum).limit(size)
    // .sort({ _id: -1 })
      .exec();
    const total = await Classify.countDocuments(query);
    responseFormat.pagingSuccess(ctx, list, total);
  } catch (e) {
    responseFormat.error(ctx, '查询失败', e.message);
  }
});

/**
 * @api {get} /classify/allList 获取所有分类
 * @apiGroup 分类管理
 * @apiName 所有分类
 * @apiPermission admin
 * @apiUse HeaderExample
 * @apiDescription 所有分类列表
 * @apiSampleRequest /classify/list/1/10
 * @apiParamExample Request-Example:  "
 * /classify/allList
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {Array} list 数据列表
 * @apiSuccess {String} list.name classify名称
 * @apiSuccess {String} list.explain classify说明
 * @apiUse ErrorResponse
 * @apiSuccessExample {json} Success-Response:
 *  {
    "code": 0,
    "list": [
        {
            "_id": "5f521868cfa77333a4336ac1",
            "name": "flutter",
            "explain": "谷歌出品"
        }
    ]
}
 */
router.get('/allList', async(ctx) => {
  const list = await Classify.find().exec();
  responseFormat.pagingSuccess(ctx, list);
});

/**
 * @api {post} /classify/save 保存
 * @apiGroup 分类管理
 * @apiName 编辑classify
 * @apiDescription 新增编辑classify
 * @apiSampleRequest /classify/save
 * @apiParam {String} _id classify id  编辑需携带
 * @apiParam {String} name classify名称
 * @apiParam {String} explain classify链接地址
 * @apiParamExample {json} Request-Example:
 * {
        "_id": "5f521868cfa77333a4336ac1",
        "name": "flutter",
        "explain": "谷歌出品"
    }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/save', async (ctx) => {
  const body = ctx.request.body;
  if (body._id) {
    await Classify.where({ _id: body._id }).updateOne(body);
  } else {
    const classifyInstance = new Classify(body);
    await classifyInstance.save();
  }
  responseFormat.success(ctx, '操作成功');
});
/**
 * @api {get} /classify/detail/:id 详情
 * @apiGroup 分类管理
 * @apiDescription 查询详情信息
 * @apiSampleRequest /classify/detail/5f521868cfa77333a4336ac1
 * @apiParamExample Request-Example:
 * /classify/detail/5f521868cfa77333a4336ac1
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiSuccessExample {json} Success-Response:
 * {
        "_id": "5f521868cfa77333a4336ac1",
        "name": "flutter",
        "explain": "谷歌出品"
    }
 */
router.get('/detail/:id', async (ctx) => {
  const data = await Classify.findOne({ _id: ctx.params.id });
  responseFormat.success(ctx, '查询成功', data);
});
/**
 * @api {post} /classify/delete 删除
 * @apiGroup 分类管理
 * @apiDescription 删除
 * @apiParam {String} _id classify id
 * @apiSampleRequest /classify/delete
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
  await Classify.deleteOne({ _id: body._id });
  responseFormat.success(ctx, '操作成功');
});
module.exports = router;
