import { githubIcon, moonIcon, sunIcon } from '../lib/icons'
import { repoUrl } from '../lib/links'

const links = [
  { href: '#arquitetura', label: 'Arquitetura' },
  { href: '#custos', label: 'Custos' },
  { href: '#comparacao', label: 'On-premises' },
  { href: '#decisoes', label: 'Decisões' },
]

const brandMark = `
  <svg class="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
    <rect width="28" height="28" rx="8" />
    <path d="M7 14h14M14 7v14" />
    <circle cx="21.5" cy="14" r="2.3" />
  </svg>`

export function renderNav(): string {
  return `
    <nav class="nav" aria-label="Principal">
      <a class="brand" href="#topo" aria-label="Início">${brandMark}<span class="brand-name">pharma<span>/</span>aws</span></a>
      <ul class="nav-links">
        ${links.map((link) => `<li><a href="${link.href}">${link.label}</a></li>`).join('')}
      </ul>
      <div class="nav-actions">
        <button class="icon-button theme-toggle" type="button" data-theme-toggle aria-label="Alternar tema">
          <span class="theme-icon theme-icon--sun">${sunIcon}</span>
          <span class="theme-icon theme-icon--moon">${moonIcon}</span>
        </button>
        <a class="icon-button" href="${repoUrl}" target="_blank" rel="noreferrer" aria-label="Repositório no GitHub">${githubIcon}</a>
      </div>
    </nav>`
}
