import os from 'node:os'

export interface ResolveNetwork { local: string[], network: string[] }

export function resolveIps(): ResolveNetwork {
  const local: string[] = []
  const network: string[] = []

  Object.values(os.networkInterfaces())
    .flatMap(nInterface => nInterface ?? [])
    .filter(
      detail =>
        detail
        && detail.address
        && (detail.family === 'IPv4'
          // @ts-expect-error Node 18.0 - 18.3 returns number
          || detail.family === 4),
    )
    .forEach((detail) => {
      let host = detail.address.replace('127.0.0.1', 'localhost')

      // ipv6 host
      if (host.includes(':')) {
        host = `[${host}]`
      }

      if (detail.address.includes('127.0.0.1')) {
        local.push(host)
      }
      else {
        network.push(host)
      }
    })

  return { local, network }
}
