'use strict';
const assets = require('postcss-assets');
const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const changed = require('gulp-changed');
const clean = require('postcss-clean');
const concat = require('gulp-concat');
const del = require('del');
const eslint = require('gulp-eslint');
const flexBugsFixes = require('postcss-flexbugs-fixes');
const gulp = require('gulp');
const htmlhint = require('gulp-htmlhint');
const header = require('gulp-header');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const notify = require('gulp-notify');
const order = require('gulp-order');
const plumber = require('gulp-plumber');
const pngquant = require('imagemin-pngquant');
const postcss = require('gulp-postcss');
const prettify = require('gulp-prettify');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const scsslint = require('gulp-scss-lint');
const sorting = require('postcss-sorting');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const watcher = require('gulp-watch');

const paths = {
	root: './src',
	html: {
		src: './src/html/**/*.html',
		dest: './dist/'
	},
	styles: {
		src: './src/sass/**/*.scss',
		dest: './dist/css',
		map: './dist/css/maps'
	},
	scripts: {
		src: './src/js/**/*.js',
		jsx: './src/js/**/*.jsx',
		dest: './dist/js',
		map: './dist/js/maps',
		core: 'src/js/core/**/*.js',
		app: 'src/js/app/**/*.js'
	},
	images: {
		src: './src/img/**/*.{jpg,jpeg,png,svg,gif}',
		dest: './dist/img/'
	}
};
//Post CSS
const autoprefixerOption = {
	grid: true
};
const sortingOptions = require('./postcss-sorting.json');
const postcssOption = [
	assets({
		baseUrl: '/',
		basePath: 'src/',
		loadPaths: [ 'img/' ],
		cachebuster: true
	}),
	flexBugsFixes,
	autoprefixer(autoprefixerOption),
	sorting(sortingOptions)
];

//HTML整形
function html() {
	return gulp
		.src(paths.html.src)
		.pipe(changed(paths.html.dest))
		.pipe(
			prettify({
				indent_char: ' ',
				indent_size: 2,
				unformatted: [ 'a', 'span', 'br' ]
			})
		)
		.pipe(gulp.dest(paths.html.dest));
}

// Sassコンパイル(非圧縮)
function styles() {
	return gulp
		.src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(
			plumber({
				errorHandler: notify.onError('<%= error.message %>')
			})
		)
		.pipe(
			sass({
				outputStyle: 'expanded'
			})
		)
		.pipe(replace(/@charset "UTF-8";/g, ''))
		.pipe(header('@charset "UTF-8";\n\n'))
		.pipe(postcss(postcssOption))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(paths.styles.dest));
}
// Sassコンパイル（圧縮）
function sassCompress() {
	return gulp
		.src(paths.styles.src)
		.pipe(
			plumber({
				errorHandler: notify.onError('<%= error.message %>')
			})
		)
		.pipe(
			sass({
				outputStyle: 'compressed'
			})
		)
		.pipe(replace(/@charset "UTF-8";/g, ''))
		.pipe(header('@charset "UTF-8";\n\n'))
		.pipe(postcss(postcssOption, [ clean() ]))
		.pipe(gulp.dest(paths.styles.dest));
}
//JSコンパイル
function scripts() {
	return gulp
		.src(paths.scripts.src)
		.pipe(sourcemaps.init())
		.pipe(order([ paths.scripts.core, paths.scripts.app ]))
		.pipe(
			babel({
				presets: [ 'env' ]
			})
		)
		.pipe(plumber())
		.pipe(concat('lib.js'))
		.pipe(uglify())
		.pipe(
			rename({
				suffix: '.min'
			})
		)
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(paths.scripts.dest));
}
//画像最適化
const imageminOption = [
	pngquant({
		quality: '70-85'
	}),
	mozjpeg({
		quality: 85
	}),
	imagemin.gifsicle(),
	imagemin.jpegtran(),
	imagemin.optipng(),
	imagemin.svgo({
		removeViewBox: false
	})
];

function images() {
	return gulp
		.src(paths.images.src, {
			since: gulp.lastRun(images)
		})
		.pipe(imagemin(imageminOption))
		.pipe(gulp.dest(paths.images.dest));
}
// マップファイル除去
function cleanMapFiles() {
	return del([ paths.styles.map, paths.scripts.map ]);
}

//===Lint Tasks===
//HTML Lint
function htmlLint() {
	return gulp.src(paths.html.src).pipe(htmlhint()).pipe(htmlhint.reporter());
}
//SASS Lint
function sassLint() {
	return gulp.src(paths.styles.src).pipe(
		scsslint({
			config: 'scss-lint.yml'
		})
	);
}
//ESLint
function esLint() {
	return gulp
		.src([ paths.scripts.src, paths.scripts.jsx, '!./src/js/core/**/*.js' ])
		.pipe(
			eslint({
				useEslintrc: true,
				fix: true
			})
		)
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

//ブラウザ更新&ウォッチタスク
const browserSyncOption = {
	port: 8080,
	server: {
		baseDir: './dist/',
		index: 'index.html'
	},
	reloadOnRestart: true,
	reloadDebounce: 500
};
gulp.task('browser-sync', () => {
	browserSync.init(browserSyncOption);
	watcher(paths.styles.src, gulp.series(styles, browserSync.reload));
	watcher(paths.scripts.src, gulp.series(scripts, esLint, browserSync.reload));
	watcher(paths.html.src, gulp.series(html, browserSync.reload));
});
gulp.task('clean', cleanMapFiles);
gulp.task('imagemin', images);
gulp.task('sass-compress', sassCompress);
gulp.task('server', gulp.series('browser-sync'));
gulp.task('default', gulp.series(gulp.parallel(scripts, styles, html), 'server'));
gulp.task('build', gulp.series(gulp.parallel(scripts, 'imagemin', 'sass-compress', html), 'clean'));
gulp.task('eslint', esLint);
gulp.task('html-lint', htmlLint);
gulp.task('sass-lint', sassLint);
gulp.task('test', gulp.series(sassLint, esLint, htmlLint));
