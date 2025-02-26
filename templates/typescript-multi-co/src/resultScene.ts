import { config } from "./config";
import { GameScore } from "./gameScore";
import { createRecruitmentScene } from "./recruitmentScene";

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
			scene.append(createResetButton(scene, font));
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

function createResetButton(scene: g.Scene, font: g.Font): g.E {
	const button = new g.FilledRect({
		scene,
		cssColor: "yellow",
		x: 0.77 * g.game.width,
		y: 0.87 * g.game.height,
		width: 0.2 * g.game.width,
		height: 0.1 * g.game.height,
		opacity: 0.5,
		local: true,
		touchable: true
	});
	const label = new g.Label({
		scene,
		text: "RESET",
		font,
		fontSize: 32,
		textColor: "black",
		textAlign: "center",
		width: 0.2 * g.game.width,
		y: 0.05 * button.height,
		local: true
	});
	button.onPointUp.add(() => {
		g.game.raiseEvent(new g.MessageEvent({ message: "RESET" }));
	});
	button.append(label);

	return button;
}
