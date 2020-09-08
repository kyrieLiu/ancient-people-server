/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: banner路由接口
*/

import Router from 'koa-router';
import Banner from '../dbs/models/banner';
import responseFormat from '../utils/responseFormat';

const router = new Router({ prefix: '/banner' });

/**
 * @api {get} /banner/list/:page/:size 列表
 * @apiGroup Banner管理
 * @apiName Banner列表
 * @apiPermission admin
 * @apiUse HeaderExample
 * @apiDescription banner列表
 * @apiSampleRequest /banner/list/1/10
 * @apiParam {String} [keyWords]  关键字查询
 * @apiParam {String} [showStatus]  是否启用 0未启用  1启用
 * @apiParamExample Request-Example:  "
 * /banner/list/1/10?keyWords="一"&"showStatus=0
 * @apiSuccess {Number} code 状态码
 * @apiSuccess {Number} total 总条数
 * @apiSuccess {Array} list 数据列表
 * @apiSuccess {String} list.name banner名称
 * @apiSuccess {String} list.linkUrl banner链接地址
 * @apiSuccess {String} list.picturePath 图片路径
 * @apiSuccess {String} list.showStatus 显示状态
 * @apiError NoPermission Only Admins can access the data.
 * @apiUse ErrorResponse
 * @apiSuccessExample {json} Success-Response:
 *  {
    "code": 0,
    "list": [
        {
            "_id": "5f521868cfa77333a4336ac1",
            "name": "第一张",
            "linkUrl": "www",
            "picturePath": "http://localhost/file/159921571835589141596207625.jpg",
            "showStatus": 1
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
        { name: { $regex: reg }},
        { linkUrl: { $regex: reg }}
      ];
    }

    if (query.showStatus) {
      params.showStatus = 1;
    }

    const list = await Banner.find(
      params
    ).skip(skipNum).limit(size)
      // .sort({ _id: -1 })
      .exec();
    const total = await Banner.countDocuments(query);
    responseFormat.pagingSuccess(ctx, list, total);
  } catch (e) {
    responseFormat.error(ctx, '查询失败', e.message);
  }
});
/**
 * @api {post} /banner/save 保存
 * @apiGroup Banner管理
 * @apiName 编辑banner
 * @apiDescription 新增编辑banner
 * @apiSampleRequest /banner/save
 * @apiParam {String} _id banner id  编辑需携带
 * @apiParam {String} name banner名称
 * @apiParam {String} linkUrl banner链接地址
 * @apiParam {String} picturePath 图片路径
 * @apiParam {String} [showStatus] 显示状态
 * @apiParamExample {json} Request-Example:
 * {
        "_id": "5f521868cfa77333a4336ac1",
        "name": "第一张",
        "linkUrl": "www",
        "picturePath": "http://localhost/file/159921571835589141596207625.jpg",
        "showStatus": 1
    }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/save', async function(ctx) {
  try {
    const body = ctx.request.body;
    if (body._id) {
      await Banner.where({ _id: body._id }).updateOne(body);
    } else {
      const banner = new Banner(body);
      await banner.save();
    }
    responseFormat.success(ctx, '操作成功');
  } catch (e) {
    responseFormat.error(ctx, '操作失败', e.message);
  }
});
/**
 * @api {get} /banner/detail/:id 详情
 * @apiGroup Banner管理
 * @apiDescription 查询详情信息
 * @apiSampleRequest /banner/detail/5f521868cfa77333a4336ac1
 * @apiParamExample Request-Example:
 * /banner/detail/5f521868cfa77333a4336ac1
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiSuccessExample {json} Success-Response:
 * {
        "_id": "5f521868cfa77333a4336ac1",
        "name": "第一张",
        "linkUrl": "www",
        "picturePath": "http://localhost/file/159921571835589141596207625.jpg",
        "showStatus": 1
    }
 */
router.get('/detail/:id', async function(ctx) {
  try {
    const data = await Banner.findOne({ _id: ctx.params.id });
    responseFormat.success(ctx, '查询成功', data);
  } catch (e) {
    responseFormat.error(ctx, '查询失败', e.message);
  }
});
/**
 * @api {post} /banner/delete 删除
 * @apiGroup Banner管理
 * @apiDescription 删除
 * @apiParam {String} _id banner id
 * @apiSampleRequest /banner/delete
 * @apiParamExample Request-Example:
 * {
 *   _id:1
 * }
 * @apiUse HeaderExample
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/delete', async function(ctx) {
  try {
    const body = ctx.request.body;
    await Banner.deleteOne({ _id: body._id });
    responseFormat.success(ctx, '操作成功');
  } catch (e) {
    responseFormat.error(ctx, '操作失败', e.message);
  }
});
module.exports = router;
