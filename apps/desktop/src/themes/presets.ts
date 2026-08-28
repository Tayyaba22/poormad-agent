/**
 * Built-in desktop themes. Names match the CLI skins / dashboard presets.
 * Add new themes here — no code changes needed elsewhere.
 *
 * The palette-bearing skins (nous, catppuccin, everforest, solarized) are forks
 * of their VS Code originals, converted by `buildThemeFromMarketplace` (see
 * ./install.ts) from the extensions below — the same path a Marketplace import
 * takes, so each is identical to installing the extension by hand and costs the
 * user neither the download nor the install step.
 *
 *   nous       ← github.github-vscode-theme   (Light Default / Dark Default)
 *   catppuccin ← Catppuccin.catppuccin-vsc    (Latte / Mocha)
 *   everforest ← sainnhe.everforest
 *   solarized  ← ryanolsonx.solarized
 *
 * Re-convert marketplace forks from the upstream extension rather than
 * hand-editing hexes; hand edits drift from upstream silently and can't be
 * re-derived. `nous-alt` is first-party — do not re-derive it from GitHub.
 */

import type { DesktopTheme, DesktopThemeTypography } from './types'

// Color-emoji fonts to append to every stack as a last resort. None of the UI
// text/mono fonts carry emoji glyphs, so without this emoji render as tofu
// boxes on platforms whose default text font lacks them (e.g. Linux/#40364).
// Covers macOS, Windows, Linux, plus the `emoji` generic for anything else.
export const EMOJI_FALLBACK = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", emoji'

const SYSTEM_SANS =
  '"Segoe WPC", "Segoe UI", -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif, ' +
  EMOJI_FALLBACK

const SYSTEM_MONO = 'Menlo, Monaco, "SF Mono", "Courier Prime", monospace, ' + EMOJI_FALLBACK

export const DEFAULT_TYPOGRAPHY: DesktopThemeTypography = { fontSans: SYSTEM_SANS, fontMono: SYSTEM_MONO }

/**
 * PoorMad — the canonical PoorMad desktop identity, forked from the GitHub VS Code
 * theme (github.github-vscode-theme). Light is GitHub Light Default, dark is
 * GitHub Dark Default, both converted through the same path a Marketplace
 * install takes, so the palette here is byte-identical to importing the
 * extension yourself.
 *
 * Typography stays PoorMad's own: a VS Code theme carries no font opinion, and
 * these are the stacks every skin has been rendering with.
 */
/**
 * GitHub — the upstream palette, unmodified.
 *
 * `nous` is a fork of this with its own accent, so shipping both keeps the
 * original available on its own terms instead of only existing as the thing
 * nous diverged from. Everything but the accent family is identical between
 * them; separate presets are what let nous's accent move without silently
 * redefining what "GitHub" means.
 */
export const githubTheme: DesktopTheme = {
  name: 'github',
  label: 'GitHub',
  description: 'GitHub Light Default and Dark Default',
  colors: {
    background: '#ffffff',
    foreground: '#1f2328',
    card: '#f6f8fa',
    cardForeground: '#1f2328',
    muted: '#f6f6f6',
    mutedForeground: '#656d76',
    popover: '#ffffff',
    popoverForeground: '#1f2328',
    primary: '#196d31',
    primaryForeground: '#ffffff',
    secondary: '#dfebe2',
    secondaryForeground: '#1f2328',
    accent: '#e3ede6',
    accentForeground: '#1f2328',
    border: '#d0d7de',
    input: '#ffffff',
    ring: '#196d31',
    midground: '#196d31',
    midgroundForeground: '#ffffff',
    composerRing: '#196d31',
    destructive: '#cf222e',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#f6f8fa',
    sidebarBorder: '#d0d7de',
    userBubble: '#dbe7e2',
    userBubbleBorder: '#d0d7de'
  },
  darkColors: {
    background: '#0d1117',
    foreground: '#e6edf3',
    card: '#010409',
    cardForeground: '#e6edf3',
    muted: '#1a1e24',
    mutedForeground: '#7d8590',
    popover: '#161b22',
    popoverForeground: '#e6edf3',
    primary: '#4f9e5e',
    primaryForeground: '#ffffff',
    secondary: '#1f382b',
    secondaryForeground: '#e6edf3',
    accent: '#192a24',
    accentForeground: '#e6edf3',
    border: '#30363d',
    input: '#0d1117',
    ring: '#4f9e5e',
    midground: '#4f9e5e',
    midgroundForeground: '#ffffff',
    composerRing: '#4f9e5e',
    destructive: '#f85149',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#010409',
    sidebarBorder: '#30363d',
    userBubble: '#0f2018',
    userBubbleBorder: '#30363d'
  },
  typography: {
    fontSans: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap'
  },
  terminal: {
    foreground: '#1f2328',
    black: '#24292f',
    red: '#cf222e',
    green: '#116329',
    yellow: '#4d2d00',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#1b7c83',
    white: '#6e7781',
    brightBlack: '#57606a',
    brightRed: '#a40e26',
    brightGreen: '#1a7f37',
    brightYellow: '#633c01',
    brightBlue: '#218bff',
    brightMagenta: '#a475f9',
    brightCyan: '#3192aa',
    brightWhite: '#8c959f'
  },
  darkTerminal: {
    foreground: '#e6edf3',
    black: '#484f58',
    red: '#ff7b72',
    green: '#3fb950',
    yellow: '#d29922',
    blue: '#58a6ff',
    magenta: '#bc8cff',
    cyan: '#39c5cf',
    white: '#b1bac4',
    brightBlack: '#6e7681',
    brightRed: '#ffa198',
    brightGreen: '#56d364',
    brightYellow: '#e3b341',
    brightBlue: '#79c0ff',
    brightMagenta: '#d2a8ff',
    brightCyan: '#56d4dd',
    brightWhite: '#ffffff'
  }
}

