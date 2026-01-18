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
			const isMobile =
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent,
				);

			const constraints = {
				video: {
					width: { ideal: this.width },
					height: { ideal: this.height },
					aspectRatio: { ideal: this.width / this.height },
					facingMode: isMobile ? "user" : "user", // front camera
				},
				audio: false,
			};

			const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
		const videoAspect = this.video.videoWidth / this.video.videoHeight;
		const bufferAspect = this.width / this.height;

		let drawWidth = this.width;
		let drawHeight = this.height;
		let offsetX = 0;
		let offsetY = 0;

		if (videoAspect > bufferAspect) {
			drawWidth = this.height * videoAspect;
			offsetX = -(drawWidth - this.width) / 2;
		} else {
			drawHeight = this.width / videoAspect;
			offsetY = -(drawHeight - this.height) / 2;
		}

		this.ctx.drawImage(this.video, offsetX, offsetY, drawWidth, drawHeight);
		return this.ctx.getImageData(0, 0, this.width, this.height).data;
	}
}
