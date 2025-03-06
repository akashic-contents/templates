import * as tool from "@akc29/akashictool4multi";
import { GameScore } from "./gameScore";
import { createResultScene } from "./resultScene";
import { createButtonEntity } from "./util/buttonEntity";

interface GameSceneParameterObject {
	members: tool.PlayerInfo[];
	time: number;
}

interface Player {
	id: string;
	name: string;
	entity: g.E;
	size: g.CommonSize;
	point: g.CommonOffset;
	angle: number;
}

interface Enemy {
	maxHp: number;
	currentHp: number;
	entity: g.E;
	area: g.CommonArea;
}

interface Ballet {
	id: string;
	entity: g.E;
}

const DEFAULT_ENTITY_AREA_SIZE = 50;
const DEFAULT_CHARACTER_SIZE = 32;

export function createGameScene(params: GameSceneParameterObject): g.Scene {
	const scene = new g.Scene({
		game: g.game,
		assetIds:["player", "shot", "se"]
	});
	let players: {[id: string]: Player} = {};
	let time = params.time;
	let enemies: Enemy[] = [];
	const gameScore: GameScore = {
		total: 0,
		scores: {}
	};
	params.members.forEach(info => gameScore.scores[info.id] = 0);
	scene.onLoad.add(() => {
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 48
		});
		players = params.members.map(info => createPlayer(scene, font, info)).reduce<{ [id: string]: Player }>((acc, p) => {
			acc[p.id] = p;
			return acc;
		}, {});
		const timeLabel = new g.Label({
			scene,
			text: "TIME: " + time,
			font,
			fontSize: font.size / 2,
			textColor: "black",
			textAlign: "center",
			width: 0.25 * g.game.width,
			x: 0.75 * g.game.width,
		});
		scene.append(timeLabel);
		const totalScoreLabel = new g.Label({
			scene,
			text: "TOTAL SCORE: " + gameScore.total,
			font,
			fontSize: font.size,
			textColor: "black",
			textAlign: "center",
			width: g.game.width,
			x: 0.25 * g.game.width,
			y: 0.03 * g.game.height,
		});
		scene.append(totalScoreLabel);
		const personalScoreLabel = new g.Label({
			scene,
			text: "YOUR SCORE: " + gameScore.scores[g.game.selfId],
			font,
			fontSize: 2 * font.size / 3,
			textColor: "black",
			textAlign: "center",
			width: g.game.width,
			x: 0.375 * g.game.width,
			y: 0.1 * g.game.height,
			local: true
		});
		scene.append(personalScoreLabel);
		const scoreUpButton = createButtonEntity({
			scene,
			width: 0.2 * g.game.width,
			height: 0.1 * g.game.height,
			x: 0.77 * g.game.width,
			y: 0.87 * g.game.height,
			local: true,
			text: "SCORE UP",
			font,
			fontSize: 32,
			rectColor: "yellow",
			textColor: "black",
			pushEvent: () => {
				g.game.raiseEvent(new g.MessageEvent({ message: "SCOREUP" }));
				scene.asset.getAudioById("se").play();
			}
		});
		scene.append(scoreUpButton);
		scene.onUpdate.add(() => {
			if (time <= 0) {
				g.game.replaceScene(createResultScene(gameScore));
			}
			time -= 1 / g.game.fps;
			timeLabel.text = "TIME: " + Math.ceil(time);
			timeLabel.invalidate();
			totalScoreLabel.text = "TOTAL SCORE: " + gameScore.total;
			totalScoreLabel.invalidate();
			personalScoreLabel.text = "YOUR SCORE: " + gameScore.scores[g.game.selfId];
			personalScoreLabel.invalidate();
		});
		scene.onMessage.add((ev) => {
			if (!ev.data || !ev.data.message) {
				return;
			}
			if (ev.data.message === "SCOREUP") {
				gameScore.total++;
				if (gameScore.scores[ev.player.id] != null) {
					gameScore.scores[ev.player.id]++;
				}
			}
		});
		scene.onPointUpCapture.add((ev) => {
			const player = players[ev.player.id];
			if (!player || ev.target) return;
			player.point = { x: ev.point.x, y: ev.point.y };
			player.entity.x = ev.point.x;
			player.entity.y = ev.point.y;
			player.entity.modified();
		});
	});
	return scene;
}

function createPlayer(scene: g.Scene, font: g.Font, info: tool.PlayerInfo): Player {
	const size = { width: DEFAULT_ENTITY_AREA_SIZE, height: DEFAULT_ENTITY_AREA_SIZE };
	const point = {
		x: g.game.random.generate() * (g.game.width - size.width),
		y: g.game.random.generate() * (g.game.height - size.height)
	};
	const angle = 360 * g.game.random.generate();
	const entity = new g.E({
		scene,
		width: size.width,
		height: size.height,
		x: point.x,
		y: point.y
	});
	const bgRect = new g.FilledRect({
		scene,
		cssColor: info.id === g.game.selfId ? "green" : "gray",
		width: entity.width,
		height: entity.height,
		opacity: 0.7,
		local: true
	});
	entity.append(bgRect);
	const playerImage = scene.asset.getImageById("player");
	const sprite = new g.Sprite({
		scene,
		src: playerImage,
		scaleX: DEFAULT_CHARACTER_SIZE / playerImage.width,
		scaleY: DEFAULT_CHARACTER_SIZE / playerImage.height,
		width: DEFAULT_CHARACTER_SIZE,
		height: DEFAULT_CHARACTER_SIZE,
		x: entity.width / 2,
		y: entity.height / 2,
		anchorX: 0.5,
		anchorY: 0.5,
		angle
	});
	entity.append(sprite);
	const playerNameLabel = new g.Label({
		scene,
		text: info.name,
		font,
		fontSize: 11,
		textColor: "black",
		textAlign: "center",
		y: entity.height - 10
	});
	entity.append(playerNameLabel);
	scene.append(entity);
	return {
		id: info.id,
		name: info.name,
		entity,
		size,
		point,
		angle
	};
}