/** Catppuccin — Latte in light, Mocha in dark (Catppuccin.catppuccin-vsc). */

/**
 * PoorMad — the canonical PoorMad desktop identity: GitHub's chrome carrying PoorMad
 * blue. Forked from github.github-vscode-theme (Light Default / Dark Default),
 * with only the accent family re-seeded; every neutral is upstream's.
 *
 * Two seeds, one blue. `#0053FD` is the brand color and reads at 5.4:1 on the
 * light sidebar, but only 3.6:1 on the near-black dark one — so dark carries
 * `#4a84fe`, the same hue (263°) lifted to clear AA at 5.9:1. The soft
 * surfaces below are mixed from those seeds in OKLab, which is what keeps a
 * saturated blue from drifting violet on its way to white.
 */
export const nousTheme: DesktopTheme = {
  name: 'nous',
  label: 'PoorMad',
  description: 'GitHub chrome, PoorMad blue accent',
  colors: {
    background: '#ffffff',
    foreground: '#1f2328',
    card: '#f6f8fa',
    cardForeground: '#1f2328',
    muted: '#f6f6f6',
    mutedForeground: '#656d76',
    popover: '#ffffff',
    popoverForeground: '#1f2328',
    primary: '#0053fd',
    primaryForeground: '#ffffff',
    secondary: '#deeaff',
    secondaryForeground: '#1f2328',
    accent: '#e3edff',
    accentForeground: '#1f2328',
    border: '#d0d7de',
    input: '#ffffff',
    ring: '#0053fd',
    midground: '#0053fd',
    midgroundForeground: '#ffffff',
    composerRing: '#0053fd',
    destructive: '#cf222e',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#f6f8fa',
    sidebarBorder: '#d0d7de',
    userBubble: '#dae7fd',
    userBubbleBorder: '#d0d7de'
  },
  darkColors: {
    background: '#0d1117',
    foreground: '#e6edf3',
    card: '#010409',
    cardForeground: '#e6edf3',
    muted: '#1a1e24',
    mutedForeground: '#7d8590',
    popover: '#161b22',
    popoverForeground: '#e6edf3',
    primary: '#4a84fe',
    primaryForeground: '#161616',
    secondary: '#1d2e4f',
    secondaryForeground: '#e6edf3',
    accent: '#17243a',
    accentForeground: '#e6edf3',
    border: '#30363d',
    input: '#0d1117',
    ring: '#4a84fe',
    midground: '#4a84fe',
    midgroundForeground: '#161616',
    composerRing: '#4a84fe',
    destructive: '#f85149',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#010409',
    sidebarBorder: '#30363d',
    userBubble: '#07162c',
    userBubbleBorder: '#30363d'
  },
  typography: {
    fontSans: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap'
  },
  terminal: {
    foreground: '#1f2328',
    black: '#24292f',
    red: '#cf222e',
    green: '#116329',
    yellow: '#4d2d00',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#1b7c83',
    white: '#6e7781',
    brightBlack: '#57606a',
    brightRed: '#a40e26',
    brightGreen: '#1a7f37',
    brightYellow: '#633c01',
    brightBlue: '#218bff',
    brightMagenta: '#a475f9',
    brightCyan: '#3192aa',
    brightWhite: '#8c959f'
  },
  darkTerminal: {
    foreground: '#e6edf3',
    black: '#484f58',
    red: '#ff7b72',
    green: '#3fb950',
    yellow: '#d29922',
    blue: '#58a6ff',
    magenta: '#bc8cff',
    cyan: '#39c5cf',
    white: '#b1bac4',
    brightBlack: '#6e7681',
    brightRed: '#ffa198',
    brightGreen: '#56d364',
    brightYellow: '#e3b341',
    brightBlue: '#79c0ff',
    brightMagenta: '#d2a8ff',
    brightCyan: '#56d4dd',
    brightWhite: '#ffffff'
  }
}

