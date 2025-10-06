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

const testCases = templateZipPaths.map(p => [path.basename(p, path.extname(p)), p]); // /path/to/javascript.zip -> javascript

describe("check distribution", () => {
	it.each(testCases)(
		`check the directory structure of the "%s"`,
		async (name, templateZipPath) => {
			const data = fs.readFileSync(templateZipPath);
			const zip = await jszip.loadAsync(data);
			// root にテンプレート名のディレクトリが存在することを確認
			expect(zip.files[name + "/"]).toBeDefined();
			// テンプレート名のディレクトリ直下に game.json が存在することを確認
			expect(zip.files[name + "/game.json"]).toBeDefined();
		}
	);
});
