var apply         = require('postcss-apply');
var atImport      = require('postcss-import');
var autoprefixer  = require('autoprefixer');
var browserSync   = require('browser-sync');
var csso          = require('postcss-csso');
var customMedia   = require('postcss-custom-media');
var customProp    = require('postcss-custom-properties');
var ejs           = require('gulp-ejs');
var ghPages       = require('gulp-gh-pages');
var gulp          = require('gulp');
var gutil         = require('gulp-util');
var htmlmin       = require('gulp-htmlmin');
var nested        = require('postcss-nested');
var postcss       = require('gulp-postcss');
var runSequence   = require('run-sequence');
var watch         = require('gulp-watch');

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json'));

gulp.task('build:template', function() {
  return gulp.src([
          config.dir.src + '/templates/**/*.ejs',
    '!' + config.dir.src + '/templates/**/_*.ejs'
  ])
    .pipe(ejs(config, {
      ext: '.html'
    }).on('error', gutil.log))
    .pipe(htmlmin({
      'collapseBooleanAttributes': true,
      'collapseInlineTagWhitespace': true,
      'collapseWhitespace': true,
      'minifyCSS': true,
      'minifyJS': true,
      'removeAttributeQuotes': true,
      'removeComments': true,
      'removeRedundantAttributes': true,
      'removeScriptTypeAttributes': true,
      'removeStyleLinkTypeAttributes': true,
      'sortAttributes': true,
      'sortClassName': true,
      'useShortDoctype': true
    }))
    .pipe(gulp.dest(config.dir.dist));
});

gulp.task('build:css', function() {
  return gulp.src(config.dir.src + '/style.css')
    .pipe(postcss([
      atImport(),
      customProp(),
      apply(),
      customMedia(),
      nested(),
      autoprefixer({
        browsers: ['last 2 versions']
      }),
      csso()
    ]))
    .pipe(gulp.dest(config.dir.dist));
});

gulp.task('build:font', function() {
  return gulp.src([
    config.dir.nodeModules + '/yakuhanjp/dist/fonts/YakuHanJP/YakuHanJP-Regular.*',
    config.dir.nodeModules + '/yakuhanjp/dist/fonts/YakuHanJP/YakuHanJP-Bold.*'
  ])
    .pipe(gulp.dest(config.dir.dist + '/fonts'));
});

gulp.task('build:public', function() {
  return gulp.src(config.dir.src + '/public/**/*')
    .pipe(gulp.dest(config.dir.dist));
});

gulp.task('build', function(callback) {
  runSequence('build:template', 'build:css', 'build:font', 'build:public', callback);
});

gulp.task('server', function() {
  browserSync.init({
    files: config.dir.src,
    server: {
      baseDir: config.dir.dist
    }
  });
});

gulp.task('deploy:gh-pages', function() {
  return gulp.src(config.dir.dist + '/**/*')
    .pipe(ghPages());
});

gulp.task('deploy', function(callback) {
  runSequence('build', 'deploy:gh-pages', callback);
});

gulp.task('watch:template', ['build:template'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('watch:css', ['build:css'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('default', ['server'], function() {
  gulp.start('build');
  gulp.watch(config.dir.src + '/templates/**/*.ejs', ['watch:template']);
  gulp.watch(config.dir.src + '/**/*.css', ['watch:css']);
});
