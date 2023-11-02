
export const clsx = (...classes: any[]) =>
  classes.filter(Boolean).join(" ")

export const isTruthy = <T>(x: T | false | null | undefined | 0 | ""): x is T =>
  !!x


const sentinel = Symbol("UNSET")

export function partition<T>(predicate: ((x: T) => boolean), xs: Iterable<T>): [T[], T[]] {
  const left: T[] = []
  const right: T[] = []
  for (const x of xs) {
    if (predicate(x)) {
      left.push(x)
    } else {
      right.push(x)
    }
  }
  return [left, right]
}

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
