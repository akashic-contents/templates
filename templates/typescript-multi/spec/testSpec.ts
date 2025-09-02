import * as path from "path";
import { GameContext, type RunnerPlayer } from "@akashic/headless-akashic";

describe("mainScene", () => {
	it("ゲームが正常に動作できる", async () => {
		const context = new GameContext({
			gameJsonPath: path.join(__dirname, "..", "game.json")
		});

		// 放送者のプレイヤー情報
		const broadcasterPlayer: RunnerPlayer = { id: "broadcaster-player-id", name: "broadcaster-player-name" };
		// 参加者のプレイヤー情報
		const otherPlayer: RunnerPlayer = { id: "other-player-name", name: "other-player-name" };

		// Active クライアントの作成
		const activeClient = await context.getGameClient();
		expect(activeClient.type).toBe("active");
		expect(activeClient.game.width).toBe(1280);
		expect(activeClient.game.height).toBe(720);
		expect(activeClient.game.fps).toBe(30);

		// Join イベントの送信
		activeClient.sendJoinEvent(broadcasterPlayer.id, broadcasterPlayer.name);

		// セッションパラメータの送信
		activeClient.sendMessage({ type: "start", parameters: {} });

		// メインシーンに到達するまで進める
		await activeClient.advanceUntil(
			() => activeClient.game.scene()!.local !== "full-local" && activeClient.game.scene()!.name !== "_bootstrap"
		);

		// 放送者クライアントの作成
		const passiveClient1 = await context.createPassiveGameClient({ player: broadcasterPlayer });
		expect(passiveClient1.game.scene()).toBeDefined();

		// メインシーンに到達するまで進める
		await passiveClient1.advanceUntil(
			() => passiveClient1.game.scene()!.local !== "full-local" && passiveClient1.game.scene()!.name !== "_bootstrap"
		);

		// シーンロードのため少しだけ進める
		await context.advanceEach(100);

		// backLayer と frontLayer の二つがあることを確認
		expect(passiveClient1.game.scene()?.children.length).toBe(2);
		expect(passiveClient1.game.scene()?.children[0]).toBeInstanceOf(passiveClient1.g.E);
		expect(passiveClient1.game.scene()?.children[1]).toBeInstanceOf(passiveClient1.g.E);

		// 画面中央の参加ボタンをタップ
		passiveClient1.sendPointDown(passiveClient1.game.width / 2, passiveClient1.game.height / 2, 0);

		// 少しだけ進める
		await context.advanceEach(100);

		// プレイヤーが生成されていることを確認
		expect(passiveClient1.game.scene()?.children[0].children?.length).toBe(1);
		expect(passiveClient1.game.scene()?.children[0].children?.[0]).toBeInstanceOf(passiveClient1.g.FilledRect);

		// 参加者クライアントの作成
		const passiveClient2 = await context.createPassiveGameClient({ player: otherPlayer });

		// メインシーンに到達するまで進める
		await passiveClient2.advanceUntil(
			() => passiveClient2.game.scene()!.local !== "full-local" && passiveClient2.game.scene()!.name !== "_bootstrap"
		);

		// シーンロードのため少しだけ進める
		await context.advanceEach(100);

		// 画面中央の参加ボタンをタップ
		passiveClient2.sendPointDown(passiveClient2.game.width / 2, passiveClient2.game.height / 2, 1);

		// 少しだけ進める
		await context.advanceEach(100);

		// 放送者側で参加プレイヤーが生成されていることを確認
		expect(passiveClient1.game.scene()?.children[0].children?.length).toBe(2);
		expect(passiveClient1.game.scene()?.children[0].children?.[1]).toBeInstanceOf(passiveClient1.g.FilledRect);

		// 参加者側で参加プレイヤーが生成されていることを確認
		expect(passiveClient2.game.scene()?.children[0].children?.length).toBe(2);
		expect(passiveClient2.game.scene()?.children[0].children?.[1]).toBeInstanceOf(passiveClient2.g.FilledRect);

		// 放送者が画面内の任意の箇所をタップ
		passiveClient1.sendPointDown(100, 200, 0);

		// 参加者が画面内の任意の箇所をタップ
		passiveClient2.sendPointDown(300, 400, 0);

		// 移動し終えるまでの十分な時間進める
		await context.advanceEach(10000);

		// それぞれのクライアントにおいてキャラクターがタップした場所に移動していることを確認
		{
			// 放送者クライアント
			const broadcasterEntity = passiveClient1.game.scene()?.children[0].children?.[0];
			expect(broadcasterEntity?.x).toBe(100);
			expect(broadcasterEntity?.y).toBe(200);
			const otherEntity = passiveClient1.game.scene()?.children[0].children?.[1];
			expect(otherEntity?.x).toBe(300);
			expect(otherEntity?.y).toBe(400);
		}
		{
			// 参加者クライアント
			const broadcasterEntity = passiveClient2.game.scene()?.children[0].children?.[0];
			expect(broadcasterEntity?.x).toBe(100);
			expect(broadcasterEntity?.y).toBe(200);
			// タップした場所に移動していることを確認
			const otherEntity = passiveClient2.game.scene()?.children[0].children?.[1];
			expect(otherEntity?.x).toBe(300);
			expect(otherEntity?.y).toBe(400);
		}

		await context.destroy();
	});
});
