const videoElement = document.createElement("video");
videoElement.setAttribute("playsinline", ""); // Prevents fullscreen pop-up on iOS
videoElement.width = 640;
videoElement.height = 480;

const outputCanvas = document.getElementById("outputCanvas");
const ctx = outputCanvas.getContext("2d");

// Set canvas to match the screen size
outputCanvas.width = window.innerWidth;
outputCanvas.height = window.innerHeight;

// Load MediaPipe Selfie Segmentation
const selfieSegmentation = new SelfieSegmentation({ locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
});

selfieSegmentation.setOptions({ modelSelection: 1 });
selfieSegmentation.onResults(processResults);

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment", // Opens the back camera
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        videoElement.srcObject = stream;
        await videoElement.play();
        processVideoFrame();
    } catch (err) {
        console.error("Camera access error:", err);
        alert("Please enable camera permissions in your browser settings.");
    }
}

async function processVideoFrame() {
    await selfieSegmentation.send({ image: videoElement });
    requestAnimationFrame(processVideoFrame);
}

function processResults(results) {
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Flip the video horizontally (mirror effect)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-outputCanvas.width, 0);

    // Draw the segmentation mask
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(results.segmentationMask, 0, 0, outputCanvas.width, outputCanvas.height);

    // Draw only the user (without background)
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(videoElement, 0, 0, outputCanvas.width, outputCanvas.height);

    ctx.restore();
}

// Start the app
startCamera();