/** Catppuccin — Latte in light, Mocha in dark (Catppuccin.catppuccin-vsc). */
export const catppuccinTheme: DesktopTheme = {
  name: 'catppuccin',
  label: 'Catppuccin',
  description: 'Soothing pastels — Latte and Mocha',
  colors: {
    background: '#eff1f5',
    foreground: '#4c4f69',
    card: '#e6e9ef',
    cardForeground: '#4c4f69',
    muted: '#e8ebef',
    mutedForeground: '#4c4f69',
    popover: '#e6e9ef',
    popoverForeground: '#4c4f69',
    primary: '#6d2ebf',
    primaryForeground: '#ffffff',
    secondary: '#ddd6ed',
    secondaryForeground: '#4c4f69',
    accent: '#dfdaef',
    accentForeground: '#4c4f69',
    border: '#acb0be',
    input: '#ccd0da',
    ring: '#6d2ebf',
    midground: '#6d2ebf',
    midgroundForeground: '#ffffff',
    composerRing: '#6d2ebf',
    destructive: '#d20f39',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#e6e9ef',
    sidebarBorder: '#acb0be',
    userBubble: '#d7d3e9',
    userBubbleBorder: '#acb0be'
  },
  darkColors: {
    background: '#1e1e2e',
    foreground: '#cdd6f4',
    card: '#181825',
    cardForeground: '#cdd6f4',
    muted: '#29293a',
    mutedForeground: '#cdd6f4',
    popover: '#181825',
    popoverForeground: '#cdd6f4',
    primary: '#cba6f7',
    primaryForeground: '#ffffff',
    secondary: '#4e4466',
    secondaryForeground: '#cdd6f4',
    accent: '#3d3652',
    accentForeground: '#cdd6f4',
    border: '#585b70',
    input: '#313244',
    ring: '#cba6f7',
    midground: '#cba6f7',
    midgroundForeground: '#ffffff',
    composerRing: '#cba6f7',
    destructive: '#f38ba8',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#181825',
    sidebarBorder: '#585b70',
    userBubble: '#38324b',
    userBubbleBorder: '#585b70'
  },
  terminal: {
    foreground: '#4c4f69',
    cursor: '#dc8a78',
    selectionBackground: '#acb0be',
    black: '#5c5f77',
    red: '#d20f39',
    green: '#40a02b',
    yellow: '#df8e1d',
    blue: '#1e66f5',
    magenta: '#ea76cb',
    cyan: '#179299',
    white: '#acb0be',
    brightBlack: '#6c6f85',
    brightRed: '#de293e',
    brightGreen: '#49af3d',
    brightYellow: '#eea02d',
    brightBlue: '#456eff',
    brightMagenta: '#fe85d8',
    brightCyan: '#2d9fa8',
    brightWhite: '#bcc0cc'
  },
  darkTerminal: {
    foreground: '#cdd6f4',
    cursor: '#f5e0dc',
    selectionBackground: '#585b70',
    black: '#45475a',
    red: '#f38ba8',
    green: '#a6e3a1',
    yellow: '#f9e2af',
    blue: '#89b4fa',
    magenta: '#f5c2e7',
    cyan: '#94e2d5',
    white: '#a6adc8',
    brightBlack: '#585b70',
    brightRed: '#f37799',
    brightGreen: '#89d88b',
    brightYellow: '#ebd391',
    brightBlue: '#74a8fc',
    brightMagenta: '#f2aede',
    brightCyan: '#6bd7ca',
    brightWhite: '#bac2de'
  }
}

/** Everforest — warm, low-contrast forest greens (sainnhe.everforest). */
export const everforestTheme: DesktopTheme = {
  name: 'everforest',
  label: 'Everforest',
  description: 'Warm, low-contrast forest greens',
  colors: {
    background: '#fdf6e3',
    foreground: '#5c6a72',
    card: '#fdf6e3',
    cardForeground: '#5c6a72',
    muted: '#f7f0de',
    mutedForeground: '#939f91',
    popover: '#fdf6e3',
    popoverForeground: '#5c6a72',
    primary: '#586b35',
    primaryForeground: '#ffffff',
    secondary: '#e6e3cb',
    secondaryForeground: '#5c6a72',
    accent: '#e9e5ce',
    accentForeground: '#5c6a72',
    border: '#fdf6e3',
    input: '#fdf6e3',
    ring: '#586b35',
    midground: '#586b35',
    midgroundForeground: '#ffffff',
    composerRing: '#586b35',
    destructive: '#f1706f',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#fdf6e3',
    sidebarBorder: '#fdf6e3',
    userBubble: '#e9e5ce',
    userBubbleBorder: '#fdf6e3'
  },
  darkColors: {
    background: '#2d353b',
    foreground: '#d3c6aa',
    card: '#2d353b',
    cardForeground: '#d3c6aa',
    muted: '#373e42',
    mutedForeground: '#859289',
    popover: '#2d353b',
    popoverForeground: '#d3c6aa',
    primary: '#a7c080',
    primaryForeground: '#ffffff',
    secondary: '#4f5c4e',
    secondaryForeground: '#d3c6aa',
    accent: '#434e47',
    accentForeground: '#d3c6aa',
    border: '#2d353b',
    input: '#2d353b',
    ring: '#a7c080',
    midground: '#a7c080',
    midgroundForeground: '#ffffff',
    composerRing: '#a7c080',
    destructive: '#da6362',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#2d353b',
    sidebarBorder: '#2d353b',
    userBubble: '#434e47',
    userBubbleBorder: '#2d353b'
  },
  terminal: {
    foreground: '#5c6a72',
    cursor: '#5c6a72',
    black: '#5c6a72',
    red: '#f85552',
    green: '#8da101',
    yellow: '#dfa000',
    blue: '#3a94c5',
    magenta: '#df69ba',
    cyan: '#35a77c',
    white: '#939f91',
    brightBlack: '#5c6a72',
    brightRed: '#f85552',
    brightGreen: '#8da101',
    brightYellow: '#dfa000',
    brightBlue: '#3a94c5',
    brightMagenta: '#df69ba',
    brightCyan: '#35a77c',
    brightWhite: '#f4f0d9'
  },
  darkTerminal: {
    foreground: '#d3c6aa',
    cursor: '#d3c6aa',
    black: '#343f44',
    red: '#e67e80',
    green: '#a7c080',
    yellow: '#dbbc7f',
    blue: '#7fbbb3',
    magenta: '#d699b6',
    cyan: '#83c092',
    white: '#d3c6aa',
    brightBlack: '#859289',
    brightRed: '#e67e80',
    brightGreen: '#a7c080',
    brightYellow: '#dbbc7f',
    brightBlue: '#7fbbb3',
    brightMagenta: '#d699b6',
    brightCyan: '#83c092',
    brightWhite: '#d3c6aa'
  }
}

