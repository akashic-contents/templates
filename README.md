# templates

Akashic ゲームのテンプレートリポジトリ。

## template-list.json

このリポジトリが提供するテンプレートリスト一覧は以下になります。

* [template-list.json](https://akashic-contents.github.io/templates/template-list.json)
  * `javascript`
  * `javascript-minimal`
  * `javascript-shin-ichiba-ranking`
  * `typescript`
  * `typescript-minimal`
  * `typescript-shin-ichiba-ranking`

## 開発者向け

### リリース

PullRequest を作成後、 `release` ラベルを付与してください。
対象の PullRequest が main ブランチにマージされるとリリースが実行されます。

### ZIP ファイルの生成

以下コマンドを実行すると `./templates` 以下の各ディレクトリを ZIP 圧縮したファイルが `./dist` 以下に生成されます。

```sh
npm run generate
```

### 成果物のテスト

以下コマンドで成果物の妥当性チェックをします。
テスト実行前に成果物を生成しておく必要があります。

```sh
npm run generate
npm test
```

環境変数 `NODE_ENV` に `"debug"` を指定することでコマンドテストの実行結果を標準出力へ出力します。

```sh
# Linux の場合
NODE_ENV=debug npm test
```
