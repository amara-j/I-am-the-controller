let win = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName("body")[0],
	x = win.innerWidth || e.clientWidth || g.clientWidth,
	y = win.innerHeight || e.clientHeight || g.clientHeight
let w = document.getElementById("small_canvas").getAttribute("width")
let h = document.getElementById("small_canvas").getAttribute("height")

//make a tiny invisible canvas to later scale up for pixelating effect
// const offscreen_postage_stamp = new OffscreenCanvas(128,72);
// offscreen_postage_stamp.getContext('2d').rect(0,0,20,20);

// const canvasContainer = document.querySelector("#canvas-container")
// const postage_stamp = document.createElement("canvas")

// postage_stamp.offscreenCanvas = document.createElement("canvas")
// postage_stamp.offscreenCanvas.width = 128
// postage_stamp.offscreenCanvas.height = 72
// const ctx1 = postage_stamp.offscreenCanvas.getContext("2d")
// ctx1.beginPath()
// ctx1.rect(0, 0, 20, 20)
// ctx1.stroke()
// postage_stamp.getContext("2d").drawImage(postage_stamp.offscreenCanvas, 0, 0)

// canvasContainer.appendChild(postage_stamp)
// postage_stamp.width = 128
// postage_stamp.height = 72
// postage_stamp.getContext('2d').drawImage(offscreen_postage_stamp, 0,0);

const onresize = e => {
	w = e.target.outerWidth
	h = e.target.outerHeight
}
//window.addEventListener("resize", onresize);

const volume = new Tone.Volume(-12).toDestination()
const synth = new Tone.PluckSynth().connect(volume)

const playSynth = () => {
	//fr 100 440
	const fr = Math.floor(Math.random() * 340) + 100
	synth.triggerAttackRelease(fr, 0.5)
	// setTimeout(() => synth.dispose(), 500)
}

const sample_size = 1
const threshold = 90
let previous_frame = []

//creating an offscreen canvas
//update function outside of loop
// separate draw and update functions
const offscreenCanvas = document.createElement("canvas")
const offscreenCtx = offscreenCanvas.getContext("2d")

const small_canvas = document.querySelector("#small_canvas")
const ctx = small_canvas.getContext("2d")

const renderOffscreenToActive = () => {
	createImageBitmap(offscreenCanvas).then(bitmap => {
		// console.log(bitmap)
		ctx.drawImage(bitmap, 0, 0)
	})
}

const draw = vid => {
	offscreenCtx.drawImage(vid, 0, 0, w, h)
	const data = offscreenCtx.getImageData(0, 0, w, h).data
	// for rows and columns in pixel array:
	for (let y = 0; y < h; y += sample_size) {
		for (let x = 0; x < w; x += sample_size) {
			// the data arra= is a continuous array of red, blue, green and alpha values, so each pixel takes up four values in the array
			let pos = (x + y * w) * 4

			// get red, blue and green pixel value

			// copy imagedata
			// modify new imagedata that isn't on canvas
			// then draw that on canvas after update
			let r = data[pos]
			let g = data[pos + 1]
			let b = data[pos + 2]

			if (
				previous_frame[pos] &&
				Math.abs(previous_frame[pos] - g) > threshold
			) {
				// draw the pixels as blocks of colours
				r = Math.random() * 255
				g = Math.random() * 255
				b = Math.random() * 255
				offscreenCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
				offscreenCtx.fillRect(x, y, sample_size, sample_size)
				previous_frame[pos] = r
				// playSynth()
			} else {
				offscreenCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
				offscreenCtx.fillRect(x, y, sample_size, sample_size)
				previous_frame[pos] = r
			}
		}
	}
	renderOffscreenToActive()
	window.requestAnimationFrame(() => draw(vid))
}

var video = document.querySelector("video")
const options = {
	video: { width: w, height: h },
}
navigator.mediaDevices
	.getUserMedia(options)
	.then(function (stream) {
		// Main function
		video.srcObject = stream
		Tone.start()
		window.requestAnimationFrame(() => draw(video))
	})
	.catch(error => {
		console.log(`The following error occured: ${error}`)
	})