/** Solarized — Ethan Schoonover's fixed-contrast pair (ryanolsonx.solarized). */
export const solarizedTheme: DesktopTheme = {
  name: 'solarized',
  label: 'Solarized',
  description: 'Fixed-contrast light and dark',
  colors: {
    background: '#fdf6e3',
    foreground: '#1f1f1f',
    card: '#d3cbb7',
    cardForeground: '#1f1f1f',
    muted: '#f4eddb',
    mutedForeground: '#9ca8a6',
    popover: '#eee8d5',
    popoverForeground: '#1f1f1f',
    primary: '#675e34',
    primaryForeground: '#ffffff',
    secondary: '#e8e1cb',
    secondaryForeground: '#1f1f1f',
    accent: '#ebe4ce',
    accentForeground: '#1f1f1f',
    border: '#ddd6c1',
    input: '#ddd6c1',
    ring: '#675e34',
    midground: '#675e34',
    midgroundForeground: '#ffffff',
    composerRing: '#675e34',
    destructive: '#e25563',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#eee8d5',
    sidebarBorder: '#ddd6c1',
    userBubble: '#c6bea7',
    userBubbleBorder: '#ddd6c1'
  },
  darkColors: {
    background: '#002b36',
    foreground: '#839496',
    card: '#002b36',
    cardForeground: '#839496',
    muted: '#08313c',
    mutedForeground: '#586e75',
    popover: '#001f26',
    popoverForeground: '#839496',
    primary: '#6ea1c4',
    primaryForeground: '#ffffff',
    secondary: '#1f4c5e',
    secondaryForeground: '#839496',
    accent: '#144050',
    accentForeground: '#839496',
    border: '#234751',
    input: '#073642',
    ring: '#6ea1c4',
    midground: '#6ea1c4',
    midgroundForeground: '#ffffff',
    composerRing: '#6ea1c4',
    destructive: '#e35957',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#001f26',
    sidebarBorder: '#234751',
    userBubble: '#144050',
    userBubbleBorder: '#234751'
  },
  terminal: {
    foreground: '#657b83',
    black: '#657b83',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#657b83',
    brightRed: '#cb4b16',
    brightGreen: '#859900',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#eee8d5'
  },
  darkTerminal: {
    foreground: '#839496',
    cursor: '#ffffff',
    selectionBackground: '#ffffff40',
    black: '#14181d',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#e5e5e5',
    brightBlack: '#676767',
    brightRed: '#dc322f',
    brightGreen: '#859900',
    brightYellow: '#b58900',
    brightBlue: '#268bd2',
    brightMagenta: '#d33682',
    brightCyan: '#2aa198',
    brightWhite: '#e5e5e5'
  }
}

const NOUS_ALT_BLUE = '#0053FD'
const NOUS_ALT_NAVY = '#1540B1'
const NOUS_ALT_CREAM = '#FFE6CB'

const nousAltTint = (pct: number) => `color-mix(in srgb, ${NOUS_ALT_BLUE} ${pct}%, #FFFFFF)`
const nousAltTintTransparent = (pct: number) => `color-mix(in srgb, ${NOUS_ALT_BLUE} ${pct}%, transparent)`

/**
 * PoorMad Alt — the hand-authored PoorMad from before the GitHub fork. Light is
 * glass neutrals with brand blue; dark is cream on mission-blue.
 */
export const nousAltTheme: DesktopTheme = {
  name: 'nous-alt',
  label: 'PoorMad Alt',
  description: 'Glass neutrals, cream on mission-blue',
  colors: {
    background: '#F8FAFF',
    foreground: '#17171A',
    card: '#FFFFFF',
    cardForeground: '#17171A',
    muted: nousAltTint(5),
    mutedForeground: '#666678',
    popover: '#FFFFFF',
    popoverForeground: '#17171A',
    primary: NOUS_ALT_BLUE,
    primaryForeground: '#FCFCFC',
    secondary: nousAltTint(7),
    secondaryForeground: '#242432',
    accent: nousAltTint(10),
    accentForeground: '#202030',
    border: nousAltTintTransparent(22),
    input: nousAltTintTransparent(30),
    ring: NOUS_ALT_BLUE,
    midground: NOUS_ALT_BLUE,
    composerRing: NOUS_ALT_BLUE,
    destructive: '#C72E4D',
    destructiveForeground: '#FFFFFF',
    sidebarBackground: '#F3F7FF',
    sidebarBorder: nousAltTintTransparent(18),
    userBubble: nousAltTint(6),
    userBubbleBorder: nousAltTintTransparent(24)
  },
  darkColors: {
    background: '#0D2F86',
    foreground: NOUS_ALT_CREAM,
    card: '#12378F',
    cardForeground: NOUS_ALT_CREAM,
    muted: '#183F9A',
    mutedForeground: '#B5C7F3',
    popover: '#123A96',
    popoverForeground: NOUS_ALT_CREAM,
    primary: NOUS_ALT_CREAM,
    primaryForeground: '#0D2F86',
    secondary: '#1B45A4',
    secondaryForeground: '#E0E8FF',
    accent: NOUS_ALT_NAVY,
    accentForeground: '#F0F4FF',
    border: '#3158AD',
    input: '#0B2566',
    ring: NOUS_ALT_CREAM,
    midground: NOUS_ALT_BLUE,
    composerRing: NOUS_ALT_CREAM,
    destructive: '#C0473A',
    destructiveForeground: '#FEF2F2',
    sidebarBackground: '#09286F',
    sidebarBorder: '#234A9C',
    userBubble: '#143B91',
    userBubbleBorder: '#3A63BD'
  },
  typography: {
    fontSans: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap'
  }
}

