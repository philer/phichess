
export const clsx = (...classes: any[]) =>
  classes.filter(Boolean).join(" ")

export const isTruthy = <T>(x: T | false | null | undefined | 0 | ""): x is T =>
  !!x


const sentinel = Symbol("UNSET")

export function* pairs<T>(xs: Iterable<T>): Iterable<[T, T] | [T]> {
  let left: T | typeof sentinel = sentinel
  for (const x of xs) {
    if (left === sentinel) {
      left = x
    } else {
      yield [left, x]
      left = sentinel
    }
  }
  if (left !== sentinel) {
    yield [left]
  }
}

/**
 * Take text and a filename and (hopefully) offer it as a download
 * to the user.
 */
export function saveTextAs(text:string, filename:string) {
  const blob = new Blob([text], {type: "text/plain;charset=utf-8"})
  const url = URL.createObjectURL(blob)

  const downloadLink = document.createElement("a")
  downloadLink.style.display = "none"
  downloadLink.setAttribute("href", url)
  downloadLink.setAttribute("download", filename)

  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)

  setTimeout(() => URL.revokeObjectURL(url), 60 * 1000)
}
