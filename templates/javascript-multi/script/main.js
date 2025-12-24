"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
function main(param) {
    const scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのパスを列挙します
        assetPaths: ["/assets/images/entry.png"],
    });
    scene.onLoad.add(() => {
        // ここからゲーム内容を記述します
        // プレイヤー情報を保存するデータを定義します
        const players = {};
        // 背面レイヤーを生成します
        const backLayer = new g.E({
            scene,
            width: g.game.width,
            height: g.game.height,
        });
        scene.append(backLayer);
        // 前面レイヤーを生成します
        const frontLayer = new g.E({
            scene,
            width: g.game.width,
            height: g.game.height,
        });
        scene.append(frontLayer);
        // 参加ボタンのエンティティを生成します
        const entryButton = new g.Sprite({
            scene,
            src: scene.asset.getImage("/assets/images/entry.png"),
            x: g.game.width / 2,
            y: g.game.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
            touchable: true, // 押下可能に設定します
            local: true, // ローカルフラグを true に設定します
        });
        frontLayer.append(entryButton);
        // 参加ボタン押下時の処理を記述します
        entryButton.onPointDown.addOnce(() => {
            // 参加を通知するメッセージイベントを送信します
            g.game.raiseEvent(new g.MessageEvent({
                type: "entry",
            }));
            // 参加ボタン押下後に削除します
            entryButton.destroy();
        });
        // プレイヤー参加時のメッセージイベントを処理します
        scene.onMessage.add((event) => {
            // type により処理を分岐します
            if (event.data.type === "entry") {
                // すでに参加済みであれば無視します
                if (players[event.player.id])
                    return;
                // 画面内のランダムな位置にキャラクターを表示します
                const x = Math.floor(g.game.width * g.game.random.generate());
                const y = Math.floor(g.game.height * g.game.random.generate());
                // 役割に応じて大きさを分けます
                let size;
                if (event.player.id === param.broadcasterId) {
                    // 放送者の場合は大きくします
                    size = 48;
                }
                else {
                    // それ以外の場合は小さくします
                    size = 32;
                }
                // ランダムな rgb カラー文字列を生成します
                const red = Math.floor(scene.game.random.generate() * 256);
                const green = Math.floor(scene.game.random.generate() * 256);
                const blue = Math.floor(scene.game.random.generate() * 256);
                const cssColor = `rgb(${red}, ${green}, ${blue})`;
                // キャラクターを生成します
                const character = new g.FilledRect({
                    scene,
                    cssColor,
                    width: size,
                    height: size,
                    x,
                    y,
                    anchorX: 0.5,
                    anchorY: 0.5,
                });
                backLayer.append(character);
                // プレイヤー情報を保存します
                players[event.player.id] = {
                    player: event.player,
                    character,
                    forwardTo: {
                        x: character.x,
                        y: character.y,
                    },
                };
            }
        });
        // タッチ位置にキャラクターを移動させます
        scene.onPointDownCapture.add((event) => {
            const playerData = players[event.player.id];
            // キャラクターをタッチした場所に移動します
            if (playerData === null || playerData === void 0 ? void 0 : playerData.character) {
                playerData.forwardTo = event.point;
                playerData.character.modified();
            }
        });
        // 毎フレームキャラクターを移動させます
        scene.onUpdate.add(() => {
            const speed = 10; // 1フレームあたりの移動量 (px) を設定します
            // プレイヤー情報をループで処理します
            for (const playerId in players) {
                // players 自身が持つキーのみ処理します
                if (!players.hasOwnProperty(playerId))
                    continue;
                const { character, forwardTo } = players[playerId];
                // 移動先との差分を計算します
                const dx = forwardTo.x - character.x;
                const dy = forwardTo.y - character.y;
                const dist = Math.sqrt(dx * dx + dy * dy); // eslint-disable-line akashic/warn-global-math
                if (dist > speed) {
                    // 一定速度で近づきます
                    character.x += (dx / dist) * speed;
                    character.y += (dy / dist) * speed;
                }
                else if (dist > 0) {
                    // 十分に近づいたら最後は移動先に置きます
                    character.x = forwardTo.x;
                    character.y = forwardTo.y;
                }
                character.modified();
            }
        });
        // ここまでゲーム内容を記述します
    });
    g.game.pushScene(scene);
}
