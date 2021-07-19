const { src, dest, watch, parallel, series } = require('gulp');


let scss = require('gulp-sass'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify-es').default,
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    pug = require('gulp-pug');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'dist/'
        }
    });
}

function cleanDist() {
    return del('dist');
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest('dist/images'));
}


function pugCreate() {
    return src('app/**/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

function mainJs() {
    return src([
            'app/js/main.js'
        ])
        .pipe(uglify())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src([
            // 'node_modules/jquery/dist/jquery.js',
            // 'node_modules/slick-carousel/slick/slick.js',
            // 'node_modules/mixitup/dist/mixitup.js'
            'node_modules/swiper/swiper-bundle.js'
        ])
        .pipe(concat('lib.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
}



function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/lib.min.js',
            'app/js/main.js',
        ], { base: 'app' })
        .pipe(dest('dist'));
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js'], mainJs);
    watch(['app/js/**/*.js'], scripts);
    watch(['app/**/*.pug'], pugCreate);
    watch(['app/images/**/*'], images);
    watch(['dist/*.html']).on('change', browserSync.reload);
}
exports.mainJs = mainJs;
exports.pugCreate = pugCreate;
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, mainJs, pugCreate, browsersync, watching);