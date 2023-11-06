/** Dispatch event on click outside of node */
export const clickOutside = (node: Node) => {
  const handleClick = (evt: MouseEvent) => {
    if (node && !node.contains(evt.target as Node) && !evt.defaultPrevented) {
      node.dispatchEvent(
        new CustomEvent("click_outside", { detail: node }),
      )
    }
  }

  setTimeout(() => document.addEventListener("click", handleClick, true), 0)
  return {
    destroy: () => document.removeEventListener("click", handleClick, true),
  }
}
