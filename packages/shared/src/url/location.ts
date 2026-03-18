import type { LocationNormalized, LocationPartial, LocationQuery, LocationQueryRaw } from './types'
import { decode } from './encoding'

const TRAILING_SLASH_RE = /\/$/
export function removeTrailingSlash(path: string) {
  return path.replace(TRAILING_SLASH_RE, '')
}

/**
 * Transforms a URI into a normalized history location
 *
 * @param parseQuery
 * @param location - URI to normalize
 * @param currentLocation - current absolute location. Allows resolving relative
 * paths. Must start with `/`. Defaults to `/`
 * @returns a normalized history location
 */
export function parseURL(
  parseQuery: (search: string) => LocationQuery,
  location: string,
  currentLocation: string = '/',
): LocationNormalized {
  let path: string | undefined
  let query: LocationQuery = {}
  let searchString = ''
  let hash = ''

  // NOTE: we could use URL and URLSearchParams but they are 2 to 5 times slower than this method
  const hashPos = location.indexOf('#')
  let searchPos = location.indexOf('?')

  // This ensures that the ? is not part of the hash
  // e.g. /foo#hash?query -> has no query
  searchPos = hashPos >= 0 && searchPos > hashPos ? -1 : searchPos

  if (searchPos >= 0) {
    path = location.slice(0, searchPos)
    // keep the ? char
    searchString = location.slice(
      searchPos,
      // hashPos cannot be 0 because there is a search section in the location
      hashPos > 0 ? hashPos : location.length,
    )

    query = parseQuery(
      // remove the leading ?
      searchString.slice(1),
    )
  }

  if (hashPos >= 0) {
    // TODO(major): path ||=
    path = path || location.slice(0, hashPos)
    // keep the # character
    hash = location.slice(hashPos, location.length)
  }

  path = resolveRelativePath(
    // TODO(major): path ?? location
    path ?? location,
    currentLocation,
  )

  return {
    // we can't directly use the location parameter because it can be a relative path
    fullPath: path + searchString + hash,
    path,
    query,
    hash: decode(hash),
  }
}

/**
 * Stringifies a URL object
 *
 * @param stringifyQuery
 * @param location
 */
export function stringifyURL(
  stringifyQuery: (query: LocationQueryRaw) => string,
  location: LocationPartial,
): string {
  const query: string = location.query ? stringifyQuery(location.query) : ''
  return location.path + (query && '?') + query + (location.hash || '')
}

/**
 * Strips off the base from the beginning of a location.pathname in a non-case-sensitive way.
 *
 * @param pathname - location.pathname
 * @param base - base to strip off
 */
export function stripBase(pathname: string, base: string): string {
  // no base or base is not found at the beginning
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
    return pathname
  return pathname.slice(base.length) || '/'
}

/**
 * Resolves a relative path that starts with `.`.
 *
 * @param to - path location we are resolving
 * @param from - currentLocation.path, should start with `/`
 */
export function resolveRelativePath(to: string, from: string): string {
  if (to.startsWith('/'))
    return to
  if (!from.startsWith('/')) {
    console.warn(
      `Cannot resolve a relative location without an absolute path. Trying to resolve "${to}" from "${from}". It should look like "/${from}".`,
    )
    return to
  }

  // resolve to: '' with from: '/anything' -> '/anything'
  if (!to)
    return from

  const fromSegments = from.split('/')
  const toSegments = to.split('/')
  const lastToSegment: string | undefined = toSegments.at(-1)

  // make . and ./ the same (../ === .., ../../ === ../..)
  // this is the same behavior as new URL()
  if (lastToSegment === '..' || lastToSegment === '.') {
    toSegments.push('')
  }

  let position = fromSegments.length - 1
  let toPosition: number
  let segment: string

  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition]

    // we stay on the same position
    if (segment === '.')
      continue
    // go up in the from array
    if (segment === '..') {
      // we can't go below zero, but we still need to increment toPosition
      if (position > 1)
        position--
      // continue
    }
    // we reached a non-relative path, we stop here
    else {
      break
    }
  }

  return (
    `${fromSegments.slice(0, position).join('/')
    }/${
      toSegments.slice(toPosition).join('/')}`
  )
}
