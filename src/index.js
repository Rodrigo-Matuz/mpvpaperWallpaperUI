const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { playVideo } = require("./videoPlayer"); // Import the playVideo function

ffmpeg.setFfmpegPath(ffmpegPath);
let store;

if (require("electron-squirrel-startup")) {
    app.quit();
}

let mainWindow;

const createWindow = async () => {
    const Store = await import("electron-store");
    store = new Store.default();

    const windowOptions = {
        width: 900,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    };

    mainWindow = new BrowserWindow(windowOptions);

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile(path.join(__dirname, "index.html"));

    mainWindow.webContents.on("did-finish-load", async () => {
        const previousData = store.get("previousData");
        if (previousData && fs.existsSync(previousData.path)) {
            console.log(`Previous path exists: ${previousData.path}`);
            mainWindow.webContents.send("load-previous-path", previousData);
        } else {
            console.log("No valid previous path found");
        }
    });
};

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
    });

    if (result.canceled) return;

    const selectedPath = result.filePaths[0];
    const videoData = await getVideoData(selectedPath);
    store.set("previousData", { path: selectedPath, videoData });

    return videoData;
});

async function getVideoData(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    const mp4Files = files
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => path.join(directoryPath, file));

    const videoData = await Promise.all(
        mp4Files.map(async (file) => {
            const thumbnailPath = await generateThumbnail(file);
            return { videoPath: file, thumbnailPath };
        }),
    );

    return videoData;
}

async function generateThumbnail(videoPath) {
    const thumbnailPath = path.join(
        app.getPath("userData"), // Changed to userData to persist thumbnails
        "thumbnails",
        `${path.basename(videoPath, ".mp4")}.png`,
    );

    if (fs.existsSync(thumbnailPath)) {
        return thumbnailPath;
    }

    if (!fs.existsSync(path.join(app.getPath("userData"), "thumbnails"))) {
        fs.mkdirSync(path.join(app.getPath("userData"), "thumbnails"));
    }

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                count: 1,
                folder: path.join(app.getPath("userData"), "thumbnails"),
                filename: `${path.basename(videoPath, ".mp4")}.png`,
                size: "200x113",
            })
            .on("end", () => resolve(thumbnailPath))
            .on("error", (err) => reject(err));
    });
}

ipcMain.handle("play-video", (event, videoPath) => {
    playVideo(videoPath);
});
