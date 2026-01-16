import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FileTabStore {
    openedFiles: string[]
    activeFile: string | null

    // Actions
    openFile: (path: string) => void
    closeFile: (path: string) => void
    setActiveFile: (path: string) => void
    closeAllFiles: () => void
}

export const useFileTabStore = create<FileTabStore>()(
    persist(
        (set, get) => ({
            openedFiles: [],
            activeFile: null,

            openFile: (path) => {
                const { openedFiles } = get()
                if (!openedFiles.includes(path)) {
                    set({
                        openedFiles: [...openedFiles, path],
                        activeFile: path
                    })
                } else {
                    set({ activeFile: path })
                }
            },

            closeFile: (path) => {
                const { openedFiles, activeFile } = get()
                const newOpenedFiles = openedFiles.filter(f => f !== path)

                // If closing active file, switch to the last opened one or null
                let newActiveFile = activeFile
                if (activeFile === path) {
                    newActiveFile = newOpenedFiles.length > 0
                        ? newOpenedFiles[newOpenedFiles.length - 1]
                        : null
                }

                set({
                    openedFiles: newOpenedFiles,
                    activeFile: newActiveFile
                })
            },

            setActiveFile: (path) => {
                if (get().openedFiles.includes(path)) {
                    set({ activeFile: path })
                }
            },

            closeAllFiles: () => set({
                openedFiles: [],
                activeFile: null
            })
        }),
        {
            name: 'fvtt-translator-tabs', // unique name
        }
    )
)
