import { spawn } from 'node:child_process'

export interface LaunchResult {
  code: null | number
  error?: string
}

const resolvePoorMadBin = () => process.env.POORMAD_BIN?.trim() || 'poormad'

export const launchPoorMadCommand = (args: string[]): Promise<LaunchResult> =>
  new Promise(resolve => {
    const child = spawn(resolvePoorMadBin(), args, { stdio: 'inherit' })

    child.on('error', err => resolve({ code: null, error: err.message }))
    child.on('exit', code => resolve({ code }))
  })
