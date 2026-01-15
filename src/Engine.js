export class Engine {
	constructor(width, height, cellSize = 10) {
		this.width = width;
		this.height = height;
		this.cellSize = cellSize;
		this.symbols = [" ", "·", "°", "o", "O", "0", "@"];
	}

	calculateLuminance(r, g, b) {
		return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
	}

	mapToSymbol(brightness) {
		const index = Math.floor((brightness / 255) * (this.symbols.length - 1));
		return this.symbols[index];
	}

	process(pixelData) {
		const output = [];
		for (let y = 0; y < this.height; y += this.cellSize) {
			let row = "";
			for (let x = 0; x < this.width; x += this.cellSize) {
				const i = (y * this.width + x) * 4;
				const lum = this.calculateLuminance(
					pixelData[i],
					pixelData[i + 1],
					pixelData[i + 2]
				);
				row += this.mapToSymbol(lum);
			}
			output.push(row);
		}
		return output.join("\n");
	}
}
