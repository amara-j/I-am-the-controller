const w = 1280
const h = 720
const sample_size = 15
const threshold = 100;
let previous_frame = [];

console.log(Tone)

const synth = new Tone.MonoSynth().toDestination()

const playSynth = () => {
    //fr 100 440
    const fr = Math.floor(Math.random() * 340) + 100
    synth.triggerAttackRelease(fr, "8n")
}

const draw = (vid) => {
    ctx.drawImage(vid, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data;
    // for rows and columns in pixel array:
    for (let y = 0; y < h; y += sample_size) {
        for (let x = 0; x < w; x += sample_size) {
            // the data array is a continuous array of red, blue, green and alpha values, so each pixel takes up four values in the array
            let pos = (x + y * w) * 4;

            // get red, blue and green pixel value
            let r = data[pos];
            let g = data[pos + 1];
            let b = data[pos + 2];

            if (previous_frame[pos] && Math.abs(previous_frame[pos] - r) > threshold) {
                // draw the pixels as blocks of colours
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, sample_size, sample_size);
                previous_frame[pos] = r;
                console.log('movement')
                playSynth()

            } else {
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, sample_size, sample_size);
                previous_frame[pos] = r;
            }
        }
    }
}
var video = document.querySelector('video')
const options = {
    video: { width: 1280, height: 720 }
}
navigator.mediaDevices.getUserMedia(options)
    .then(function (stream) {
        video.srcObject = stream
        setInterval(() => draw(video), 10)
    })
    .catch((error) => {
        console.log("An error occured")
    })

const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")