export class Capture {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.video = document.getElementById("webcam");
		this.buffer = document.getElementById("buffer");
		this.ctx = this.buffer.getContext("2d", { willReadFrequently: true });

		this.buffer.width = this.width;
		this.buffer.height = this.height;

		this.ctx.translate(this.width, 0);
		this.ctx.scale(-1, 1);
	}

	async init() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { width: this.width, height: this.height },
				audio: false,
			});
			this.video.srcObject = stream;
			return new Promise((resolve) => {
				this.video.onloadedmetadata = () => resolve(true);
			});
		} catch (err) {
			console.error("Camera access denied:", err);
			return false;
		}
	}

	getFrameData() {
		this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
		return this.ctx.getImageData(0, 0, this.width, this.height).data;
	}
}
