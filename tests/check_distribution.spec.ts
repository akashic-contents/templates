import * as fs from "fs";
import * as path from "path";
import * as jszip from "jszip";

const templateDir = path.join(__dirname, "..", "dist");

const templateZipPaths = fs.readdirSync(templateDir, { withFileTypes: true })
	.filter(dirent => dirent.isFile() && path.extname(dirent.name) === ".zip")
	.map(dirent => path.join(templateDir, dirent.name));

if (!templateZipPaths || !templateZipPaths.length) {
	throw new Error("distribution does not exist.");
}

describe("check distribution", () => {
	for (let templateZipPath of templateZipPaths) {
		const name = path.basename(templateZipPath, path.extname(templateZipPath)); // /path/to/javascript.zip -> javascript

		it(`check the directory structure of the "${name}"`, async () => {
			const data = fs.readFileSync(templateZipPath);
			const zip = await jszip.loadAsync(data);
			// root にテンプレート名のディレクトリが存在することを確認
			expect(zip.files[name + "/"]).not.toBeUndefined();
			// テンプレート名のディレクトリ直下に game.json が存在することを確認
			expect(zip.files[name + "/game.json"]).not.toBeUndefined();
		});
	}
});
