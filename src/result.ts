export abstract class Result<T = unknown, E = unknown> implements Promise<T> {

  static of<T = unknown, E = unknown>(value: T): Result<T, E> {
    return new Ok(value)
  }

  static err<T = unknown, E = unknown>(value: E): Result<T, E> {
    return new Err(value)
  }

  static wrap<T = unknown, E = unknown>(fn: () => T): Result<T, E> {
    try {
      return Result.of(fn())
    } catch (err) {
      return Result.err(err as E)
    }
  }

  abstract map<Y = T>(fn: (value: T) => Y): Result<Y, E>

  abstract flatMap<Y = T>(fn: (value: T) => Result<Y, E>): Result<Y, E>

  abstract mapError<Y = E>(fn: (value: E) => Y): Result<T, Y>

  abstract flatMapError<Y = E>(fn: (value: E) => Result<T, Y>): Result<T, Y>

  abstract isOk(): boolean

  abstract unwrap(): T

  abstract withDefault(value: T): T

  abstract toPromise(): Promise<T>

  then<Y = T, Z = E>(
    onFulfilled?: ((value: T) => Y | PromiseLike<Y>) | null,
    onRejected?: ((reason: E) => Z | PromiseLike<Z>) | null,
  ): Promise<Y | Z> {
    return this.toPromise().then(onFulfilled, onRejected)
  }

  catch <Y = E>(onRejected?: ((reason: E) => Y | PromiseLike<Y>) | null) {
    return this.toPromise().catch(onRejected)
  }

  // eslint-disable-next-line @stylistic/keyword-spacing
  finally(onFinally?: (() => void) | null): Promise<T> {
    return this.toPromise().finally(onFinally)
  }

  get [Symbol.toStringTag]() {
    return "Result"
  }
}

export class Ok<T = unknown, E = unknown> extends Result<T, E> {
  _value: T

  constructor(value: T) {
    super()
    this._value = value
  }

  map<Y = T>(fn: (value: T) => Y): Result<Y, E> {
    return new Ok(fn(this._value))
  }

  flatMap<Y = T>(fn: (value: T) => Result<Y, E>): Result<Y, E> {
    return fn(this._value)
  }

  mapError<Y = T>(_fn: (value: E) => Y): Result<T, Y> {
    return new Ok(this._value)
  }

  flatMapError<Y = T>(_fn: (value: E) => Result<T, Y>): Result<T, Y> {
    return new Ok(this._value)
  }

  isOk(): true {
    return true
  }

  unwrap(): T {
    return this._value
  }

  withDefault(_value: T): T {
    return this._value
  }

  toPromise() {
    return Promise.resolve(this._value)
  }
}

export class Err<T = unknown, E = unknown> extends Result<T, E> {
  _value: E

  constructor(value: E) {
    super()
    this._value = value
  }

  map<Y = T>(_fn: (value: T) => Y): Result<Y, E> {
    return new Err(this._value)
  }

  flatMap<Y = T>(_fn: (value: T) => Result<Y, E>): Result<Y, E> {
    return new Err(this._value)
  }

  mapError<Y = E>(fn: (value: E) => Y): Result<T, Y> {
    return new Err(fn(this._value))
  }

  flatMapError<Y = E>(fn: (value: E) => Result<T, Y>): Result<T, Y> {
    return fn(this._value)
  }

  isOk(): false {
    return false
  }

  unwrap(): T {
    throw this._value
  }

  withDefault(value: T): T {
    return value
  }

  toPromise() {
    return Promise.reject(this._value)
  }
}

/** Create an Ok instance, alias to Result.of */
export const ok = Result.of

/** Create an Err instance, alias to Result.err */
export const err = Result.err
