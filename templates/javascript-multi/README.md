# javascript-multi-game-sample

**javascript-multi-game-sample** は JavaScript で Akashic のマルチプレイゲームを作る際のサンプルプロジェクトです。

## 利用方法

 `javascript-multi-game-sample` を利用するには Node.js が必要です。

初回のみ、以下のコマンドを実行して、ビルドに必要なパッケージをインストールしてください。
この作業は `javascript-multi-game-sample` を新しく生成するごとに必要です。

```sh
npm install
```

### 動作確認方法

以下のどちらかを実行後、ブラウザでゲームを実行できます。

* `npm start`
  * `http://localhost:3000` からアクセス
  * 一人用ゲーム (ランキングゲーム) として起動
* `npm run start:multi`
  * `http://localhost:3300` からアクセス
  * マルチプレイとして起動

### テンプレートの使い方

* ゲーム部分を作成する場合は `script/main.js` を編集してください。
  * 基本的に `script/_bootstrap.ts` を編集する必要はありません。
* このテンプレートでは `script/main.js` の `main` 関数の引数 `param` に以下の値が新たに付与されています。
  * `broadcasterId`
    * 放送者のプレイヤー ID
* マルチプレイに対応したニコニコ新市場コンテンツの作り方の詳細については [こちら](https://akashic-games.github.io/shin-ichiba/index.html) を参照してください。

### アセットの更新方法

各種アセットを追加したい場合は `assets` ディレクトリに格納します。

これらのアセットを追加・変更したあとに `npm run update` をすると、アセットの変更内容をもとに `game.json` を書き換えることができます。

### npm モジュールの追加・削除

`javascript-multi-game-sample` で npm モジュールを利用する場合、このディレクトリで `akashic install <package_name>` することで npm モジュールを追加することができます。

また `akashic uninstall <package_name>` すると npm モジュールを削除することができます。

## エクスポート方法

`javascript-multi-game-sample` をエクスポートするときは以下のコマンドを利用します。

### zipファイルのエクスポート

`akashic export zip -o game.zip -s` のコマンドを利用することで `game.zip` という名前のzipファイルを出力できます。

## テスト方法

以下のコマンドで [ESLint](https://github.com/eslint/eslint "ESLint")を使ったLintが実行されます。
スクリプトアセット内にES5構文に反する記述がある場合エラーを返します。

```sh
npm run lint
```