/**
 * Midnight — deep blue-violet, near-monotone. Dark only: it has no light
 * palette because the whole idea is the dark end of the spectrum.
 */
export const midnightTheme: DesktopTheme = {
  name: 'midnight',
  label: 'Midnight',
  description: 'Deep blue-violet with cool accents',
  colors: {
    background: '#08081c',
    foreground: '#ddd6ff',
    card: '#0d0d28',
    cardForeground: '#ddd6ff',
    muted: '#13133a',
    mutedForeground: '#7c7ab0',
    popover: '#0f0f2e',
    popoverForeground: '#ddd6ff',
    primary: '#ddd6ff',
    primaryForeground: '#08081c',
    secondary: '#1a1a4a',
    secondaryForeground: '#c4bff0',
    accent: '#1a1a44',
    accentForeground: '#d0c8ff',
    border: '#1e1e52',
    input: '#1e1e52',
    ring: '#8b80e8',
    midground: '#8b80e8',
    destructive: '#b03060',
    destructiveForeground: '#fef2f2',
    sidebarBackground: '#06061a',
    sidebarBorder: '#12123a',
    userBubble: '#14143a',
    userBubbleBorder: '#242466'
  },
  typography: {
    fontMono: `"JetBrains Mono", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap'
  }
}

export const emberTheme: DesktopTheme = {
  name: 'ember',
  label: 'Ember',
  description: 'Warm crimson and bronze — forge vibes',
  colors: {
    background: '#160800',
    foreground: '#ffd8b0',
    card: '#1e0e04',
    cardForeground: '#ffd8b0',
    muted: '#2a1408',
    mutedForeground: '#aa7a56',
    popover: '#221008',
    popoverForeground: '#ffd8b0',
    primary: '#ffd8b0',
    primaryForeground: '#160800',
    secondary: '#341800',
    secondaryForeground: '#f0c090',
    accent: '#301600',
    accentForeground: '#e8c080',
    border: '#3a1c08',
    input: '#3a1c08',
    ring: '#d97316',
    midground: '#d97316',
    destructive: '#c43010',
    destructiveForeground: '#fef2f2',
    sidebarBackground: '#100600',
    sidebarBorder: '#2a1004',
    userBubble: '#2a1000',
    userBubbleBorder: '#4a2010'
  },
  typography: {
    fontMono: `"IBM Plex Mono", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap'
  }
}

/** Clean grayscale. Matches the CLI mono skin and dashboard mono theme. */
export const monoTheme: DesktopTheme = {
  name: 'mono',
  label: 'Mono',
  description: 'Clean grayscale — minimal and focused',
  colors: {
    background: '#0e0e0e',
    foreground: '#eaeaea',
    card: '#141414',
    cardForeground: '#eaeaea',
    muted: '#1e1e1e',
    mutedForeground: '#808080',
    popover: '#181818',
    popoverForeground: '#eaeaea',
    primary: '#eaeaea',
    primaryForeground: '#0e0e0e',
    secondary: '#262626',
    secondaryForeground: '#c8c8c8',
    accent: '#222222',
    accentForeground: '#d8d8d8',
    border: '#2a2a2a',
    input: '#2a2a2a',
    ring: '#9a9a9a',
    midground: '#9a9a9a',
    destructive: '#a84040',
    destructiveForeground: '#fef2f2',
    sidebarBackground: '#0a0a0a',
    sidebarBorder: '#202020',
    userBubble: '#1a1a1a',
    userBubbleBorder: '#363636'
  }
}

/** Neon green on black. Matches the CLI cyberpunk skin and dashboard theme. */
export const cyberpunkTheme: DesktopTheme = {
  name: 'cyberpunk',
  label: 'Cyberpunk',
  description: 'Neon green on black — matrix terminal',
  colors: {
    background: '#000a00',
    foreground: '#00ff41',
    card: '#001200',
    cardForeground: '#00ff41',
    muted: '#001a00',
    mutedForeground: '#1a8a30',
    popover: '#001000',
    popoverForeground: '#00ff41',
    primary: '#00ff41',
    primaryForeground: '#000a00',
    secondary: '#002800',
    secondaryForeground: '#00cc34',
    accent: '#002000',
    accentForeground: '#00e038',
    border: '#003000',
    input: '#003000',
    ring: '#00ff41',
    midground: '#00ff41',
    destructive: '#ff003c',
    destructiveForeground: '#000a00',
    sidebarBackground: '#000600',
    sidebarBorder: '#001800',
    userBubble: '#001400',
    userBubbleBorder: '#004800'
  },
  typography: {
    fontMono: `"Courier New", Courier, monospace, ${EMOJI_FALLBACK}`,
    fontSans: `"Courier New", Courier, monospace, ${EMOJI_FALLBACK}`
  }
}

