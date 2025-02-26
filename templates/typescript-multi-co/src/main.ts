import { createRecruitmentScene } from "./recruitmentScene";

function main(_param: g.GameMainParameterObject): void {
	g.game.pushScene(createRecruitmentScene({}));
}

export = main;
