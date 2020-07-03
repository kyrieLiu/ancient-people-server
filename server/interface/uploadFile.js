import Router from 'koa-router';

import fs from 'fs';

import path from 'path';

const router = new Router({ prefix: '/files' });

router.post('/uploadFile', async (ctx, next) => {
  // 上传单个文件
  const file = ctx.request.files.file; // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const fileName = new Date().getTime() + file.name;
  const dir = path.join(__dirname, '../../../files/');
  const isExist = fs.existsSync(dir);
  if (!isExist) {
    await fs.mkdirSync(dir);
  }

  const filePath = path.join(__dirname, '../../../files/') + `/${fileName}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
  const fileFolder = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/file/' : 'http://www.8000cloud.com/file/';
  ctx.body = {
    message: '上传成功！',
    code: 0,
    filePath: fileFolder + fileName
  };
});

export default router;