/** Cool slate blue for developers. Matches the CLI slate skin. */
export const slateTheme: DesktopTheme = {
  name: 'slate',
  label: 'Slate',
  description: 'Cool slate blue — focused developer theme',
  colors: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    card: '#161b22',
    cardForeground: '#c9d1d9',
    muted: '#21262d',
    mutedForeground: '#8b949e',
    popover: '#1c2128',
    popoverForeground: '#c9d1d9',
    primary: '#c9d1d9',
    primaryForeground: '#0d1117',
    secondary: '#2a3038',
    secondaryForeground: '#adb5bf',
    accent: '#1e2530',
    accentForeground: '#c0c8d0',
    border: '#30363d',
    input: '#30363d',
    ring: '#58a6ff',
    midground: '#58a6ff',
    destructive: '#cf4848',
    destructiveForeground: '#fef2f2',
    sidebarBackground: '#090d13',
    sidebarBorder: '#1c2228',
    userBubble: '#1e2a38',
    userBubbleBorder: '#2e4060'
  },
  typography: {
    fontMono: `"JetBrains Mono", ${SYSTEM_MONO}`
  }
}

/**
 * MONO-HUE THEME FAMILY
 * Each theme is mono-hue: one dominant accent hue over a neutral surface
 * ladder (like Hermes). No second competing hue — the accent tints every
 * semantic token, neutrals carry the rest. Each ships its own matching
 * font (loaded via `typography.fontUrl`) and a unique app title.
 */

/** J.A.R.V.I.S. — mono-hue cyan, arc-reactor calm. */
export const jarvisTheme: DesktopTheme = {
  name: 'jarvis',
  label: 'J.A.R.V.I.S.',
  description: 'Mono-hue cyan HUD — arc-reactor calm',
  title: 'J.A.R.V.I.S.',
  colors: {
    background: '#02101e',
    foreground: '#cfeaff',
    card: '#04182c',
    cardForeground: '#cfeaff',
    muted: '#06283f',
    mutedForeground: '#7fb6e6',
    popover: '#04233f',
    popoverForeground: '#cfeaff',
    primary: '#36c5f0',
    primaryForeground: '#02101e',
    secondary: '#062a4a',
    secondaryForeground: '#cfeaff',
    accent: '#06304f',
    accentForeground: '#7fd8f5',
    border: '#0a3a63',
    input: '#0a3a63',
    ring: '#36c5f0',
    midground: '#36c5f0',
    midgroundForeground: '#02101e',
    composerRing: '#36c5f0',
    destructive: '#e8779a',
    destructiveForeground: '#02101e',
    sidebarBackground: '#03182b',
    sidebarBorder: '#0a3a63',
    userBubble: '#06283f',
    userBubbleBorder: '#0a3a63'
  },
  typography: {
    fontSans: `"Rajdhani", ${SYSTEM_SANS}`,
    fontMono: `"Share Tech Mono", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Share+Tech+Mono&display=swap'
  }
}

/** STARK OS — mono-hue amber, repulsor heat. */
export const ironmanTheme: DesktopTheme = {
  name: 'ironman',
  label: 'STARK OS',
  description: 'Mono-hue amber HUD — repulsor heat',
  title: 'STARK OS',
  colors: {
    background: '#1a0d05',
    foreground: '#ffd9a8',
    card: '#241207',
    cardForeground: '#ffd9a8',
    muted: '#341c0a',
    mutedForeground: '#e0a766',
    popover: '#2b1608',
    popoverForeground: '#ffd9a8',
    primary: '#ff7a18',
    primaryForeground: '#1a0d05',
    secondary: '#341c0a',
    secondaryForeground: '#ffd9a8',
    accent: '#3a1d08',
    accentForeground: '#ffb86b',
    border: '#4a2a0e',
    input: '#4a2a0e',
    ring: '#ff7a18',
    midground: '#ff7a18',
    midgroundForeground: '#1a0d05',
    composerRing: '#ff7a18',
    destructive: '#e87b6b',
    destructiveForeground: '#1a0d05',
    sidebarBackground: '#231207',
    sidebarBorder: '#4a2a0e',
    userBubble: '#341c0a',
    userBubbleBorder: '#4a2a0e'
  },
  typography: {
    fontSans: `"Chakra Petch", ${SYSTEM_SANS}`,
    fontMono: `"Oxanium", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&family=Oxanium:wght@500;700&display=swap'
  }
}

