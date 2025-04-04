import { promises as fs } from "fs";
import * as path from "path";
import * as util from "util";
import * as childProcess from "child_process";

const exec = util.promisify(childProcess.exec);
const templateDir = path.join(__dirname, "..", "templates");

(async () => {
	const templatePaths = (await fs.readdir(templateDir, { withFileTypes: true }))
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	for (let templatePath of templatePaths) {
		await install(path.join(templateDir, templatePath));
	}

	console.log("installed template successfully.");
})().catch(e => {
	console.log(`failed to install template: ${e.message}`);
	process.exitCode = 1;
});

async function install(cwd: string): Promise<any> {
	console.log(`installing ${path.basename(cwd)}...`);
	await exec("npm install --no-package-lock", { cwd, encoding: "utf-8" });
}
