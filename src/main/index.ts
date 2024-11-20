import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null
let secondaryWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    if (mainWindow) {
      mainWindow.webContents.insertCSS(`
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none !important;
        appearance: none !important;
        margin: 0 !important;
      }
      input[type="number"] {
        -moz-appearance: textfield !important;
        appearance: none !important;
      }
    `);
    }
  });

  mainWindow.on('close', () => {
    closeSecondaryWindow()
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
    }    
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createSecondaryWindow(): void {
  const displays = screen.getAllDisplays()
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  if (externalDisplay) {
    secondaryWindow = new BrowserWindow({
      x: externalDisplay.bounds.x + 50,
      y: externalDisplay.bounds.y + 50,
      fullscreen: true,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    secondaryWindow.on('ready-to-show', () => {
      if (secondaryWindow) {
        secondaryWindow.show()
      }
    })

    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      secondaryWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/#/secondary`)
    } else {
      secondaryWindow.loadFile(join(__dirname, '../renderer/index.html'), {
        hash: 'secondary'
      })
    }

    secondaryWindow.on('closed', () => {
      secondaryWindow = null
    })
  } else {
   secondaryWindow = new BrowserWindow({
      x: 50,
      y: 50,
      width: 800,
      height: 600,
      show: false,
      fullscreen: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    secondaryWindow.on('ready-to-show', () => {
      if (secondaryWindow) {
        secondaryWindow.show()
      }
    })

    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      secondaryWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/#/secondary`)
    } else {
      secondaryWindow.loadFile(join(__dirname, '../renderer/index.html'), {
        hash: 'secondary'
      })
    }

    secondaryWindow.on('closed', () => {
      secondaryWindow = null
    })
  }
}

function closeSecondaryWindow(): void {
  if (secondaryWindow) {
    secondaryWindow.close();
    secondaryWindow = null;
  } else {
    console.log('A janela secundária já está fechada ou não foi criada');
  }
}


app.whenReady().then(() => {

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('open-secondary-window', () => {
    if (!secondaryWindow) {
      createSecondaryWindow()
    }
  })

  ipcMain.on('close-secondary-window', () => {
  if (secondaryWindow) {
    closeSecondaryWindow();
  }
});

  ipcMain.on('time-update', (_, time: number, isOvertime: boolean) => {
    if (secondaryWindow) {
      secondaryWindow.webContents.send('time-update', time, isOvertime)
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
