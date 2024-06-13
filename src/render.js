document.addEventListener("DOMContentLoaded", async () => {
    const buttonOpenFolder = document.querySelector(
        "button.button-open-folder",
    );
    const displayItems = document.querySelector(".display-items");
    const loadingItems = document.querySelector(".loading-items");
    const searchBar = document.getElementById("searchBar");
    const buttonSettings = document.querySelector("button.button-settings");
    const settingsPanel = document.querySelector(".settings-panel");
    const closeSettingsButton = document.querySelector(".close-settings");
    const clearCacheButton = document.querySelector(".clear-cache");
    const commandInput = document.getElementById("commandInput");
    const saveCommandButton = document.querySelector(".save-command");

    let videoDataCache = [];

    // Function to load command from storage
    const loadCommand = async () => {
        try {
            const command = await window.electronAPI.getCommand();
            commandInput.value = command;
        } catch (err) {
            console.error("Failed to load command:", err);
        }
    };

    // Initial load of command when DOM is ready
    loadCommand();

    buttonOpenFolder.addEventListener("click", async () => {
        loadingItems.style.display = "block";
        displayItems.innerHTML = "";

        const videoData = await window.electronAPI.selectFolder();
        videoDataCache = videoData;

        loadingItems.style.display = "none";
        displayThumbnails(videoData);
    });

    window.electronAPI.receive("load-previous-path", (previousData) => {
        loadingItems.style.display = "none";
        videoDataCache = previousData.videoData;
        displayThumbnails(previousData.videoData);
    });

    searchBar.addEventListener("input", (event) => {
        const searchTerm = event.target.value.toLowerCase().replace(/_/g, " ");
        const filteredData = videoDataCache.filter(({ thumbnailPath }) => {
            const normalizedThumbnailPath = thumbnailPath
                .toLowerCase()
                .replace(/_/g, " ");
            return normalizedThumbnailPath.includes(searchTerm);
        });
        displayThumbnails(filteredData);
    });

    buttonSettings.addEventListener("click", () => {
        settingsPanel.style.display = "flex";
    });

    closeSettingsButton.addEventListener("click", () => {
        settingsPanel.style.display = "none";
    });

    clearCacheButton.addEventListener("click", async () => {
        const response = confirm("Are you sure you want to clear the cache?");
        if (response) {
            await window.electronAPI.clearCache();
            alert("Cache cleared successfully!");
        }
    });

    // Save the command when the save button is clicked
    saveCommandButton.addEventListener("click", async () => {
        const newCommand = commandInput.value;
        await window.electronAPI.setCommand(newCommand);
        alert("Command saved successfully!");
    });

    function displayThumbnails(videoData) {
        displayItems.innerHTML = "";
        videoData.forEach(({ videoPath, thumbnailPath }) => {
            const container = document.createElement("div");
            container.className = "video-container";

            const img = document.createElement("img");
            img.src = `file://${thumbnailPath}`;
            img.alt = "Video Thumbnail";

            const playIcon = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg",
            );
            playIcon.setAttribute("class", "play-icon");
            playIcon.setAttribute("viewBox", "0 0 512 512");
            playIcon.innerHTML = `
                <g>
                    <g>
                        <g>
                            <path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333
                                c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333
                                z"/>
                            <path d="M375.467,238.933l-170.667-128c-14.064-10.548-34.133-0.513-34.133,17.067v256c0,17.58,20.07,27.615,34.133,17.067
                                l170.667-128C386.844,264.533,386.844,247.467,375.467,238.933z M213.333,341.333V170.667L327.111,256L213.333,341.333z"/>
                        </g>
                    </g>
                </g>
            `;
            playIcon.style.fill = getComputedStyle(
                document.documentElement,
            ).getPropertyValue("--accent-color");

            const videoElement = document.createElement("video");
            videoElement.src = `file://${videoPath}`;
            videoElement.controls = true;
            videoElement.style.display = "none";

            container.appendChild(img);
            container.appendChild(playIcon);
            container.appendChild(videoElement);
            displayItems.appendChild(container);

            img.addEventListener("click", () => {
                console.log(videoPath);
                window.electronAPI.playVideo(videoPath);
            });
        });
    }
});
