export class Engine {
	constructor(sourceWidth, sourceHeight, cellWidth, cellHeight) {
		this.sourceWidth = sourceWidth;
		this.sourceHeight = sourceHeight;
		this.cellWidth = Math.floor(cellWidth);
		this.cellHeight = Math.floor(cellHeight);

		// Denser symbol map for better gradients
		this.symbols = [" ", "·", "°", "o", "O", "0", "@"];
		// Good balance of density and clarity
		/*this.symbols = [
			" ",
			".",
			",",
			":",
			";",
			"i",
			"1",
			"t",
			"f",
			"L",
			"G",
			"0",
			"8",
			"@",
		];*/
		// Requires a font that supports these block chars well
		//this.symbols = [" ", "░", "▒", "▓", "█"];
	}

	calculateLuminance(r, g, b) {
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	getAverageBrightness(startX, startY, pixelData) {
		let totalLum = 0;
		let count = 0;

		for (let y = 0; y < this.cellHeight; y++) {
			for (let x = 0; x < this.cellWidth; x++) {
				const px = startX + x;
				const py = startY + y;

				if (px >= this.sourceWidth || py >= this.sourceHeight) continue;

				const i = (py * this.sourceWidth + px) * 4;
				totalLum += this.calculateLuminance(
					pixelData[i],
					pixelData[i + 1],
					pixelData[i + 2],
				);
				count++;
			}
		}
		return count > 0 ? totalLum / count : 0;
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
				const avgLum = this.getAverageBrightness(x, y, pixelData);
				row += this.mapToSymbol(avgLum);
			}
			output.push(row);
		}
		return output;
	}
}
