import Router from 'koa-router';

import fs from 'fs';

import resFormat from '../utils/res-format';

const router = new Router({ prefix: '/fileManage' });

/**
 * @api {post} /uploadFile 文件上传
 * @apiGroup 文件管理
 * @apiName 文件导入
 * @apiDescription 上传文件通用接口
 * @apiParam {file} file 文件
 * @apiUse ErrorResponse
 * @apiUse SuccessResponse
 */
router.post('/upload', async (ctx, next) => {
  // 上传单个文件
  const file = ctx.request.files.file; // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const fileName = new Date().getTime() + file.name;
  // const dir = path.join(__dirname, '../../../files/');
  const dir = process.env.NODE_ENV === 'development' ? '/Users/liuyin/fileStore' : '/project/fileStore';
  const isExist = fs.existsSync(dir);
  if (!isExist) {
    await fs.mkdirSync(dir);
  }

  const filePath = dir + `/${fileName}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
  const fileFolder = process.env.NODE_ENV === 'development' ? 'http://localhost/file/' : 'http://http://121.36.173.121/file/';

  resFormat.success(ctx, '上传成功', { filePath: fileFolder + fileName });
});

module.exports = router;
