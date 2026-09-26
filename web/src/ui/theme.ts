type Theme = 'light' | 'dark'

const STORAGE_KEY = 'pharma-aws-theme'
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function activeTheme(): Theme {
  const explicit = document.documentElement.dataset.theme
  if (explicit === 'light' || explicit === 'dark') return explicit
  return darkQuery.matches ? 'dark' : 'light'
}

function persist(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    return
  }
}

function describe(button: HTMLButtonElement): void {
  const next = activeTheme() === 'dark' ? 'claro' : 'escuro'
  button.setAttribute('aria-label', `Mudar para o tema ${next}`)
  button.title = `Tema ${next}`
}

export function mountThemeToggle(button: HTMLButtonElement): void {
  describe(button)
  darkQuery.addEventListener('change', () => describe(button))
  button.addEventListener('click', () => {
    const next: Theme = activeTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    persist(next)
    describe(button)
  })
}
