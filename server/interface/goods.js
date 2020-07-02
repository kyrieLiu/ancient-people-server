/**
 * @author Liu Yin
 * @date 2020/2/12
 * @Description: 物品路由接口
*/

import Router from 'koa-router';
import Goods from '../dbs/models/goods';

const router = new Router({ prefix: '/ancientApi/goods' });
// 查询列表
router.post('/list', async(ctx) => {
  try {
    const body = ctx.request.body;
    const page = body.page;
    const size = body.size;
    const condition = body.condition;
    const skipNum = (page - 1) * size;
    // eslint-disable-next-line no-unused-vars
    const reg = new RegExp(condition.keyword, 'i');
    const params = {
      $or: [ // 多条件，数组
        { name: { $regex: reg }},
        { address: { $regex: reg }}
      ]
    };
    if (condition.type) {
      params.type = condition.type;
    }
    const list = await Goods.find(
      params
      // {
      //   type: 1,
      //   name: 1,
      //   address: 1,
      //   note: 1
      // }
    ).skip(skipNum).limit(size)
      // .sort({ _id: -1 })
      .exec();
    const total = await Goods.countDocuments(condition);
    ctx.body = {
      list,
      total,
      code: 0
    };
  } catch (e) {
    ctx.body = {
      code: -1,
      message: e
    };
  }
});
// 新增编辑
router.post('/addEdit', async function(ctx) {
  let code;
  try {
    const body = ctx.request.body;
    if (body._id) {
      Goods.aggre;
      await Goods.where({ _id: body._id }).updateOne(body);
    } else {
      const goods = new Goods(body);
      await goods.save();
    }
    code = 0;
  } catch (e) {
    ctx.status = 500;
    code = -1;
  }
  ctx.body = {
    code,
    message: '操作成功'
  };
});
// 详情
router.get('/detail', async function(ctx) {
  try {
    const query = ctx.request.query;
    const filter = { _id: 0 };
    const data = await Goods.findOne({ _id: query._id }, filter);
    ctx.body = {
      code: 0,
      data,
      message: '操作成功'
    };
  } catch (e) {
    ctx.body = {
      code: -1,
      message: '操作失败'
    };
  }
});
// 删除
router.post('/delete', async function(ctx) {
  try {
    const body = ctx.request.body;
    await Goods.deleteOne({ _id: body._id });
    ctx.body = {
      code: 0,
      message: '操作成功'
    };
  } catch (e) {
    ctx.body = {
      code: -1,
      message: '操作失败'
    };
  }
});
export default router;
