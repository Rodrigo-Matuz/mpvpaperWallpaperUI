const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { playVideo } = require("./videoPlayer");

ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;
let store;

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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle("get-command", () => {
    return store.get(
        "command",
        "killall mpvpaper ; mpvpaper -o 'loop no-audio' '*' {videoPath}",
    );
});

ipcMain.handle("set-command", (event, command) => {
    store.set("command", command);
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

ipcMain.handle("play-video", (event, videoPath) => {
    playVideo(videoPath);
});

ipcMain.handle("clear-cache", async () => {
    store.clear();
    const userDataPath = app.getPath("userData");

    try {
        await fsExtra.emptyDir(userDataPath);
        console.log(`Cleared cache and deleted contents of ${userDataPath}`);
    } catch (err) {
        console.error(`Error clearing cache: ${err}`);
    }
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
        app.getPath("userData"),
        "thumbnails",
        `${path.basename(videoPath, ".mp4")}.png`,
    );
    console.log(thumbnailPath);

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
                size: "220x124",
            })
            .on("end", () => resolve(thumbnailPath))
            .on("error", (err) => reject(err));
    });
}
