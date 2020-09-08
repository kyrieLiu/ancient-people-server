/**
 * author Liu Yin
 * date 2020/9/7
 * Description: gulp任务
 */
const gulp = require('gulp');
const apidoc = require('gulp-apidoc');
var watch = require('gulp-watch');
// 根据路由信息生成api
gulp.task('apidoc', (done) => {
  apidoc({
    src: './src/routes',
    dest: './public/apidoc'
  }, done);
});
// 监听文件变化
gulp.task('watch', () => {
  return watch(['./src/routes/*.js'], () => {
    gulp.start(['apidoc']);
  });
});
// 加入'watch'任务
gulp.task('default', [], function() {
  gulp.start(['watch']);
});
