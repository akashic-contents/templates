import * as tool from "@akc29/akashictool4multi";
import { createGameScene } from "./gameScene";
import { config } from "./config";
import { createButtonEntity } from "./util/buttonEntity";

interface RecruitmentSceneParameterObject {
	/**
     * ゲームに参加できる最大人数
     * @default 10
     */
	playableLimit?: number;
	/**
	 * ゲームが開始できる最小人数
	 * @default 1
	 */
	startableCount?: number;
	/**
	 * プレミアム会員の当選しやすさ
	 * @default 1
	 */
	premiumuRate?: number;
}

export function createRecruitmentScene(params: RecruitmentSceneParameterObject): g.Scene {
	const scene: g.Scene = new g.Scene({
		game: g.game
	});
	const playableLimit = params.playableLimit ?? 10;
	const entry = new tool.AkashicEntry({
		scene,
		playableLimit,
		startableCount: params.startableCount ?? 1,
		premiumuRate: params.premiumuRate ?? 1,
		callbackAfterDicision: (members: tool.PlayerInfo[]) => {
			g.game.replaceScene(createGameScene({ members, time: config.time }));
		}
	});
	scene.onLoad.add(() => {
		const contributerPane = createContributerPane(scene, entry, playableLimit);
		const audiencePane = createAudiencePane(scene, entry);
		let isJoined: boolean = false;
		scene.append(audiencePane);
		scene.onUpdate.add(() => {
			// const members = entry.getPlayableMembers();
			// if (members) {
			// 	g.game.pushScene(createGameScene({ members, time: 60 }));
			// }
			if (g.game.joinedPlayerIds.indexOf(g.game.selfId) !== -1) {
				if (!isJoined) {
					isJoined = true;
					scene.remove(audiencePane);
					scene.append(contributerPane);
					// 少し待たないとraiseEventできない場合があるため
					scene.setTimeout(() => {
						entry.enter({
							id: g.game.selfId,
							name: "player" + g.game.selfId
						}, true);
					}, 500);
				}
			} else {
				if (isJoined) {
					isJoined = false;
					scene.remove(contributerPane);
					scene.append(audiencePane);
					entry.cancel(g.game.selfId);
				}
			}
		})
	});
	g.game.pushScene(scene);
	return scene;
}

function createContributerPane(scene: g.Scene, entry: tool.AkashicEntry, playableLimit: number): g.Pane {
	const pane = new g.Pane({
		scene,
		width: g.game.width,
		height: g.game.height,
		local: true
	});
	const font = new g.DynamicFont({
		game: g.game,
		fontFamily: "serif",
		size: 48
	});
	const entryCountLabel = createEntryCountLabel(scene, entry, font);
	pane.append(entryCountLabel);
	const limitLabel = new g.Label({
		scene,
		text: `参加可能人数： ${playableLimit}名`,
		font,
		fontSize: 20,
		textColor: "black",
		textAlign: "left",
		width: 0.05 * g.game.width,
		y: 0.5 * g.game.height,
		local: true
	});
	pane.append(limitLabel);
	const startButton = createButtonEntity({
		scene,
		width: 0.2 * g.game.width,
		height: 0.1 * g.game.height,
		x: 0.4 * g.game.width,
		y: 0.8 * g.game.height,
		local: true,
		text: "GAME START!!",
		font,
		fontSize: 24,
		rectColor: "yellow",
		textColor: "black",
		available: entry.isAbleToStart(),
		pushEvent: () => {
			entry.decidePlayableMembers();
		},
		isAvailable: () => entry.isAbleToStart()
	});
	pane.append(startButton);

	return pane;
}

function createAudiencePane(scene: g.Scene, entry: tool.AkashicEntry): g.Pane {
	const pane = new g.Pane({
		scene,
		width: g.game.width,
		height: g.game.height,
		local: true
	});
	const font = new g.DynamicFont({
		game: g.game,
		fontFamily: "serif",
		size: 48
	});
	const entryCountLabel = createEntryCountLabel(scene, entry, font);
	pane.append(entryCountLabel);

	const entryButton = new g.FilledRect({
		scene,
		cssColor: "gray",
		x: 0.25 * g.game.width,
		y: 0.6 * g.game.height,
		width: 0.2 * g.game.width,
		height: 0.1 * g.game.height,
		local: true,
		touchable: true
	});
	const entryLabel = new g.Label({
		scene,
		text: "ゲームに参加する",
		font,
		fontSize: 20,
		textColor: "white",
		textAlign: "center",
		width: 0.2 * g.game.width,
		y: 0.05 * entryButton.height,
		local: true
	});
	entryButton.onPointDown.add(() => {
		entryButton.opacity = 0.5;
		entryButton.modified();
	});
	entryButton.onPointUp.add(() => {
		cancelButton.touchable = true;
		cancelButton.modified();
		entryButton.touchable = false;
		entryButton.cssColor = "yellow";
		entryButton.opacity = 1;
		entryButton.modified();
		entryLabel.textColor = "red";
		entryLabel.text = "参加予約済み";
		entryLabel.invalidate();
		entry.enter({
			id: g.game.selfId,
			name: "player" + g.game.selfId
		}, true);
	});
	entryButton.append(entryLabel);
	pane.append(entryButton);
	const cancelButton = new g.FilledRect({
		scene,
		cssColor: "gray",
		x: 0.55 * g.game.width,
		y: 0.6 * g.game.height,
		width: 0.2 * g.game.width,
		height: 0.1 * g.game.height,
		local: true
	});
	const cancelLabel = new g.Label({
		scene,
		text: "参加キャンセル",
		font,
		fontSize: 20,
		textColor: "white",
		textAlign: "center",
		width: 0.2 * g.game.width,
		y: 0.05 * cancelButton.height,
		local: true
	});
	cancelButton.onPointDown.add(() => {
		cancelButton.opacity = 0.5;
		cancelButton.modified();
	});
	cancelButton.onPointUp.add(() => {
		cancelButton.opacity = 1;
		cancelButton.touchable = false;
		cancelButton.modified();
		entryButton.cssColor = "gray";
		entryButton.touchable = true;
		entryButton.modified();
		entryLabel.textColor = "white";
		entryLabel.text = "ゲームに参加する";
		entryLabel.invalidate();
		entry.cancel(g.game.selfId);
	});
	cancelButton.append(cancelLabel);
	pane.append(cancelButton);

	return pane;
}

function createEntryCountLabel(scene: g.Scene, entry: tool.AkashicEntry, font: g.Font): g.Label {
	let entryCount = entry.getEnteredMenmberCount();
	const entryCountLabel = new g.Label({
		scene,
		text: `参加人数: ${entryCount}名`,
		font,
		fontSize: 28,
		textColor: "black",
		textAlign: "center",
		width: g.game.width,
		y: 0.25 * g.game.height,
		local: true
	});
	entryCountLabel.onUpdate.add(() => {
		if (entryCount !== entry.getEnteredMenmberCount()) {
			entryCount = entry.getEnteredMenmberCount();
			entryCountLabel.text = `参加人数: ${entryCount}名`;
			entryCountLabel.invalidate();
		}
	});
	return entryCountLabel;
}
