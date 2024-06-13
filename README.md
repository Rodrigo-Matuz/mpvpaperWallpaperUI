# Mpvpaper Wallpaper UI Selection

This project provides a basic UI for selecting wallpapers using Electron. The current state of the readme is messy; please feel free to update as needed.

## Dependencies

-   [mpvpaper](https://github.com/GhostNaN/mpvpaper)

<details open>
<summary>Installation Guide</summary>
<br>

Check out [releases](https://github.com/Rodrigo-Matuz/mpvpaperWallpaperUI/releases) for pre-built packages

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Rodrigo-Matuz/mpvpaperWallpaperUI.git
    cd mpvpaperWallpaperUI
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Build the application** (or run it using `npm start`):

    ```bash
    npm run make
    ```

4.  **Install Packages:**

```bash
cd out/make
```

Install either the deb package or the rpm, depending on your Linux distribution.

after instalation, you can remove the repo you just cloned, you can find the file at `/lib`

<details>
<summary>Building on Arch Linux for reference</summary>
<br>

```bash
npm run make
cd out/make/deb/x64
mkdir temp_dir
dpkg -x package.deb temp_dir
sudo cp -R temp_dir/* /

```

Note: replace `package.deb` by the actual name of the package

for Uninstalling

```bash
sudo rm -rf /lib/mpvpaper-wallpaper-picker-ui
```

</details>

</details>

Quick project to satisfy my needs.
