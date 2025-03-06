interface ButtonEntityParameterObject extends g.EParameterObject {
	width: number;
	height: number;
	x: number;
	y: number;
	local: boolean;
	text: string;
	font: g.Font;
	fontSize?: number;
	rectColor?: string;
	textColor?: string;
	available?: boolean;
	pushEvent?: () => void;
	isAvailable?: () => boolean;
}

export function createButtonEntity(param: ButtonEntityParameterObject): g.E {
	let available = param.available ?? true;
	const buttonEntity = new g.E({
		scene: param.scene,
		width: param.width,
		height: param.height,
		x: param.x,
		y: param.y,
		local: param.local,
		touchable: available
	});
	const buttonRect = new g.FilledRect({
		scene: param.scene,
		cssColor: param.rectColor ?? "gray",
		width: param.width,
		height: param.height
	});
	buttonEntity.append(buttonRect);
	const buttonLabel = new g.Label({
		scene: param.scene,
		text: param.text,
		font: param.font,
		fontSize: param.fontSize ?? param.font.size,
		textColor: param.textColor ?? "white",
		textAlign: "center",
		width: 0.9 * param.width,
		x: 0.05 * param.width,
		y: 0.25 * param.height
	});
	buttonEntity.append(buttonLabel);
	const disableRect = new g.FilledRect({
		scene: param.scene,
		cssColor: "black",
		width: param.width,
		height: param.height,
		opacity: 0.6,
		hidden: available
	});
	buttonEntity.append(disableRect);
	buttonEntity.onPointDown.add(() => {
		buttonRect.opacity = 0.5;
		buttonRect.modified();
	});
	buttonEntity.onPointUp.add(() => {
		buttonRect.opacity = 1;
		buttonRect.modified();
		if (param.pushEvent) {
			param.pushEvent();
		} 
	});
	if (param.isAvailable) {
		buttonEntity.onUpdate.add(() => {
			const a = param.isAvailable();
			if (a !== available) {
				a ? disableRect.hide() : disableRect.show();
				disableRect.modified();
				buttonEntity.touchable = a;
				buttonEntity.modified();
				available = a;
			}
		});
	}

	return buttonEntity;
}
