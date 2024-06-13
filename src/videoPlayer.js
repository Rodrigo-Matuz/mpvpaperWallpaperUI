const { spawn } = require("child_process");

function playVideo(videoPath) {
    const command = `killall mpvpaper ; mpvpaper -o "loop no-audio" "*" ${videoPath}`;

    const mpvpaperProcess = spawn(command, {
        shell: true,
        detached: true,
        stdio: "ignore",
    });

    mpvpaperProcess.unref();

    mpvpaperProcess.on("error", (err) => {
        console.error(`Failed to start mpvpaper process: ${err}`);
    });

    console.log("mpvpaper process started successfully.");
}

module.exports = {
    playVideo,
};
