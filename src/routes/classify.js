/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: Classify路由接口
*/

import Router from 'koa-router';
import Classify from '../dbs/models/classify';
import responseFormat from '../utils/responseFormat';

const router = new Router({ prefix: '/classify' });
// 查询列表
router.post('/list', async(ctx) => {
  try {
    const body = ctx.request.body;
    const page = body.page;
    const size = body.size;
    const skipNum = (page - 1) * size;
    const params = {};
    const condition = body.condition;
    if (condition) {
      if (condition.keyWords) {
        const reg = new RegExp(condition.keyWords, 'i');
        params.$or = [ // 多条件，数组
          { name: { $regex: reg }},
          { linkUrl: { $regex: reg }}
        ];
      }
    }

    const list = await Classify.find(
      params
    ).skip(skipNum).limit(size)
      // .sort({ _id: -1 })
      .exec();
    const total = await Classify.countDocuments(condition);
    responseFormat.pagingSuccess(ctx, list, total);
  } catch (e) {
    responseFormat.error(ctx, '查询失败', e.message);
  }
});
// 新增编辑
router.post('/save', async function(ctx) {
  try {
    const body = ctx.request.body;
    if (body._id) {
      await Classify.where({ _id: body._id }).updateOne(body);
    } else {
      const classifyInstance = new Classify(body);
      await classifyInstance.save();
    }
    responseFormat.success(ctx, '操作成功');
  } catch (e) {
    responseFormat.error(ctx, '操作失败', e.message);
  }
});
// 详情
router.get('/detail', async function(ctx) {
  try {
    const query = ctx.request.query;
    const data = await Classify.findOne({ _id: query._id });
    responseFormat.success(ctx, '查询成功', data);
  } catch (e) {
    responseFormat.error(ctx, '查询失败', e.message);
  }
});
// 删除
router.post('/delete', async function(ctx) {
  try {
    const body = ctx.request.body;
    await Classify.deleteOne({ _id: body._id });
    responseFormat.success(ctx, '操作成功');
  } catch (e) {
    responseFormat.error(ctx, '操作失败', e.message);
  }
});
module.exports = router;
