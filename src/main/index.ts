import { app, shell, BrowserWindow, ipcMain, screen } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

let mainWindow: BrowserWindow | null = null;
let secondaryWindow: BrowserWindow | null = null;

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
		},
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow!.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

function createSecondaryWindow(): void {
	const displays = screen.getAllDisplays();
	const externalDisplay = displays.find((display) => {
		return display.bounds.x !== 0 || display.bounds.y !== 0;
	});

	if (externalDisplay) {
		secondaryWindow = new BrowserWindow({
			x: externalDisplay.bounds.x + 50,
			y: externalDisplay.bounds.y + 50,
			width: 400,
			height: 300,
			show: false,
			autoHideMenuBar: true,
			...(process.platform === "linux" ? { icon } : {}),
			webPreferences: {
				preload: join(__dirname, "../preload/index.js"),
				sandbox: false,
			},
		});

		secondaryWindow.on("ready-to-show", () => {
			secondaryWindow!.show();
		});

		if (is.dev && process.env.ELECTRON_RENDERER_URL) {
			secondaryWindow.loadURL(
				`${process.env.ELECTRON_RENDERER_URL}/#/secondary`,
			);
		} else {
			secondaryWindow.loadFile(join(__dirname, "../renderer/index.html"), {
				hash: "secondary",
			});
		}

		secondaryWindow.on("closed", () => {
			secondaryWindow = null;
		});
	} else {
		console.log("No external display found");
		if (mainWindow) {
			mainWindow.webContents.send("no-external-display");
		}
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	// IPC test
	ipcMain.on("ping", () => console.log("pong"));

	// New IPC handlers for countdown functionality
	ipcMain.on("open-secondary-window", () => {
		if (!secondaryWindow) {
			createSecondaryWindow();
		}
	});

	ipcMain.on("time-update", (_, time: number, isOvertime: boolean) => {
		if (secondaryWindow) {
			secondaryWindow.webContents.send("time-update", time, isOvertime);
		}
	});

	createWindow();

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
