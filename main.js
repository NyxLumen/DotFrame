import "./src/style.css";
import { Capture } from "./src/Capture";
import { Engine } from "./src/Engine";

console.log("dot.frame: System Booting...");

const WIDTH = 160;
const HEIGHT = 120;
const capture = new Capture(WIDTH, HEIGHT);
const engine = new Engine(WIDTH, HEIGHT, 4);

const output = document.getElementById("output");
const statusLabel = document.querySelector(".label");
const recDot = document.querySelector(".rec-dot");

async function start() {
	console.log("Requesting Camera...");
	const ready = await capture.init();

	if (ready) {
		console.log("Camera Connected.");

		if (statusLabel) {
			statusLabel.innerText = "SYSTEM.ACTIVE";
			statusLabel.style.color = "#FF0000";
		}

		function render() {
			const pixels = capture.getFrameData();
			if (pixels) {
				output.textContent = engine.process(pixels);
			}
			requestAnimationFrame(render);
		}
		render();
	} else {
		if (statusLabel) {
			statusLabel.innerText = "ERR: CAMERA_DENIED";
		}
		console.error("Failed to initialize camera.");
	}
}

start();
