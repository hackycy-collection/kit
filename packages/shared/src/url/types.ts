/**
 * @internal
 */
export type RouteParamValue = string

/**
 * @internal
 */
export type RouteParamValueRaw = RouteParamValue | number | null | undefined

export type RouteParamsGeneric = Record<
  string,
  RouteParamValue | RouteParamValue[]
>

/**
 * Possible values in normalized {@link LocationQuery}. `null` renders the query
 * param but without an `=`.
 *
 * @example
 * ```
 * ?isNull&isEmpty=&other=other
 * gives
 * `{ isNull: null, isEmpty: '', other: 'other' }`.
 * ```
 *
 * @internal
 */
export type LocationQueryValue = string | null
/**
 * Possible values when defining a query. `undefined` allows to remove a value.
 *
 * @internal
 */
export type LocationQueryValueRaw = LocationQueryValue | number | undefined

/**
 * Normalized query object that appears in {@link RouteLocationNormalized}
 *
 * @public
 */
export type LocationQuery = Record<
  string,
  LocationQueryValue | LocationQueryValue[]
>

/**
 * Loose {@link LocationQuery} object that can be passed to functions like
 * {@link Router.push} and {@link Router.replace} or anywhere when creating a
 * {@link RouteLocationRaw}
 *
 * @public
 */
export type LocationQueryRaw = Record<
  string | number,
  LocationQueryValueRaw | LocationQueryValueRaw[]
>

/**
 * Location object returned by {@link `parseURL`}.
 * @internal
 */
export interface LocationNormalized {
  path: string
  fullPath: string
  hash: string
  query: LocationQuery
}

/**
 * Location object accepted by {@link `stringifyURL`}.
 *
 * @internal
 */
export interface LocationPartial {
  path: string
  query?: LocationQueryRaw
  hash?: string
}
