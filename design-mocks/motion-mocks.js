import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@13.1.1/+esm"

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(window.location.search).has("static")

if (!reduce) {
  const heroItems = document.querySelectorAll("[data-hero-item]")
  if (heroItems.length) {
    animate(heroItems, { opacity: [0, 1], y: [18, 0] }, { duration: 0.55, delay: stagger(0.07), ease: [0.22, 1, 0.36, 1] })
    animate(".system-node", { opacity: [0, 1], scale: [0.82, 1] }, { duration: 0.55, delay: stagger(0.12, { startDelay: 0.25 }), type: "spring", stiffness: 260, damping: 24 })
    animate(".orbit", { rotate: [0, 22] }, { duration: 1.2, ease: [0.22, 1, 0.36, 1] })
  }

  const diagramNodes = document.querySelectorAll(".diagram-node")
  const diagramPaths = document.querySelectorAll(".flow-line")
  if (diagramNodes.length) {
    animate(diagramNodes, { opacity: [0, 1] }, { duration: 0.38, delay: stagger(0.1), ease: [0.22, 1, 0.36, 1] })
    animate(diagramPaths, { pathLength: [0, 1], opacity: [0.15, 1] }, { duration: 0.8, delay: stagger(0.12, { startDelay: 0.35 }), ease: "easeInOut" })
    animate(".diagram-callout", { opacity: [0, 1], x: [24, 0] }, { duration: 0.5, delay: 1.25, ease: [0.22, 1, 0.36, 1] })
  }

  const rows = document.querySelectorAll(".console-row")
  if (rows.length) {
    animate(rows, { opacity: [0, 1], x: [16, 0] }, { duration: 0.45, delay: stagger(0.1, { startDelay: 0.25 }), ease: [0.22, 1, 0.36, 1] })
  }
}
