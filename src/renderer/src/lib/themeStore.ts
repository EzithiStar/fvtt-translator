import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
    theme: Theme
    setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
    theme: (localStorage.getItem('fvtt-theme') as Theme) || 'light',
    setTheme: (theme) => {
        localStorage.setItem('fvtt-theme', theme)
        // 切换 document class
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        set({ theme })
    }
}))

// 初始化时应用主题
const initTheme = () => {
    const theme = localStorage.getItem('fvtt-theme') as Theme || 'light'
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
    }
}
initTheme()
