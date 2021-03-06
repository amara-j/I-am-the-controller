Tone.start()

let win = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName("body")[0],
	x = win.innerWidth || e.clientWidth || g.clientWidth,
	y = win.innerHeight || e.clientHeight || g.clientHeight
let w = document.getElementById("small_canvas").getAttribute("width")
let h = document.getElementById("small_canvas").getAttribute("height")

const onresize = e => {
	w = e.target.outerWidth
	h = e.target.outerHeight
}
const midiNotes = [40, 52]
const notes = midiNotes.map(midinote => Tone.Frequency(midinote, "midi"))

const reverb = new Tone.Reverb().toDestination()
const delay = new Tone.Delay(0.1).connect(reverb)
const volume = new Tone.Volume(-12).connect(delay)

const monosynth = new Tone.MonoSynth({
	oscillator: { type: "sine2" },
	portamento: 0.5
}
).connect(
	volume
)

const duosynth = new Tone.DuoSynth({
	portamento: 0.5
}
).connect(
	volume
)

const fmsynth = new Tone.FMSynth({
	portamento: 0.5
}
).connect(
	volume
)

let isPlaying = false
const playSynth = (position) => {
	if (isPlaying) return
	const { x, y } = position
	const fr = (-500 * y / 72) + 600

	if (x < 42) {
		monosynth.triggerAttackRelease(fr, 0.2)
	}
	else if (42 <= x && x < 85) {
		duosynth.triggerAttackRelease(fr, 0.2)
	}

	else if (85 <= x) {
		fmsynth.triggerAttackRelease(fr, 0.2)
	}

	isPlaying = true
	setTimeout(() => {
		isPlaying = false
	}, 200)

}


const sample_size = 2
const threshold = 40
let previous_frame = []


const offscreenCanvas = document.createElement("canvas")

const offscreenCtx = offscreenCanvas.getContext("2d", { alpha: false })
offscreenCtx.canvas.width = w;
offscreenCtx.canvas.height = h;

offscreenCtx.imageSmoothingEnabled = false

const small_canvas = document.querySelector("#small_canvas")
const ctx = small_canvas.getContext("2d", { alpha: false })
ctx.imageSmoothingEnabled = false

const renderOffscreenToActive = () => {
	ctx.drawImage(offscreenCanvas, 0, 0)
}

const draw = vid => {
	offscreenCtx.drawImage(vid, 0, 0, w, h)
	const data = offscreenCtx.getImageData(0, 0, w, h).data
	// for rows and columns in pixel array:
	for (let y = 0; y < h; y += sample_size) {
		for (let x = 0; x < w; x += sample_size) {
			// the data array is a continuous array of rgba values, so each pixel takes up four values in the array
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
				Math.abs(previous_frame[pos] - r) > threshold
			) {
				// draw the pixels as blocks of colours
				r = Math.floor(Math.random() * 255)
				g = Math.floor(Math.random() * 255)	
				b = Math.floor(Math.random() * 255)

				offscreenCtx.fillStyle = `rgb(${r},${g},${b})`;
				offscreenCtx.fillRect(x, y, sample_size, sample_size)
				previous_frame[pos] = r

				//input position x,y
				playSynth({ x: x, y: y })
			}
			else {
				offscreenCtx.fillStyle = `rgb(${r},${g},${b})`;
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
		window.requestAnimationFrame(() => draw(video))
	})
	.catch(error => {
		console.log(`The following error occured: ${error}`)
	})

//scale onscreen canvas
//x is innerWidth, y is innerHeight
//w is mini canvas width, h is mini canvas height

let scaleX = x / w
let scaleY = y / h

small_canvas.style.transformOrigin = "0 0" 

small_canvas.style.transform = `translateX(${w * scaleX}px) scaleX(-${scaleX}) scaleY(${scaleY})` 