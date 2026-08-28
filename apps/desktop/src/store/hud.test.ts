import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { $activeGatewayProfile } from '@/store/profile'
import { $sessions } from '@/store/session'
import type { SessionInfo } from '@/types/poormad'

import { $hudActive, $hudSession, openHud, resetHudLayout } from './hud'

const desktopWindow = window as unknown as { poormadDesktop?: Window['poormadDesktop'] }
const initialPoorMadDesktop = desktopWindow.poormadDesktop

const open = vi.fn().mockResolvedValue({ ok: true })
const resetLayout = vi.fn().mockResolvedValue({ ok: true })

function installBridge() {
  desktopWindow.poormadDesktop = {
    hud: { open, resetLayout }
  } as unknown as Window['poormadDesktop']
}

function session(overrides: Partial<SessionInfo>): SessionInfo {
  return { id: 's', title: '', created_at: '', updated_at: '', ...overrides } as SessionInfo
}

beforeEach(() => {
  open.mockClear()
  resetLayout.mockClear()
  installBridge()
  $hudActive.set(false)
  $hudSession.set(null)
  $sessions.set([])
  $activeGatewayProfile.set('default')
})

afterEach(() => {
  if (initialPoorMadDesktop) {
    desktopWindow.poormadDesktop = initialPoorMadDesktop
  } else {
    delete desktopWindow.poormadDesktop
  }
})

describe('resetHudLayout', () => {
  it('uses the native HUD recovery capability', () => {
    resetHudLayout()

    expect(resetLayout).toHaveBeenCalledOnce()
  })
})

describe('openHud profile targeting (#82285)', () => {
  it('carries the session-stamped profile when the target belongs to another profile', () => {
    $sessions.set([session({ id: 'abc', profile: 'work' })])
    $activeGatewayProfile.set('default')

    openHud('abc')

    expect(open).toHaveBeenCalledWith({ sessionId: 'abc', profile: 'work' })
  })

  it('falls back to the active gateway profile for an unstamped session', () => {
    $sessions.set([session({ id: 'abc', profile: '' })])
    $activeGatewayProfile.set('work')

    openHud('abc')

    expect(open).toHaveBeenCalledWith({ sessionId: 'abc', profile: 'work' })
  })

  it('uses the active gateway profile when opening without a session', () => {
    $activeGatewayProfile.set('research')

    openHud()

    expect(open).toHaveBeenCalledWith({ sessionId: null, profile: 'research' })
  })

  it('normalizes to default for single-profile users', () => {
    openHud()

    expect(open).toHaveBeenCalledWith({ sessionId: null, profile: 'default' })
  })

  it('uses the active profile when the target session is not in the cache', () => {
    $activeGatewayProfile.set('work')

    openHud('unknown-session')

    expect(open).toHaveBeenCalledWith({ sessionId: 'unknown-session', profile: 'work' })
  })
})
