import { config } from "./config";
import { GameScore } from "./gameScore";
import { createRecruitmentScene } from "./recruitmentScene";
import { createButtonEntity } from "./util/buttonEntity";

export function createResultScene(gameScore: GameScore): g.Scene {
	const scene = new g.Scene({ game: g.game });
	scene.onLoad.add(() => {
		// フォントの生成
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 48
		});
		const totalScoreLabel = new g.Label({
			scene,
			text: "TOTAL SCORE: " + gameScore.total,
			font,
			fontSize: font.size,
			textColor: "black",
			textAlign: "center",
			width: g.game.width,
			y: 0.25 * g.game.height,
		});
		scene.append(totalScoreLabel);
		const personalScoreText = gameScore.scores[g.game.selfId] != null ? `YOUR SOCRE: ${gameScore.scores[g.game.selfId]}` : "NO PLAY";
		const personalScoreLabel = new g.Label({
			scene,
			text: personalScoreText,
			font,
			fontSize: font.size / 2,
			textColor: "black",
			textAlign: "center",
			width: g.game.width,
			y: 0.5 * g.game.height,
			local: true
		});
		scene.append(personalScoreLabel);
		// 放送者のみplaylogにスコアを残す
		if (g.game.joinedPlayerIds.find(id => id === g.game.selfId)) {
			g.game.raiseEvent(new g.MessageEvent({ message: "GAME_RESULT", title: config.title, gameScore }));
			scene.append(createButtonEntity({
				scene,
				width: 0.2 * g.game.width,
				height: 0.1 * g.game.height,
				x: 0.77 * g.game.width,
				y: 0.87 * g.game.height,
				local: true,
				text: "RESET",
				font,
				fontSize: 32,
				rectColor: "yellow",
				textColor: "black",
				pushEvent: () => {
					g.game.raiseEvent(new g.MessageEvent({ message: "RESET" }));
				}
			}));
		}
		scene.onMessage.add((ev) => {
			if (!ev.data || !ev.data.message) {
				return;
			}
			if (ev.data.message === "RESET") {
				g.game.pushScene(createRecruitmentScene({}));
			}
		});
	});
	return scene;
}
