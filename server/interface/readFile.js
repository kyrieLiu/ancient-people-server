/**
 * author Liu Yin
 * date 2020/7/2
 * Description:
 */

import Router from 'koa-router';
var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
import Koa from 'koa';
const app = new Koa();

app.use(Koa.static(__dirname + './../page'));

const router = new Router({ prefix: '/ancientApi/file' });
// 拦截请求
router.post('/image', function(req, res) {
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  // eslint-disable-next-line no-path-concat
  form.uploadDir = path.join(__dirname + '/../page/upload');
  form.keepExtensions = true;// 保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024;
  // 处理图片
  form.parse(req, function(err, fields, files) {
    console.log(files.the_file);
    var filename = files.the_file.name;
    var nameArray = filename.split('.');
    var type = nameArray[nameArray.length - 1];
    var name = '';
    for (var i = 0; i < nameArray.length - 1; i++) {
      name = name + nameArray[i];
    }
    var date = new Date();
    var time = '_' + date.getFullYear() + '_' + date.getMonth() + '_' + date.getDay() + '_' + date.getHours() + '_' + date.getMinutes();
    var avatarName = name + time + '.' + type;
    var newPath = form.uploadDir + '/' + avatarName;
    fs.renameSync(files.the_file.path, newPath); // 重命名
    res.send({ data: '/upload/' + avatarName });
  });
});

