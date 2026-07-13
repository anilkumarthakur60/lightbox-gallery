export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  parent?: Element,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (parent) parent.appendChild(node)
  return node
}

export function button(
  className: string,
  label: string,
  icon: string,
  parent?: Element,
): HTMLButtonElement {
  const btn = el('button', `lbg-btn ${className}`, parent)
  btn.type = 'button'
  btn.setAttribute('aria-label', label)
  btn.title = label
  btn.innerHTML = icon
  return btn
}