/** AETHER-9 — mono-hue teal, orbital clean. */
export const scifiTheme: DesktopTheme = {
  name: 'scifi',
  label: 'AETHER-9',
  description: 'Mono-hue teal — orbital clean',
  title: 'AETHER-9',
  colors: {
    background: '#04140f',
    foreground: '#bff5dc',
    card: '#072018',
    cardForeground: '#bff5dc',
    muted: '#0a3427',
    mutedForeground: '#7fd6b3',
    popover: '#082a1f',
    popoverForeground: '#bff5dc',
    primary: '#2dd4a7',
    primaryForeground: '#04140f',
    secondary: '#0a3427',
    secondaryForeground: '#bff5dc',
    accent: '#08392b',
    accentForeground: '#7fe6c8',
    border: '#0f4734',
    input: '#0f4734',
    ring: '#2dd4a7',
    midground: '#2dd4a7',
    midgroundForeground: '#04140f',
    composerRing: '#2dd4a7',
    destructive: '#e89a9a',
    destructiveForeground: '#04140f',
    sidebarBackground: '#052016',
    sidebarBorder: '#0f4734',
    userBubble: '#0a3427',
    userBubbleBorder: '#0f4734'
  },
  typography: {
    fontSans: `"Rajdhani", ${SYSTEM_SANS}`,
    fontMono: `"Share Tech Mono", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Share+Tech+Mono&display=swap'
  }
}

/** NIGHT CITY — mono-hue magenta, neon-noir. (Cyan/magenta duotone dropped for mono-hue.) */
export const cyberpunkThemeMono: DesktopTheme = {
  name: 'cyberpunk',
  label: 'NIGHT CITY',
  description: 'Mono-hue magenta — neon-noir',
  title: 'NIGHT CITY',
  colors: {
    background: '#0a0612',
    foreground: '#f7d9ff',
    card: '#120a1f',
    cardForeground: '#f7d9ff',
    muted: '#1d1230',
    mutedForeground: '#c79bdd',
    popover: '#160d24',
    popoverForeground: '#f7d9ff',
    primary: '#ff2d9b',
    primaryForeground: '#0a0612',
    secondary: '#1d1230',
    secondaryForeground: '#f7d9ff',
    accent: '#240f3a',
    accentForeground: '#ff8fc8',
    border: '#2a1845',
    input: '#2a1845',
    ring: '#ff2d9b',
    midground: '#ff2d9b',
    midgroundForeground: '#0a0612',
    composerRing: '#ff2d9b',
    destructive: '#ff6b9a',
    destructiveForeground: '#0a0612',
    sidebarBackground: '#0e0820',
    sidebarBorder: '#2a1845',
    userBubble: '#1d1230',
    userBubbleBorder: '#2a1845'
  },
  typography: {
    fontSans: `"Oxanium", ${SYSTEM_SANS}`,
    fontMono: `"Share Tech Mono", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Oxanium:wght@500;700&family=Share+Tech+Mono&display=swap'
  }
}

/** LUMEN — mono-hue violet, ethereal glow. */
export const neonTheme: DesktopTheme = {
  name: 'neon',
  label: 'LUMEN',
  description: 'Mono-hue violet — ethereal glow',
  title: 'LUMEN',
  colors: {
    background: '#04030a',
    foreground: '#e8e0ff',
    card: '#0a0814',
    cardForeground: '#e8e0ff',
    muted: '#120f24',
    mutedForeground: '#b3a4e6',
    popover: '#0d0a1c',
    popoverForeground: '#e8e0ff',
    primary: '#b14bff',
    primaryForeground: '#04030a',
    secondary: '#120f24',
    secondaryForeground: '#e8e0ff',
    accent: '#1a0f33',
    accentForeground: '#d3a8ff',
    border: '#211a3d',
    input: '#211a3d',
    ring: '#b14bff',
    midground: '#b14bff',
    midgroundForeground: '#04030a',
    composerRing: '#b14bff',
    destructive: '#e89a9a',
    destructiveForeground: '#04030a',
    sidebarBackground: '#080614',
    sidebarBorder: '#211a3d',
    userBubble: '#120f24',
    userBubbleBorder: '#211a3d'
  },
  typography: {
    fontSans: `"Oxanium", ${SYSTEM_SANS}`,
    fontMono: `"Fira Code", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Oxanium:wght@500;700&family=Fira+Code:wght@400;600&display=swap'
  }
}

/** UNIT-7 — mono-hue steel-teal, robotic standby. */
export const roboticTheme: DesktopTheme = {
  name: 'robotic',
  label: 'UNIT-7',
  description: 'Mono-hue steel-teal — robotic',
  title: 'UNIT-7',
  colors: {
    background: '#0c0f12',
    foreground: '#c9d4dc',
    card: '#13171b',
    cardForeground: '#c9d4dc',
    muted: '#1e242a',
    mutedForeground: '#8a99a6',
    popover: '#171c20',
    popoverForeground: '#c9d4dc',
    primary: '#5ad1c4',
    primaryForeground: '#0c0f12',
    secondary: '#1e242a',
    secondaryForeground: '#c9d4dc',
    accent: '#112420',
    accentForeground: '#8fe6dc',
    border: '#2a323a',
    input: '#2a323a',
    ring: '#5ad1c4',
    midground: '#5ad1c4',
    midgroundForeground: '#0c0f12',
    composerRing: '#5ad1c4',
    destructive: '#e89a9a',
    destructiveForeground: '#0c0f12',
    sidebarBackground: '#101417',
    sidebarBorder: '#2a323a',
    userBubble: '#1e242a',
    userBubbleBorder: '#2a323a'
  },
  typography: {
    fontSans: `"Chakra Petch", ${SYSTEM_SANS}`,
    fontMono: `"IBM Plex Mono", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap'
  }
}

