// Get the audio element
var audio = document.getElementById("myAudio");

// Set the start time to 10 seconds
audio.currentTime = 10;

// Wait for the audio file to load
audio.addEventListener("canplaythrough", function () {
    // Play the audio
    audio.play();

    // Get the current time
    var start = Date.now();

    // Define a function to update the audio playback
    function updatePlayback() {
        // Calculate the elapsed time
        var elapsed = Date.now() - start;

        // Check if the elapsed time exceeds the desired duration (5 seconds)
        if (elapsed >= 5000) {
            audio.pause();
            return;
        }

        // Update the audio playback time
        audio.currentTime = 10 + elapsed / 1000;

        // Request the next animation frame
        requestAnimationFrame(updatePlayback);
    }

    // Request the first animation frame
    requestAnimationFrame(updatePlayback);
});