/**
 * @api {get} /user/:id Read data of a User
 * @apiVersion 0.3.0
 * @apiName GetUser
 * @apiGroup User
 * @apiPermission admin
 *
 * @apiDescription Compare Verison 0.3.0 with 0.2.0 and you will see the green markers with new items in version 0.3.0 and red markers with removed items since 0.2.0.
 *
 * @apiParam {String} id The Users-ID.
 *
 * @apiExample Example usage:
 * curl -i http://localhost/user/4711
 *
 * @apiSuccess {String}   id            The Users-ID.
 * @apiSuccess {Date}     registered    Registration Date.
 * @apiSuccess {Date}     name          Fullname of the User.
 * @apiSuccess {String[]} nicknames     List of Users nicknames (Array of Strings).
 * @apiSuccess {Object}   profile       Profile data (example for an Object)
 * @apiSuccess {Number}   profile.age   Users age.
 * @apiSuccess {String}   profile.image Avatar-Image.
 * @apiSuccess {Object[]} options       List of Users options (Array of Objects).
 * @apiSuccess {String}   options.name  Option Name.
 * @apiSuccess {String}   options.value Option Value.
 *
 * @apiError NoAccessRight Only authenticated Admins can access the data.
 * @apiError UserNotFound   The <code>id</code> of the User was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 */
// eslint-disable-next-line no-unused-vars
function getUser() { return; }

/**
 * @api {post} /user Create a new User
 * @apiVersion 0.3.0
 * @apiName PostUser
 * @apiGroup User
 * @apiPermission none
 *
 * @apiDescription In this case "apiUse" is defined and used.
 * Define blocks with params that will be used in several functions, so you dont have to rewrite them.
 *
 * @apiParam {String} name Name of the User.
 *
 * @apiSuccess {String} id         The new Users-ID.
 *
 * @apiUse CreateUserError
 */
// eslint-disable-next-line no-unused-vars
function postUser() { return; }

/**
 * @api {put} /user/:id Change a new User
 * @apiVersion 0.3.0
 * @apiName PutUser
 * @apiGroup User
 * @apiPermission none
 *
 * @apiDescription This function has same errors like POST /user, but errors not defined again, they were included with "apiUse"
 *
 * @apiParam {String} name Name of the User.
 *
 * @apiUse CreateUserError
 */
// eslint-disable-next-line no-unused-vars
function putUser() { return; }

import Router from 'koa-router';
import Classify from '../dbs/models/classify';
import responseFormat from './responseFormat';

const router = new Router({ prefix: '/my' });
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

