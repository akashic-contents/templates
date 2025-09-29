# typescript-multi-game-sample

**typescript-multi-game-sample** は TypeScript で Akashic のマルチプレイゲームを作る際のサンプルプロジェクトです。

## 利用方法

`typescript-multi-game-sample` を利用するには Node.js が必要です。

初回のみ、以下のコマンドを実行して、ビルドに必要なパッケージをインストールしてください。
この作業は `typescript-multi-game-sample` を新しく生成するごとに必要です。

```sh
npm install
```

### ビルド方法

`typescript-multi-game-sample` は TypeScript で書かれているため、以下のコマンドで JavaScript ファイルに変換する必要があります。

```sh
npm run build
```

`src` ディレクトリ以下の TypeScript ファイルがコンパイルされ、 `script` ディレクトリ以下に JavaScript ファイルが生成されます。

`npm run build` は自動的に `akashic scan asset script` を実行するので、`game.json` の更新が行われます。

### 動作確認方法

以下のどちらかを実行後、ブラウザでゲームを実行できます。

* `npm start`
  * `http://localhost:3000` からアクセス
  * 一人用ゲーム (ランキングゲーム) として起動
* `npm run start:multi`
  * `http://localhost:3300` からアクセス
  * マルチプレイとして起動

### テンプレートの使い方

* ゲーム部分を作成する場合は `src/main.ts` を編集してください。
  * 基本的に `src/_bootstrap.ts` を編集する必要はありません。
* このテンプレートでは `src/main.ts` の `main` 関数の引数 `param` に以下の値が新たに付与されています。
  * `broadcasterId`
    * 放送者のプレイヤー ID
* マルチプレイに対応したニコニコ新市場コンテンツの作り方の詳細については [こちら](https://akashic-games.github.io/shin-ichiba/index.html) を参照してください。

### アセットの更新方法

各種アセットを追加したい場合は `assets` ディレクトリに格納します。

これらのアセットを追加・変更したあとに `npm run update` をすると、アセットの変更内容をもとに `game.json` を書き換えることができます。

### npm モジュールの追加・削除

`typescript-multi-game-sample` で npm モジュールを利用する場合、このディレクトリで `akashic install <package_name>` することで npm モジュールを追加することができます。

また `akashic uninstall <package_name>` すると npm モジュールを削除することができます。

## エクスポート方法

`typescript-multi-game-sample` をエクスポートするときは以下のコマンドを利用します。

### zipファイルのエクスポート

`npm run export-zip` のコマンドを利用することで `game.zip` という名前のzipファイルを出力できます。

## テスト方法

1. [ESLint](https://eslint.org/ "ESLint") を使ったLint
2. [Jest](https://jestjs.io/ "Jest") を使ったテスト

がそれぞれ実行されます。

```sh
npm test
```

テストコードのサンプルとして `spec/testSpec.ts` を用意していますので参考にしてテストコードを記述して下さい。
