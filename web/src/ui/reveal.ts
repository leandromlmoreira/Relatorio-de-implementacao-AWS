import { prefersReducedMotion } from '../lib/dom'

export function mountReveal(root: ParentNode): void {
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'))
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  targets.forEach((target) => observer.observe(target))
}
