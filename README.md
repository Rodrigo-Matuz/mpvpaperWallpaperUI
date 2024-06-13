# Mpvpaper Wallpaper UI Selection

very basic UI to select a wallpaper, uses electron
(very messy readme file, feel free to update)

## Dependencies

-   [mpvpaper](https://github.com/GhostNaN/mpvpaper)

## Installation Guide

Follow these steps to set up and run the **mpvpaper_wallpaper_picker_ui** Electron application:

1. **Clone the repository**:

```bash
git clone https://github.com/Rodrigo-Matuz/mpvpaperWallpaperUI.git
```

2. **Install Dependencies**:

```
npm install
```

3. Build the application (or run it using `npm start`):

```
npm run make

```

-   After running `npm run make`, you'll find the built packages in the `out/make` directory.

5. **Installing the Debian package (deb)**:

-   Navigate to the directory where the deb package is located (`out/make/deb/x64`):
    ```
    cd out/make/deb/x64
    ```
-   Extract the package contents into a temporary directory:
    ```
    mkdir temp_dir
    dpkg -x mpvpaper-wallpaper-picker-ui_1.0.0_amd64.deb temp_dir
    ```
-   Copy the extracted contents to the root directory (requires sudo):
    ```
    sudo cp -R temp_dir/* /
    ```

6. **Installing the RPM package (rpm)**:

-   Navigate to the directory where the rpm package is located (`out/make/rpm/x64`):
    ```
    cd out/make/rpm/x64
    ```
-   Extract the package contents into a temporary directory (requires fakeroot and rpmbuild):
    ```
    mkdir temp_dir
    fakeroot rpmbuild --root temp_dir --unpack mpvpaper-wallpaper-picker-ui-1.0.0-1.x86_64.rpm
    ```
-   Copy the extracted contents to the root directory (requires sudo):
    ```
    sudo cp -R temp_dir/* /
    ```
