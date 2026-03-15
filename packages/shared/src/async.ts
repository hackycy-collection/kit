import { isPromise } from 'es-toolkit'

/**
 * A helper to try an async function without forking
 * the control flow. Returns an error first callback _like_
 * array response as [Error, result]
 */
export function tryit<Args extends any[], Return>(func: (...args: Args) => Return) {
  return (
    ...args: Args
  ): Return extends Promise<any>
    ? Promise<[Error, undefined] | [undefined, Awaited<Return>]>
    : [Error, undefined] | [undefined, Return] => {
    try {
      const result = func(...args)
      if (isPromise(result)) {
        return result
          .then(value => [undefined, value])
          .catch(err => [err, undefined]) as Return extends Promise<any>
          ? Promise<[Error, undefined] | [undefined, Awaited<Return>]>
          : [Error, undefined] | [undefined, Return]
      }
      return [undefined, result] as Return extends Promise<any>
        ? Promise<[Error, undefined] | [undefined, Awaited<Return>]>
        : [Error, undefined] | [undefined, Return]
    }
    catch (err) {
      return [err as any, undefined] as Return extends Promise<any>
        ? Promise<[Error, undefined] | [undefined, Awaited<Return>]>
        : [Error, undefined] | [undefined, Return]
    }
  }
}

/**
 * A helper to try an async function that returns undefined
 * if it fails.
 *
 * e.g. const result = await guard(fetchUsers)() ?? [];
 */
export function guard<TFunction extends () => any>(func: TFunction, shouldGuard?: (err: any) => boolean): ReturnType<TFunction> extends Promise<any>
  ? Promise<Awaited<ReturnType<TFunction>> | undefined>
  : ReturnType<TFunction> | undefined {
  const _guard = (err: any) => {
    if (shouldGuard && !shouldGuard(err))
      throw err
    return undefined as any
  }
  const isPromise = (result: any): result is Promise<any> =>
    result instanceof Promise
  try {
    const result = func() as ReturnType<TFunction>
    return isPromise(result) ? result.catch(_guard) : result
  }
  catch (err) {
    return _guard(err)
  }
}
