import Router from 'koa-router';

import fs from 'fs';

import responseFormat from '../utils/responseFormat';

const router = new Router({ prefix: '/fileManage' });

/**
 * @api {post} /uploadFile
 * @apiGroup 文件上传
 * @apiName 文件导入
 * @apiDescription 上传文件通用接口
 * @apiParam {file} file 文件
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/uploadFile', async (ctx, next) => {
  console.log('进入uploadFile')
  // 上传单个文件
  const file = ctx.request.files.file; // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const fileName = new Date().getTime() + file.name;
  // const dir = path.join(__dirname, '../../../files/');
  const dir = process.env.NODE_ENV ? '/Users/liuyin/fileStore/files' : '/project/fileStore';
  const isExist = fs.existsSync(dir);
  if (!isExist) {
    await fs.mkdirSync(dir);
  }

  const filePath = dir + `/${fileName}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
  const fileFolder = process.env.NODE_ENV === 'development' ? 'http://localhost/file/' : 'http://www.8000cloud.com/file/';

  responseFormat.success(ctx, '上传成功', { filePath: fileFolder + fileName },);
});

module.exports = router;
