import { createContext, useContext, useEffect, useState } from 'react'

type Tema = 'light' | 'dark'

interface ThemeContextValue {
    tema: Tema
    alternarTema: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function obtenerTemaInicial(): Tema {
    const guardado = localStorage.getItem('tema')
    if (guardado === 'light' || guardado === 'dark') return guardado
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [tema, setTema] = useState<Tema>(obtenerTemaInicial)

    useEffect(() => {
        const root = document.documentElement
        if (tema === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        localStorage.setItem('tema', tema)
    }, [tema])

    function alternarTema() {
        setTema(prev => (prev === 'dark' ? 'light' : 'dark'))
    }

    return (
        <ThemeContext.Provider value={{ tema, alternarTema }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
    return ctx
}
