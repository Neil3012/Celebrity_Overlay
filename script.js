const videoElement = document.createElement("video");
videoElement.setAttribute("playsinline", ""); // Prevent fullscreen on mobile
videoElement.width = 640;
videoElement.height = 480;

const bgVideo = document.getElementById("bgVideo"); // Celebrity video
const outputCanvas = document.getElementById("outputCanvas");
const ctx = outputCanvas.getContext("2d");

// Match canvas size with the window
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
                facingMode: "environment", // Back camera
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

    // Draw the celebrity background video
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(bgVideo, 0, 0, outputCanvas.width, outputCanvas.height);

    // Draw the mask for the user
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(results.segmentationMask, 0, 0, outputCanvas.width, outputCanvas.height);

    // Draw the user on top (without background)
    ctx.globalCompositeOperation = "source-atop";
    ctx.drawImage(videoElement, 0, 0, outputCanvas.width, outputCanvas.height);
}

// Start the app
startCamera();
