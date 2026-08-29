import { describe, expect, it } from 'vitest'

import {
  normalizePoorMadOpenString,
  pathFromOpenDeepLink,
  pathFromPoorMadDeepLink,
  resolvePoorMadOpenPath
} from './poormad-open-target'

describe('normalizePoorMadOpenString', () => {
  it('accepts hash-router paths and strips a leading hash', () => {
    expect(normalizePoorMadOpenString('/index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizePoorMadOpenString('#/index-network/intent/1')).toBe('/index-network/intent/1')
  })

  it('maps plugin-scoped poormad:// deep links to the same path', () => {
    expect(normalizePoorMadOpenString('poormad://index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizePoorMadOpenString('poormad://index-network/intent/1?focus=true')).toBe(
      '/index-network/intent/1?focus=true'
    )
  })

  it('maps poormad://open/… deep links by stripping the open host', () => {
    expect(normalizePoorMadOpenString('poormad://open/index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizePoorMadOpenString('poormad://open/settings/plugins')).toBe('/settings/plugins')
  })

  it('rejects reserved poormad kinds and unsafe paths', () => {
    expect(normalizePoorMadOpenString('poormad://blueprint/morning-brief')).toBeNull()
    expect(normalizePoorMadOpenString('poormad://plugin/install')).toBeNull()
    expect(normalizePoorMadOpenString('https://example.com/x')).toBeNull()
    expect(normalizePoorMadOpenString('/../etc/passwd')).toBeNull()
    expect(normalizePoorMadOpenString('index-network')).toBeNull()
  })
})

describe('resolvePoorMadOpenPath', () => {
  it('merges structured path + params', () => {
    expect(resolvePoorMadOpenPath({ path: '/index-network/intent/1', params: { focus: 'true' } })).toBe(
      '/index-network/intent/1?focus=true'
    )
  })

  it('resolves href the same as a bare string', () => {
    expect(resolvePoorMadOpenPath({ href: 'poormad://index-network/intent/1' })).toBe('/index-network/intent/1')
  })
})

describe('pathFromPoorMadDeepLink', () => {
  it('builds the navigate path from a plugin-scoped deep-link payload', () => {
    expect(pathFromPoorMadDeepLink('index-network', 'intent/1')).toBe('/index-network/intent/1')
  })

  it('builds the navigate path from poormad://open/… payloads', () => {
    expect(pathFromOpenDeepLink('index-network/intent/1')).toBe('/index-network/intent/1')
    expect(pathFromPoorMadDeepLink('open', 'agent/42')).toBe('/agent/42')
  })

  it('ignores reserved kinds', () => {
    expect(pathFromPoorMadDeepLink('blueprint', 'morning-brief')).toBeNull()
    expect(pathFromPoorMadDeepLink('plugin', 'install')).toBeNull()
  })
})
