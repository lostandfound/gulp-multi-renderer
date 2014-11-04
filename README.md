# gulp-multi-renderer

> plugin to render contents using various template engines.

## Install

```
npm install --save-dev gulp-multi-renderer
```

## Usage

`gulpfile.js`

```javascript
var frontMatter = require('gulp-front-matter');
var marked = require('gulp-marked');
var renderer = require('gulp-multi-renderer');

gulp.src('./src/*.md')
  .pipe(frontMatter({
    remove: true
  }))
  .pipe(renderer({
    target: "content"
  }))
  .pipe(marked())
  .pipe(renderer({}))
  .pipe(gulp.dest('./dist'));
});
```

markdown with YAML front matter.

```markdown
---
title: My Awesome Document
---

Hello, This is <%- frontMatter.title %>.


```

after pre-process.

```markdown
Hello, This is My Awesome Document.

```

`layout/default.ejs`

```html
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta charset="utf-8" />
        <title><%= frontMatter.title %></title>
    </head>
    <body>
      <%- contents %>
    </body>
</html>
```

after post-process.

```html
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta charset="utf-8" />
        <title>My Awesome Document</title>
    </head>
    <body>
      <p>Hello, This is My Awesome Document.</p>
    </body>
</html>
```

## API

### render(options)

#### options
Type: `hash`
Default: `{ target: "wrap", property: "forntMatter", templateDir: "./layouts"}`

##### options.target
Type: `String`
Default: `wrap`

When `content` is specified, it render embedded template within `file.contents`. Default template is ejs. If you want to user mustache, set `mustache` to `frontMatter.local`.

When `wrap` is specified, you can refer `file.contents` through `contents` variable in the template file. Default template file is `./layouts/default.ejs`. You can specify template file by `frontMatter.layout`.
You can also use mustache or jade for template file.

##### options.property
Type: `String`
Default: `forntMatter`

a Object name of which contains local variables.

##### options.templateDir
Type: `String`
Default: `./layouts/`

A directory in which template files are placed.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
