const videoElement = document.createElement("video");
videoElement.width = 640;
videoElement.height = 480;

// Get the canvas where the final output will be drawn
const outputCanvas = document.getElementById("outputCanvas");
const ctx = outputCanvas.getContext("2d");

// Set canvas size to match window
outputCanvas.width = window.innerWidth;
outputCanvas.height = window.innerHeight;

// Initialize MediaPipe Selfie Segmentation
const selfieSegmentation = new SelfieSegmentation({ locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
});

selfieSegmentation.setOptions({ modelSelection: 1 });
selfieSegmentation.onResults(processResults);

// Get user camera feed
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    await videoElement.play();
    processVideoFrame();
}

// Process each frame and remove the background
async function processVideoFrame() {
    await selfieSegmentation.send({ image: videoElement });
    requestAnimationFrame(processVideoFrame);
}

// Remove background and overlay the user onto the background video
function processResults(results) {
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Draw the segmented person only
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(results.segmentationMask, 0, 0, outputCanvas.width, outputCanvas.height);

    // Draw the original webcam feed only where the person is detected
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(videoElement, 0, 0, outputCanvas.width, outputCanvas.height);
}

// Start the app
startCamera();
