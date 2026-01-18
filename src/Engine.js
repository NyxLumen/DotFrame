export class Engine {
	constructor(sourceWidth, sourceHeight, cellWidth, cellHeight) {
		this.sourceWidth = sourceWidth;
		this.sourceHeight = sourceHeight;
		this.cellWidth = Math.floor(cellWidth);
		this.cellHeight = Math.floor(cellHeight);

		this.modes = {
			dots: [" ", "·", "°", "o", "O", "0", "@"],
			blocks: ["⠀", "░", "▒", "▓", "█"],
		};

		this.symbols = this.modes.dots;
		this.isBlockMode = false;
	}
	toggleMode() {
		this.isBlockMode = !this.isBlockMode;
		this.symbols = this.isBlockMode ? this.modes.blocks : this.modes.dots;
		return this.isBlockMode ? "BLOCKS" : "DOTS";
	}

	calculateLuminance(r, g, b) {
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	mapToSymbol(brightness) {
		if (brightness < 70) return " ";
		const index = Math.floor((brightness / 255) * (this.symbols.length - 1));
		return this.symbols[index];
	}

	process(pixelData) {
		const output = [];
		for (let y = 0; y < this.sourceHeight; y += this.cellHeight) {
			let row = "";
			for (let x = 0; x < this.sourceWidth; x += this.cellWidth) {
				const currentY = Math.min(y, this.sourceHeight - 1);
				const currentX = Math.min(x, this.sourceWidth - 1);

				const i = (currentY * this.sourceWidth + currentX) * 4;

				const lum = this.calculateLuminance(
					pixelData[i],
					pixelData[i + 1],
					pixelData[i + 2],
				);
				row += this.mapToSymbol(lum);
			}
			output.push(row);
		}
		return output;
	}
}
