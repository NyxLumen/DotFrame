import "./src/style.css";
import { Capture } from "./src/Capture";
import { Engine } from "./src/Engine";

console.log("dot.frame: System Booting...");

const CAPTURE_WIDTH = 640;
const CAPTURE_HEIGHT = 480;

const BASE_CELL_WIDTH = 6;

const capture = new Capture(CAPTURE_WIDTH, CAPTURE_HEIGHT);
const canvas = document.getElementById("ascii-canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const statusLabel = document.querySelector(".label");
const toggleMain = document.getElementById("toggle-main");
const webcam = document.getElementById("webcam");
const snap = document.getElementById("snap-btn");
const record = document.getElementById("record-btn");

let engine = null;

async function start() {
	const ready = await capture.init();

	if (ready) {
		if (statusLabel) {
			statusLabel.innerText = "SYSTEM.ACTIVE";
			statusLabel.style.color = "#D71921";
		}

		const fontSize = 10;
		ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
		ctx.textBaseline = "top";

		const metrics = ctx.measureText("0");
		const charWidth = metrics.width;
		const charHeight = fontSize;

		const fontRatio = charWidth / charHeight;

		const sampleWidth = BASE_CELL_WIDTH;
		const sampleHeight = sampleWidth / fontRatio;

		console.log(
			`Grid Logic: Char ${charWidth.toFixed(
				2,
			)}x${charHeight} | Sample ${sampleWidth}x${sampleHeight.toFixed(2)}`,
		);

		engine = new Engine(
			CAPTURE_WIDTH,
			CAPTURE_HEIGHT,
			sampleWidth,
			sampleHeight,
		);

		const cols = Math.floor(CAPTURE_WIDTH / sampleWidth);
		const rows = Math.floor(CAPTURE_HEIGHT / sampleHeight);

		const finalWidth = cols * charWidth;
		const finalHeight = rows * charHeight;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = finalWidth * dpr;
		canvas.height = finalHeight * dpr;

		canvas.style.width = `${finalWidth}px`;
		canvas.style.height = `${finalHeight}px`;

		ctx.scale(dpr, dpr);

		ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
		ctx.fillStyle = "#FFFFFF";

		function render() {
			const pixels = capture.getFrameData();

			if (pixels && engine) {
				const rows = engine.process(pixels);

				ctx.fillStyle = "#000000";
				ctx.fillRect(0, 0, finalWidth, finalHeight);

				ctx.fillStyle = "#ecffef";
				rows.forEach((rowString, rowIndex) => {
					ctx.fillText(rowString, 0, rowIndex * charHeight);
				});
			}
			requestAnimationFrame(render);
		}
		render();
	} else {
		if (statusLabel) statusLabel.innerText = "ERR: CAMERA_DENIED";
	}
}

start();

toggleMain.addEventListener("click", () => {
	webcam.classList.toggle("hidden");
});
