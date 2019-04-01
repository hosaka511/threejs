/**
 *
 * EXPERIENCE ARCHITECTURE gulp template
 * Copyright © un-T factory! All Rights Reserved.
 *
 */

const gulp          = require("gulp");
const ejs           = require('gulp-ejs');
const data          = require('gulp-data');
const sass          = require("gulp-sass");
const csscomb       = require('gulp-csscomb');
const postcss       = require('gulp-postcss');
const mqpacker      = require("css-mqpacker");
const autoprefixer  = require('autoprefixer');
const rucksack      = require('rucksack-css');
const babel         = require('gulp-babel');
const eslint        = require('gulp-eslint');
const lec           = require('gulp-line-ending-corrector');
const styledocco    = require('gulp-styledocco');
const spritesmith   = require('gulp.spritesmith');
const plumber       = require('gulp-plumber');
const imagemin      = require('gulp-imagemin');
const pngquant      = require('imagemin-pngquant');
const browserSync   = require('browser-sync');
const connectSSI    = require('connect-ssi');
const fs            = require('fs');
const path          = require('path');
const cssnano       = require('gulp-cssnano');
const uglify        = require('gulp-uglify');
const strip         = require('gulp-strip-comments');
const gulpif        = require('gulp-if');
const svgstore      = require('gulp-svgstore');
const svgmin        = require('gulp-svgmin');
const cheerio       = require('gulp-cheerio');
const rename        = require('gulp-rename');
const htmlmin       = require('gulp-htmlmin');
const prettify      = require('gulp-prettify');
const reload        = browserSync.reload;

const INDENT_SITE = 2;

// JSのコメントアウト（「//」のみ）をコンパイル時に削除するかどうか。
const COMMENT_DELETION = true; // or false

const TARGET_BROWSERS = [
  'last 2 versions',
  'ie >= 9',
  'safari >= 9',
  'ios >= 9.2',
  'android >= 4.4.2'
];

const END_OF_LINE = 'LF';
const ENCODING = 'UTF8';

