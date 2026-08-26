import { animate } from "https://cdn.jsdelivr.net/npm/motion@13.1.1/+esm"

const layers = new Map([...document.querySelectorAll(".tone-layer")].map((layer) => [layer.dataset.tone, layer]))
const sections = [...document.querySelectorAll(".flow-section")]
const links = [...document.querySelectorAll("[data-section-link]")]
const number = document.querySelector("#flow-number")
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const ratios = new Map(sections.map((section) => [section, 0]))
const previewTone = document.documentElement.dataset.preview
let activeTone = previewTone || "red"

function activate(section, force = false) {
  const tone = section.dataset.tone
  if (!tone || (!force && tone === activeTone)) return
  activeTone = tone

  for (const [name, layer] of layers) {
    const opacity = name === tone ? 1 : 0
    if (reduced) layer.style.opacity = String(opacity)
    else animate(layer, { opacity }, { duration: 0.62, ease: [0.22, 1, 0.36, 1] })
  }

  document.documentElement.style.setProperty("--active-tone", `var(--${tone})`)
  number.textContent = section.dataset.number
  links.forEach((link) => link.classList.toggle("active", link.dataset.sectionLink === tone))
}

if (previewTone) {
  const previewSection = sections.find((section) => section.dataset.tone === previewTone)
  if (previewSection) activate(previewSection, true)
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => ratios.set(entry.target, entry.intersectionRatio))
  const dominant = sections.reduce((best, section) => ratios.get(section) > ratios.get(best) ? section : best, sections[0])
  if (ratios.get(dominant) >= 0.34) activate(dominant)
}, { threshold: [0, 0.2, 0.34, 0.5, 0.66, 0.8, 1] })

if (!previewTone) sections.forEach((section) => observer.observe(section))
