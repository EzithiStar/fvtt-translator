"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  selectDirectory: () => electron.ipcRenderer.invoke("fs:selectDirectory"),
  readJson: (path) => electron.ipcRenderer.invoke("fs:readJson", path),
  writeJson: (path, data) => electron.ipcRenderer.invoke("fs:writeJson", path, data),
  readFile: (path) => electron.ipcRenderer.invoke("fs:readFile", path),
  writeFile: (path, content) => electron.ipcRenderer.invoke("fs:writeFile", path, content),
  selectFile: (extensions) => electron.ipcRenderer.invoke("fs:selectFile", extensions),
  getFiles: (path, extensions) => electron.ipcRenderer.invoke("fs:getFiles", path, extensions),
  scanFile: (path) => electron.ipcRenderer.invoke("parser:scanFile", path),
  applyPatch: (path, translations) => electron.ipcRenderer.invoke("parser:applyPatch", path, translations),
  translate: (text, config, projectPath) => electron.ipcRenderer.invoke("ai:translate", text, config, projectPath),
  showSaveDialog: (defaultPath) => electron.ipcRenderer.invoke("fs:showSaveDialog", defaultPath),
  extractZip: (path) => electron.ipcRenderer.invoke("fs:extractZip", path),
  calculateProgress: (path) => electron.ipcRenderer.invoke("fs:calculateProgress", path),
  exportModule: (projectPath, metadata, files, stagedFiles) => electron.ipcRenderer.invoke("export:exportModule", projectPath, metadata, files, stagedFiles),
  getModuleInfo: (projectPath) => electron.ipcRenderer.invoke("export:getModuleInfo", projectPath),
  // Glossary
  listGlossaries: () => electron.ipcRenderer.invoke("glossary:list"),
  loadGlossary: (name) => electron.ipcRenderer.invoke("glossary:load", name),
  saveGlossary: (name, entries) => electron.ipcRenderer.invoke("glossary:save", name, entries),
  createGlossary: (name) => electron.ipcRenderer.invoke("glossary:create", name),
  deleteGlossary: (name) => electron.ipcRenderer.invoke("glossary:delete", name),
  getActiveGlossaries: () => electron.ipcRenderer.invoke("glossary:getActive"),
  setActiveGlossaries: (names) => electron.ipcRenderer.invoke("glossary:setActive", names),
  importGlossary: (filePath) => electron.ipcRenderer.invoke("glossary:import", filePath),
  // Blacklist
  getBlacklist: () => electron.ipcRenderer.invoke("blacklist:get"),
  addBlacklist: (key) => electron.ipcRenderer.invoke("blacklist:add", key),
  removeBlacklist: (key) => electron.ipcRenderer.invoke("blacklist:remove", key)
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
