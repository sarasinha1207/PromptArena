/** Celebration on a successful registration. `className` is the CSS module class for one piece. */
export function launchConfetti(className: string): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#2f6bff", "#3cc8ff", "#ff2d55", "#ffffff", "#7440ff"];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("span");
    piece.className = className;
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 5500);
  }
}
