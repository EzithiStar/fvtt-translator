import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileSystem } from './lib/fileSystem'
import { codeParser } from './lib/parsers'
import { aiService } from './lib/ai'
import { moduleExporter } from './lib/exporter'
import { glossaryManager } from './lib/glossary'
import { glossaryImporter } from './lib/glossaryImporter'
import { blacklistManager } from './lib/blacklist'

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon: join(__dirname, '../../build/icon.png') } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true // Important for direct file access if needed, though contextBridge is safer
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Window resize IPC handlers
    ipcMain.handle('window:resize', (_, width: number, height: number) => {
        mainWindow.setSize(width, height)
        mainWindow.center()
    })

    ipcMain.handle('window:getSize', () => {
        const [width, height] = mainWindow.getSize()
        return { width, height }
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC Handlers
    ipcMain.handle('fs:selectDirectory', () => fileSystem.selectDirectory())
    ipcMain.handle('fs:selectFile', (_, e) => fileSystem.selectFile(e))
    ipcMain.handle('fs:readJson', (_, p) => fileSystem.readJson(p))
    ipcMain.handle('fs:writeJson', (_, p, d) => fileSystem.writeJson(p, d))
    ipcMain.handle('fs:readFile', (_, p) => fileSystem.readFile(p))
    ipcMain.handle('fs:writeFile', (_, p, c) => fileSystem.writeFile(p, c))
    ipcMain.handle('fs:getFiles', (_, p, e) => fileSystem.getFiles(p, e))
    ipcMain.handle('fs:showSaveDialog', (_, p) => fileSystem.showSaveDialog(p))
    ipcMain.handle('fs:extractZip', (_, p) => fileSystem.extractZip(p))
    ipcMain.handle('fs:calculateProgress', (_, p) => fileSystem.calculateProgress(p))
    ipcMain.handle('fs:deleteFile', (_, p) => fileSystem.deleteFile(p))
    ipcMain.handle('fs:fileExists', (_, p) => fileSystem.fileExists(p))

    ipcMain.handle('parser:scanFile', (_, p) => codeParser.scanFile(p))
    ipcMain.handle('parser:applyPatch', (_, p, t) => codeParser.applyPatch(p, t))

    // AI
    ipcMain.handle('ai:translate', (_, text, config, projectPath) => aiService.translate(text, config, projectPath))

    ipcMain.handle('export:exportModule', (_, p, m, f, s) => moduleExporter.exportModule(p, m, f, s))
    ipcMain.handle('export:getModuleInfo', (_, p) => moduleExporter.getModuleInfo(p))

    // Glossary
    ipcMain.handle('glossary:list', () => glossaryManager.listGlossaries())
    ipcMain.handle('glossary:load', (_, name) => glossaryManager.loadGlossary(name))
    ipcMain.handle('glossary:save', (_, name, entries) => glossaryManager.saveGlossary(name, entries))
    ipcMain.handle('glossary:create', (_, name) => glossaryManager.createGlossary(name))
    ipcMain.handle('glossary:delete', (_, name) => glossaryManager.deleteGlossary(name))
    ipcMain.handle('glossary:getActive', () => glossaryManager.getActiveGlossaries())
    ipcMain.handle('glossary:setActive', (_, names) => glossaryManager.setActiveGlossaries(names))
    ipcMain.handle('glossary:import', (_, filePath) => glossaryImporter.importFromJsonFile(filePath))

    // Blacklist
    ipcMain.handle('blacklist:get', () => blacklistManager.getList())
    ipcMain.handle('blacklist:add', (_, key) => blacklistManager.add(key))
    ipcMain.handle('blacklist:remove', (_, key) => blacklistManager.remove(key))

    // Bilingual Export
    ipcMain.handle('export:generateBilingual', (_, translatedData, originalData, threshold) =>
        moduleExporter.generateBilingual(translatedData, originalData, threshold)
    )

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
