# 環境構築手順

対象ディレクトリ内のnode_modulesとpackage.lock.jsonを一旦消去（存在していなければこの手順は無視）

```
$　sudo gem install -n /usr/local/bin scss_lint
$　npm i npm -g
$　npm i
$　gulp imagemin
$　gulp
```

## 上記手順の解説

`$　npm i npm -g`と`$　npm i` でグローバルと開発環境のnpmバージョンを揃えます。
`$　gulp imagemin` で画像を最適化し、distフォルダへ移動させます。
`$　gulp` でライブプレビュー＆ウォッチタスクが実行されます。

## 環境構築時の注意
### TypeError: Cannot read property 'apply' of undefined
下記のようなエラーが出た際は
```
/Users/s-ohshima/.nodebrew/node/v6.11.2/lib/node_modules/gulp/bin/gulp.js:129
    gulpInst.start.apply(gulpInst, toRun);
                  ^

TypeError: Cannot read property 'apply' of undefined
    at /Users/s-ohshima/.nodebrew/node/v6.11.2/lib/node_modules/gulp/bin/gulp.js:129:19
    at _combinedTickCallback (internal/process/next_tick.js:73:7)
    at process._tickCallback (internal/process/next_tick.js:104:9)
    at Module.runMain (module.js:606:11)
    at run (bootstrap_node.js:389:7)
    at startup (bootstrap_node.js:149:9)
    at bootstrap_node.js:504:3
```
``` 
$ sudo npm i -g gulp-cli
```
で`gulp-cli`を入れてみてください。

# gulp tasksとnpm scripts

## gulp Tasks一覧
`$　gulp some-task`の形式で使う。例 `$　gulp imagemin`
- `gulp` ライブプレビュー＆ウォッチタスク実行
- `gulp browser-sync` ブラウザのリフレッシュ
- `gulp build` 納品前の最適化（画像最適化、JSファイル整形＆圧縮、CSS整形&圧縮、HTMLファイル整形）を実行
- `gulp imagemin` 画像を最適化し、distフォルダへ移動させます。
- `gulp test` .jsファイルへのESLint、.scss/.sassファイルへのscss-lintによる検証を実行します。
scss-lintによる自動整形は後述するnpm scriptsを使用してください。
## npm scripts
gulp tasksは`$npm run some-task`のnpm scripts形でも実行可能。
`npm run sass-lint:fix --silent` で.sassと.scssファイルの自動フォーマットを実行します。あとは下記を参照。
```
"scripts": {
    "build": "gulp build",
    "sass-lint": "stylelint --config stylelintrc.yml './src/**/*.scss'",
    "sass-lint:fix": "stylelint --config stylelintrc.yml './src/**/*.scss' --fix",
    "start": "gulp",
    "test": "stylelint --config stylelintrc.yml './src/**/*.scss' & gulp test",
    "watch": "gulp watch"
  }
```

# CSS周りのコーディングルール
BEM + FLOCSS

# npm パッケージのメンテナンス方針
`npm audit` でnpm パッケージの脆弱性のチェックができます。 `Low`,`Moderate`, `High`, `Critical`の順で警告が出ます。HighまたはCriticalの警告が出たときは下記のいずれかまたは複数の方法でセキュリティリスク回避をすることが望ましい。

 - メンテナンス継続している類似のパッケージを使う
 - パッケージ作者にプルリクエストを送り脆弱性の修正をお願いする
 - 後方互換性が確認できる場合は依存関係にある問題パッケージを安定版に切り替える
 - 脆弱性のあるパッケージの使用を中止する
