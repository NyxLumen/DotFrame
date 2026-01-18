import "./src/style.css";
import { Capture } from "./src/Capture";
import { Engine } from "./src/Engine";

console.log("dot.frame: System Booting...");

const CAPTURE_WIDTH = 960;
const CAPTURE_HEIGHT = 720;
const BASE_CELL_WIDTH = 7;
const TITLE = "DOT FRAME";

const canvas = document.getElementById("ascii-canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const statusLabel = document.querySelector(".label");

const toggleMain = document.getElementById("toggle-main");
const webcam = document.getElementById("webcam");
const modeBtn = document.getElementById("mode-btn");
const snapBtn = document.getElementById("snap-btn");
const recordBtn = document.getElementById("rec-btn");
const recDot = document.querySelector(".rec-dot");

const bootText = document.getElementById("boot-text");
const bootOverlay = document.getElementById("boot-overlay");
const cursor = document.getElementById("cursor");
const app = document.getElementById("app");

const capture = new Capture(CAPTURE_WIDTH, CAPTURE_HEIGHT);
let engine = null;

async function start() {
	app.style.opacity = "0";

	const cameraInitPromise = (async () => {
		await document.fonts.ready;
		return await capture.init();
	})();

	await typeWriter(TITLE);
	const ready = await cameraInitPromise;

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
			`Grid Logic: Char ${charWidth.toFixed(2)}x${charHeight} | Sample ${sampleWidth}x${sampleHeight.toFixed(2)}`,
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
		ctx.scale(dpr, dpr);

		ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
		ctx.fillStyle = "#FFFFFF";

		function render() {
			const pixels = capture.getFrameData();

			if (pixels && engine) {
				const rows = engine.process(pixels);

				ctx.fillStyle = "#000000";
				ctx.fillRect(0, 0, finalWidth, finalHeight);

				ctx.fillStyle = "#FFF";
				rows.forEach((rowString, rowIndex) => {
					for (let i = 0; i < rowString.length; i++) {
						ctx.fillText(rowString[i], i * charWidth, rowIndex * charHeight);
					}
				});
			}
			requestAnimationFrame(render);
		}

		render();
		cursor.style.display = "none";
		bootText.style.color = "#d71921";

		setTimeout(() => {
			bootOverlay.style.transition = "opacity 0.5s ease-out";
			bootOverlay.style.opacity = "0";

			app.style.transition = "opacity 1s ease-in";
			app.style.opacity = "1";

			setTimeout(() => bootOverlay.remove(), 500);
		}, 400);
	} else {
		if (statusLabel) statusLabel.innerText = "ERR: CAMERA_DENIED";
	}
}

function typeWriter(text) {
	return new Promise((resolve) => {
		let i = 0;
		function type() {
			if (i < text.length) {
				bootText.innerText += text.charAt(i);
				i++;
				const speed = Math.floor(Math.random() * 100) + 75;
				setTimeout(type, speed);
			} else {
				resolve();
			}
		}
		type();
	});
}

start();

toggleMain.addEventListener("click", () => {
	webcam.classList.toggle("hidden");
	if (webcam.classList.contains("hidden")) {
		toggleMain.innerText = "Main Off";
	} else {
		toggleMain.innerText = "Main On";
	}
});

modeBtn.addEventListener("click", () => {
	const label = engine.toggleMode();
	modeBtn.innerText = label;
});

// Snap
snapBtn.addEventListener("click", () => {
	setTimeout(
		() => (canvas.style.filter = "contrast(1.2) brightness(1.1)"),
		100,
	);

	const link = document.createElement("a");
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	link.download = `dot_frame_${timestamp}.png`;

	link.href = canvas.toDataURL("image/png");

	link.click();
	console.log("dot.frame: Snapshot captured.");
});

// Rec
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

recordBtn.addEventListener("click", () => {
	if (!isRecording) {
		startRecording();
	} else {
		stopRecording();
	}
});

function startRecording() {
	const stream = canvas.captureStream(60);

	const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
		? "video/webm; codecs=vp9"
		: "video/webm";

	mediaRecorder = new MediaRecorder(stream, {
		mimeType: mimeType,
		videoBitsPerSecond: 2500000,
	});

	mediaRecorder.ondataavailable = (event) => {
		if (event.data.size > 0) {
			recordedChunks.push(event.data);
		}
	};

	mediaRecorder.onstop = () => {
		const blob = new Blob(recordedChunks, { type: "video/webm" });
		recordedChunks = [];

		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

		a.style.display = "none";
		a.href = url;
		a.download = `dot_frame_rec_${timestamp}.webm`;
		document.body.appendChild(a);
		a.click();

		window.URL.revokeObjectURL(url);
		console.log("dot.frame: Recording saved.");
	};

	mediaRecorder.start();
	isRecording = true;

	recordBtn.innerText = "STOP";
	recordBtn.style.backgroundColor = "var(--nothing-red)";
	recordBtn.style.color = "var(--nothing-white)";
	if (recDot) {
		recDot.style.opacity = 1;
		recDot.style.animation = "blink 2.5s infinite";
	}
	console.log("dot.frame: Recording started...");
}

function stopRecording() {
	mediaRecorder.stop();
	isRecording = false;

	recordBtn.innerText = "REC";
	recordBtn.style.backgroundColor = "var(--nothing-white)";
	recordBtn.style.color = "var(--nothing-black)";
	if (recDot) {
		recDot.style.opacity = "";
		recDot.style.animation = "";
	}
}
