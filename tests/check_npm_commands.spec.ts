import * as childProcess from "child_process";
import fetch from "node-fetch";
import * as fs from "fs";
import * as fsPromise from "fs/promises";
import { join } from "path";

// 一つのテストのタイムアウト時間
const TIMEOUT_JEST = 60000;

// 一つのコマンドのタイムアウト時間
const TIMEOUT_COMMAND = 30000;

interface Template {
	dir: string;
	commandMap: {[path: string]: Command[]};
}

interface Command {
	/**
	 * 実行するコマンド。
	 */
	command: string;
	/**
	 * コマンドの引数。
	 */
	args: string[];
	/**
	 * コマンドのタイムアウト時間のミリ秒。
	 */
	timeout?: number;
	/**
	 * コマンドの中止条件。
	 * npm start など自発的に終了しないコマンドでのみ有効。
	 */
	until?: () => Promise<boolean>;
	/**
	 * コマンドの実行終了後に実行される成功条件。
	 */
	post?: (path: string) => Promise<boolean>;
}

const javascriptCommands: Command[] = [
	{
		command: "npm",
		args: ["ci"],
		timeout: 15000
	},
	{
		command: "npm",
		args: ["install"],
		timeout: 15000
	},
	{
		command: "npm",
		args: ["start"],
		until: checkSandboxRunning,
		timeout: 10000
	},
	{
		command: "npm",
		args: ["run", "lint"],
		timeout: 10000
	}
];

const typescriptCommands: Command[] = [
	...javascriptCommands,
	{
		command: "npm",
		args: ["run", "build"],
		timeout: 10000
	},
	{
		command: "npm",
		args: ["run", "update"],
		timeout: 10000
	},
	{
		command: "npm",
		args: ["test"],
		timeout: 10000
	},
	{
		command: "npm",
		args: ["run", "export-zip"],
		timeout: 10000,
		post: async (path) => {
			const stat = await fsPromise.stat(join(path, "game.zip"));
			return stat.isFile() && 0 < stat.size;
		}
	},
	{
		command: "npm",
		args: ["run", "export-html"],
		timeout: 10000,
		post: async (path) => {
			const stat = await fsPromise.stat(join(path, "game"));
			const index = await fsPromise.stat(join(path, "game", "index.html"));
			return stat.isDirectory() && index.isFile();
		}
	},
];

const templates: Template[] = [
	{
		dir: "templates",
		commandMap: {
			"javascript": javascriptCommands,
			"javascript-minimal": javascriptCommands,
			"javascript-shin-ichiba-ranking": javascriptCommands,
			"typescript": typescriptCommands,
			"typescript-minimal": typescriptCommands,
			"typescript-shin-ichiba-ranking": typescriptCommands,
		}
	}
];

for (const { dir, commandMap } of templates) {
	const templateDirs = (fs.readdirSync(dir, { withFileTypes: true }))
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	for (const templateDir of templateDirs) {
		const commands = commandMap[templateDir];
		const templateRelativeDir = join(dir, templateDir);

		if (!commands) {
			throw new Error(`commands of ${templateRelativeDir} not found`);
			// continue;
		}

		describe(`check npm commands in ${templateRelativeDir}`, () => {
			for (const command of commands) {
				const slug = `${command.command} ${command.args.join(" ")}`;
				const label = `${templateRelativeDir}: ${slug}`
				it(`test "${label}"`, async () => {
					const exitCode = await testWithCommand(templateRelativeDir, command);
					expect(exitCode).toBe(0);
				}, TIMEOUT_JEST);
			}
		});
	}
}

async function testWithCommand(path: string, { command, args, timeout, until, post }: Command): Promise<number> {
	let exitCode: number = 0;

	const p = childProcess.spawn(
		command,
		args,
		{
			cwd: path,
			detached: false,
			timeout: timeout ?? TIMEOUT_COMMAND
		}
	);
	p.stdout.on("data", (data) => {
		// console.log(data.toString());
	});
	p.stderr.on("data", (data) => {
		// console.log(data.toString());
	});

	if (until) {
		try {
			await waitUntil(1000, until);
		} catch (e: any) {
			console.log(e.message);
			exitCode = 1;
		} finally {
			p.kill();
		}
	} else {
		try {
			// プロセスの終了 (0 <= process.exitCode となる) まで待機
			await waitUntil(100, async () => p.exitCode != null, TIMEOUT_COMMAND);
		} catch (e: any) {
			p.kill();
		}
		exitCode = p.exitCode!;
	}

	if (!p.killed) {
		// この時点で終了していなければ強制的に終了させる
		p.stdout.destroy();
		p.stderr.destroy();
		p.kill("SIGKILL");
	}

	if (post) {
		try {
			const ret = await post(path);
			if (!ret) {
				throw new Error(`failed to execute post script in ${path}`);
			}
		} catch (e: any) {
			console.log(e.message);
			exitCode = 1;
		}
	}

	return exitCode;
}

function waitUntil(interval: number, callback: () => Promise<boolean>, timeout: number = TIMEOUT_JEST) {
	const now = Date.now();
	const until = now + timeout;
	return new Promise<void>((resolve, reject) => {
		const timer = setInterval(async () => {
			try {
				if (await callback()) {
					clearInterval(timer);
					resolve();
				}
				if (until < Date.now()) {
					throw new Error("waitUntil(): process timeout");
				}
			} catch (e) {
				clearInterval(timer);
				reject(e);
			}
		}, interval);
	});
}

/**
 * akashic-sandbox が立ち上がっているかを確認する簡易スクリプト。
 * ポートは 3000 番で固定。
 */
async function checkSandboxRunning(): Promise<boolean> {
	try {
		const res = await fetch("http://localhost:3000");
		return res.ok;
	} catch (e) {
		return false;
	}
}
