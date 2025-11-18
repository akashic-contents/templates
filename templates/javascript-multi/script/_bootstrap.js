"use strict";
// 通常このファイルを編集する必要はありません。ゲームの処理は main.ts に記述してください
const main_1 = require("./main");
module.exports = (originalParam) => {
    const param = Object.assign(Object.assign({}, originalParam), { broadcasterId: "", sessionParameter: {} });
    const scene = new g.Scene({
        game: g.game,
        name: "_bootstrap",
    });
    g.game.onJoin.addOnce(event => {
        param.broadcasterId = event.player.id;
    });
    let sessionParameter;
    scene.onMessage.add((message) => {
        if (message.data && message.data.type === "start" && message.data.parameters) {
            sessionParameter = message.data.parameters;
            return true;
        }
    });
    scene.onLoad.add(() => {
        scene.onUpdate.add(() => {
            // 放送者が確定した後にゲームを開始します
            if (param.broadcasterId && sessionParameter) {
                param.sessionParameter = sessionParameter;
                g.game.popScene();
                (0, main_1.main)(param);
                return true;
            }
        });
    });
    g.game.pushScene(scene);
};