/** POORMAD PIXEL — mono-hue violet, 8-bit mascot. */
export const pixelTheme: DesktopTheme = {
  name: 'pixel',
  label: 'POORMAD',
  description: 'Mono-hue violet — 8-bit mascot',
  title: 'POORMAD',
  colors: {
    background: '#0c0a16',
    foreground: '#ece9fb',
    card: '#14111f',
    cardForeground: '#ece9fb',
    muted: '#1b1730',
    mutedForeground: '#b3a9d6',
    popover: '#1b1730',
    popoverForeground: '#ece9fb',
    primary: '#8b5cf6',
    primaryForeground: '#0c0a16',
    secondary: '#1b1730',
    secondaryForeground: '#ece9fb',
    accent: '#1f1535',
    accentForeground: '#c4b5fd',
    border: '#2c2647',
    input: '#2c2647',
    ring: '#8b5cf6',
    midground: '#8b5cf6',
    midgroundForeground: '#0c0a16',
    composerRing: '#8b5cf6',
    destructive: '#e8779a',
    destructiveForeground: '#0c0a16',
    sidebarBackground: '#100d1c',
    sidebarBorder: '#2c2647',
    userBubble: '#1b1730',
    userBubbleBorder: '#2c2647'
  },
  typography: {
    fontSans: `"Press Start 2P", ${SYSTEM_SANS}`,
    fontMono: `"Press Start 2P", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
  }
}

/** VANGUARD — mono-hue gold, heroic. */
export const heroicTheme: DesktopTheme = {
  name: 'heroic',
  label: 'VANGUARD',
  description: 'Mono-hue gold — heroic',
  title: 'VANGUARD',
  colors: {
    background: '#0a0712',
    foreground: '#f3e9ff',
    card: '#140d22',
    cardForeground: '#f3e9ff',
    muted: '#1a1130',
    mutedForeground: '#c4a8e6',
    popover: '#1a1130',
    popoverForeground: '#f3e9ff',
    primary: '#ffd23f',
    primaryForeground: '#0a0712',
    secondary: '#1a1130',
    secondaryForeground: '#f3e9ff',
    accent: '#261a40',
    accentForeground: '#ffe18a',
    border: '#33245c',
    input: '#33245c',
    ring: '#ffd23f',
    midground: '#ffd23f',
    midgroundForeground: '#0a0712',
    composerRing: '#ffd23f',
    destructive: '#e89a9a',
    destructiveForeground: '#0a0712',
    sidebarBackground: '#0c0818',
    sidebarBorder: '#33245c',
    userBubble: '#1a1130',
    userBubbleBorder: '#33245c'
  },
  typography: {
    fontSans: `"Rajdhani", ${SYSTEM_SANS}`,
    fontMono: `"Oxanium", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Oxanium:wght@500;700&display=swap'
  }
}

/**
 * PoorMad Dark — the canonical PoorMad desktop identity. Space-black surface
 * with a violet/lavender nebula accent and the pixel-moon brand. Hand-tuned
 * (not the naive CLI-skin auto-convert) so the GUI reads as a first-class
 * product, distinct from the upstream Hermes/nous GitHub-fork look.
 */
export const poormadDarkTheme: DesktopTheme = {
  name: 'poormad-dark',
  label: 'PoorMad Dark',
  description: 'Space-black with violet nebula accent — the PoorMad house theme',
  title: 'PoorMad',
  colors: {
    background: '#0a0a0f',
    foreground: '#e5e0f0',
    card: '#12111c',
    cardForeground: '#e5e0f0',
    muted: '#16141f',
    mutedForeground: '#8f899e',
    popover: '#12111c',
    popoverForeground: '#e5e0f0',
    primary: '#8b5cf6',
    primaryForeground: '#0a0a0f',
    secondary: '#1c1830',
    secondaryForeground: '#c4b5fd',
    accent: '#1f1535',
    accentForeground: '#c4b5fd',
    border: '#1e1b2e',
    input: '#1e1b2e',
    ring: '#8b5cf6',
    midground: '#8b5cf6',
    midgroundForeground: '#0a0a0f',
    composerRing: '#8b5cf6',
    destructive: '#f87171',
    destructiveForeground: '#0a0a0f',
    sidebarBackground: '#0c0b12',
    sidebarBorder: '#1e1b2e',
    userBubble: '#1a1230',
    userBubbleBorder: '#2a1f47'
  },
  typography: {
    fontSans: `"Inter", ${SYSTEM_SANS}`,
    fontMono: `"JetBrains Mono", ${SYSTEM_MONO}`,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
  }
}

export const BUILTIN_THEMES: Record<string, DesktopTheme> = {
  'poormad-dark': poormadDarkTheme,
  nous: nousTheme,
  github: githubTheme,
  catppuccin: catppuccinTheme,
  everforest: everforestTheme,
  solarized: solarizedTheme,
  'nous-alt': nousAltTheme,
  midnight: midnightTheme,
  ember: emberTheme,
  mono: monoTheme,
  slate: slateTheme,
  cyberpunk: cyberpunkThemeMono,
  jarvis: jarvisTheme,
  ironman: ironmanTheme,
  scifi: scifiTheme,
  neon: neonTheme,
  robotic: roboticTheme,
  pixel: pixelTheme,
  heroic: heroicTheme
}

export const BUILTIN_THEME_LIST = Object.values(BUILTIN_THEMES)

/** Skin used when nothing is persisted or the persisted name is retired. */
export const DEFAULT_SKIN_NAME = 'poormad-dark'