var tasks = ['watch', 'ejs', 'styles', 'babel'];
var minify = false;
var getDirectory = function (dir) {
  return fs.readdirSync(dir)
  .filter(function (file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
};

// Compile template engine
gulp.task('ejs', function () {
  var pathJson = 'htdocs/_ejs/_json/';

  fs.access(pathJson + '_conf.json', fs.R_OK | fs.W_OK, function (err) {
    var json_conf = (err) ? {} : JSON.parse(fs.readFileSync(pathJson + '_conf.json'));
    var onError = function (err) {
      console.log(err.message);
      this.emit('end');
    };

    return gulp.src([
      'htdocs/_ejs/**/*.ejs',
      '!' + 'htdocs/_ejs/**/_*.ejs'
    ])
    .pipe(data(function(file) {
      var filename = file.path;
      var absolutePath = filename.split('_ejs/')[filename.split('_ejs/').length -1].replace('.ejs','.html');
      var relativePath = '../'.repeat([absolutePath.split('/').length -1]);

      json_conf.relativePath = relativePath;
      return json_conf;
    }))
    .pipe(ejs({
      'conf': json_conf,
      'relativePath': json_conf.relativePath
    }, {}, {
      ext: '.html'
    }).on('error', onError))
    .pipe(htmlmin({
      collapseWhitespace: true,
      caseSensitive: false // 大文字と小文字を区別して属性を扱う（カスタムHTMLタグ用）
    }))
    .pipe(prettify({
      indent_size: 2,
      indent_inner_html: false,
      extra_liners: ['body', '!--'],
      js: {brace_style: 'preserve-inline'}
    }))
    .pipe(lec({ eolc: END_OF_LINE, ENCODING}))
    .pipe(gulp.dest('htdocs/'));
  });
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function () {
  /**
   * プラグイン一覧
   *
   * - autoprefixer：ベンダープレフィックスの付与
   * - mqpacker：メディアクエリーの最適化
   *
   */
  const plugins = [
    autoprefixer({
      browsers: TARGET_BROWSERS,
      grid: true
    }),
    rucksack()
  ];

  return gulp.src('htdocs/_scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(csscomb())
  .pipe(postcss(plugins))
  .pipe(lec({ eolc: END_OF_LINE, ENCODING}))
  .pipe(gulp.dest('htdocs/'));
});

// Generate sprite sheet
gulp.task('sprite', function () {
  var folders = getDirectory('htdocs/_sprite/');
  folders.map(function (folder) {
    var spriteData = gulp.src('htdocs/_sprite/' + folder + '/*.png')
    .pipe(spritesmith({
      imgName: 'sprite-' + folder + '.png',
      cssName: 'css/_partials/_sprite-' + folder + '.scss',
      imgPath: '/img/' + folder + '/sprite-' + folder + '.png',
      cssFormat: 'scss',
      padding: 10,
      cssSpritesheetName: 'spritesheet',
      cssVarMap: function (sprite) {
        sprite.name = 'sprite-' + sprite.name;
      },
      cssTemplate: 'htdocs/_sprite/spritesmith_tmp.txt'
    }));
    spriteData.img.pipe(gulp.dest('htdocs/img/'+ folder + '/' ));
    spriteData.css.pipe(gulp.dest('htdocs/_scss/'));
  });
});

// Generate SVG sprite
gulp.task('sprite:svg', function () {
  const destFileName = 'sprite'; // 出力されるSVGスプライトのファイル名
  return gulp
  .src('htdocs/_svg/**/*.svg', { base: 'htdocs/_svg' })
  .pipe(rename(function (file) {
    const name = file.dirname.split(path.sep);
    name[0] = name[0] === '.' ? null : name[0];
    name.push(file.basename);
    if (name[0]) {
      file.basename = name.join('-');
    }
  }))
  .pipe(svgmin())
  .pipe(svgstore({inlineSvg: true }))
  .pipe(cheerio({
    run: function ($) {
      $('[fill]').removeAttr('fill');
      $('[stroke]').removeAttr('stroke');
      $('svg').attr('style','display:none');
      $('symbol').each(function () { // 各symbolのpathに対して固有のIDを持たせることで、パスごとのfillをCSSで調整出来るようにしている。
        const symbol = $(this);
        const path = symbol.find('path');
        const id = symbol.attr('id');
        path.each(function(index) {
          const _index = parseInt(index, 10) + 1;
          const _zero_padding_index = ('00' + _index ).slice( -2 );
          $(this).attr('id', id + '-' + _zero_padding_index);
        });
      });
    },
    parserOptions: { xmlMode: true }
  }))
  .pipe(rename({
    basename: destFileName
  }))
  .pipe(gulp.dest('htdocs/img/'));
});

// Transpiles ES2015 code to ES5
gulp.task('babel', function () {
  return gulp.src('htdocs/_es6/**/*.es6')
  .pipe(plumber())
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(babel({
    presets: [
      ['env', {
        'targets': {
          'browsers': TARGET_BROWSERS
        }
      }]
    ],
    plugins: ['transform-remove-strict-mode']
  }))
  .pipe(lec({ eolc: END_OF_LINE, ENCODING}))
  .pipe(gulpif(COMMENT_DELETION, strip({ignore: /\/\*\*\s*\n([^\*]*(\*[^\/])?)*\*\//g})))
  .pipe(gulp.dest('htdocs/'));
});

// Minify CSS
gulp.task('minify:css', function () {
  return gulp.src('htdocs/css/**/*.css')
  .pipe(cssnano())
  .pipe(gulp.dest('htdocs/css/'));
});

// Minify JavaScript
gulp.task('minify:js', function () {
  return gulp.src([
    'htdocs/js/**/*.js',
    '!' + 'htdocs/js/vendor/**/*.js'
  ])
  .pipe(uglify({output: {comments: 'some'}}))
  .pipe(gulp.dest('htdocs/js/'));
});

// Optimize images
gulp.task('images', function () {
  return gulp.src('htdocs/**/*.{jpg,jpeg,png,gif}')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      use: [pngquant({
        quarity: 60-80,
        speed: 1
      })]
    }))
    .pipe(gulp.dest('htdocs/'));
});

// Build and serve
gulp.task('serve', tasks, function () {
  browserSync({
    open: false,
    startPath: '',
    reloadDelay: 1000,
    once: true,
    notify: false,
    ghostMode: false,
    server: {
      baseDir: 'htdocs',
      middleware: connectSSI({
        baseDir: __dirname + '/htdocs',
        ext: ".html"
      })
    }
  });
  gulp.watch('htdocs/**/*.html', reload);
  gulp.watch('htdocs/_ejs/**/*.ejs', ['ejs', reload]);
  gulp.watch('htdocs/_scss/**/*.scss', ['styles', reload]);
  gulp.watch('htdocs/_es6/**/*.es6', ['babel', reload]);
});

// Build files, the default task
gulp.task('default', tasks);

// Watch files
gulp.task('watch', function () {
  gulp.watch('htdocs/_ejs/**/*.ejs', ['ejs']);
  gulp.watch('htdocs/_scss/**/*.scss', ['styles']);
  gulp.watch('htdocs/_es6/**/*.es6', ['babel']);
});

// Minify files
gulp.task('minify', ['minify:css', 'minify:js']);