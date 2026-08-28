import { contextBridge, ipcRenderer, webFrame, webUtils } from 'electron'

// Which translucency the OS can back. Asked synchronously because the renderer
// needs it before its first paint, and answered by main because deciding it
// needs `os.release()` — a sandboxed preload may only require electron, events,
// timers and url, so importing node:os here throws before contextBridge runs
// and takes the ENTIRE bridge down with it (window.poormadDesktop undefined =>
// "Desktop IPC bridge is unavailable"). No reply means no glass, which degrades
// to an ordinary opaque window rather than a page thinned over nothing.
const translucencySupport = ipcRenderer.sendSync('poormad:translucency:support')
const hudWindowing = ipcRenderer.sendSync('poormad:hud:windowing')
const hudNativeDrag = hudWindowing?.nativeDrag === true

contextBridge.exposeInMainWorld('poormadDesktop', {
  glassSupported: translucencySupport?.glass === true,
  translucencySupported: translucencySupport?.translucency === true,
  getConnection: profile => ipcRenderer.invoke('poormad:connection', profile),
  // Registry-scoped backend resolution: { connectionId, profile } → descriptor.
  getConnectionFor: payload => ipcRenderer.invoke('poormad:connection:for', payload),
  getProfileRoutes: profiles => ipcRenderer.invoke('poormad:plugin-profile-routes', profiles),
  revalidateConnection: () => ipcRenderer.invoke('poormad:connection:revalidate'),
  touchBackend: profile => ipcRenderer.invoke('poormad:backend:touch', profile),
  getGatewayWsUrl: profile => ipcRenderer.invoke('poormad:gateway:ws-url', profile),
  // Registry-scoped fresh WS URL: { connectionId, profile } → result shape of
  // getGatewayWsUrl, minted against that connection's backend.
  getGatewayWsUrlFor: payload => ipcRenderer.invoke('poormad:gateway:ws-url-for', payload),
  // Union agent roster across every registered connection.
  getAgentRoster: () => ipcRenderer.invoke('poormad:agents:roster'),
  openSessionWindow: (sessionId, opts) => ipcRenderer.invoke('poormad:window:openSession', sessionId, opts),
  openSessionInTerminal: (sessionId, opts) => ipcRenderer.invoke('poormad:window:openInTerminal', sessionId, opts),
  openWindow: () => ipcRenderer.invoke('poormad:window:openInstance'),
  openBrowserWindow: tabId => ipcRenderer.invoke('poormad:window:openBrowser', tabId),
  onBrowserPopoutClosed: callback => {
    const listener = (_event, tabId) => callback(tabId)
    ipcRenderer.on('poormad:browser-popout:closed', listener)

    return () => ipcRenderer.removeListener('poormad:browser-popout:closed', listener)
  },
  claimAmbientCue: key => ipcRenderer.invoke('poormad:ambient:claim', key),
  wakeIndicator: {
    getState: () => ipcRenderer.invoke('poormad:wake-indicator:get'),
    setState: state => ipcRenderer.send('poormad:wake-indicator:set', state),
    onState: callback => {
      const listener = (_event, state) => callback(state)
      ipcRenderer.on('poormad:wake-indicator:state', listener)

      return () => ipcRenderer.removeListener('poormad:wake-indicator:state', listener)
    }
  },
  petOverlay: {
    // Main renderer → main process: window lifecycle + drag. `request` is
    // `{ bounds, screen }`; resolves with the screen bounds it actually used.
    open: request => ipcRenderer.invoke('poormad:pet-overlay:open', request),
    close: () => ipcRenderer.invoke('poormad:pet-overlay:close'),
    setBounds: bounds => ipcRenderer.send('poormad:pet-overlay:set-bounds', bounds),
    setIgnoreMouse: ignore => ipcRenderer.send('poormad:pet-overlay:ignore-mouse', ignore),
    // Flip the overlay focusable (and focus it) while the composer needs keys.
    setFocusable: focusable => ipcRenderer.send('poormad:pet-overlay:set-focusable', focusable),
    // Main renderer → overlay (forwarded by main): push the latest pet state.
    pushState: payload => ipcRenderer.send('poormad:pet-overlay:state', payload),
    // Overlay → main renderer (forwarded by main): pop back in / composer submit.
    control: payload => ipcRenderer.send('poormad:pet-overlay:control', payload),
    // Overlay subscribes to state pushes.
    onState: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('poormad:pet-overlay:state', listener)

      return () => ipcRenderer.removeListener('poormad:pet-overlay:state', listener)
    },
    // Main renderer subscribes to overlay control messages.
    onControl: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('poormad:pet-overlay:control', listener)

      return () => ipcRenderer.removeListener('poormad:pet-overlay:control', listener)
    }
  },
  // HUD mode: the chrome-free floating chat. A full app renderer (own gateway)
  // sized as a floating bar, so it mounts the real composer. Main owns the
  // window; `onChanged` keeps every window's toggle truthful.
  hud: {
    nativeDrag: hudNativeDrag,
    windowing: {
      clientPlacement: hudWindowing?.clientPlacement !== false,
      controlDrag: hudWindowing?.controlDrag === true,
      nativeDrag: hudNativeDrag,
      workspaceTransfer: hudWindowing?.workspaceTransfer === true
    },
    open: request => ipcRenderer.invoke('poormad:hud:open', request),
    close: () => ipcRenderer.invoke('poormad:hud:close'),
    setIgnoreMouse: ignore => ipcRenderer.send('poormad:hud:ignore-mouse', ignore),
    moveBy: delta => ipcRenderer.send('poormad:hud:move-by', delta),
    setWorkspaceTransfer: transferring => ipcRenderer.send('poormad:hud:workspace-transfer', transferring),
    setBounds: bounds => ipcRenderer.send('poormad:hud:set-bounds', bounds),
    resetLayout: () => ipcRenderer.invoke('poormad:hud:reset-layout'),
    // Whether the band covers the window below the bar. Main pairs it with the
    // user's translucency setting to decide the native frost (macOS vibrancy /
    // Windows 11 DWM backdrop) — see hudFrostFor.
    setFrost: showing => ipcRenderer.invoke('poormad:hud:frost', showing),
    // The HUD tells main which session it is on; main hands that back to the
    // app window when the HUD closes, so the app can re-home onto it.
    setSession: sessionId => ipcRenderer.send('poormad:hud:session', sessionId),
    onGoto: callback => {
      const listener = (_event, sessionId) => callback(sessionId)
      ipcRenderer.on('poormad:hud:goto', listener)

      return () => ipcRenderer.removeListener('poormad:hud:goto', listener)
    },
    onChanged: callback => {
      const listener = (_event, state) => callback(state)
      ipcRenderer.on('poormad:hud:changed', listener)

      return () => ipcRenderer.removeListener('poormad:hud:changed', listener)
    },
    // Linux only, and silent elsewhere: where the cursor is, in page
    // coordinates, or null when it has left the window. Stands in for the
    // mousemove that `setIgnoreMouseEvents(true, { forward: true })` delivers on
    // macOS and Windows but not here.
    onCursor: callback => {
      const listener = (_event, point) => callback(point)
      ipcRenderer.on('poormad:hud:cursor', listener)

      return () => ipcRenderer.removeListener('poormad:hud:cursor', listener)
    },
    // Main's game-overlay watch: whether a fullscreen app (a game) is under
    // the HUD, so the renderer can step back to the low-opacity overlay
    // treatment while one owns the screen.
    onGameOverlay: callback => {
      const listener = (_event, state) => callback(state)
      ipcRenderer.on('poormad:hud:game-overlay', listener)

      return () => ipcRenderer.removeListener('poormad:hud:game-overlay', listener)
    }
  },
  // Quick Entry: the global-hotkey mini composer window. Main owns the OS
  // shortcut + the persisted preference; the quick window only captures text
  // and hands it back, and the primary renderer submits it through the normal
  // prompt path.
  quickEntry: {
    getSettings: () => ipcRenderer.invoke('poormad:quick-entry:settings:get'),
    setSettings: patch => ipcRenderer.invoke('poormad:quick-entry:settings:set', patch),
    submit: payload => ipcRenderer.send('poormad:quick-entry:submit', payload),
    dismiss: () => ipcRenderer.send('poormad:quick-entry:dismiss'),
    // Primary renderer → main → quick window: gateway connection state + the
    // recent-session options the target picker offers. Main caches the latest
    // payload so a freshly spawned quick window starts from truth.
    pushState: payload => ipcRenderer.send('poormad:quick-entry:state', payload),
    // Quick window subscribes to those pushes.
    onState: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('poormad:quick-entry:state', listener)

      return () => ipcRenderer.removeListener('poormad:quick-entry:state', listener)
    },
    // Main → primary renderer: a submit captured by the quick window.
    onSubmit: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('poormad:quick-entry:submit', listener)

      return () => ipcRenderer.removeListener('poormad:quick-entry:submit', listener)
    },
    // Main → quick window: you were just summoned (reset draft + refocus).
    onShown: callback => {
      const listener = () => callback()
      ipcRenderer.on('poormad:quick-entry:shown', listener)

      return () => ipcRenderer.removeListener('poormad:quick-entry:shown', listener)
    }
  },
  getBootProgress: () => ipcRenderer.invoke('poormad:boot-progress:get'),
  getConnectionConfig: profile => ipcRenderer.invoke('poormad:connection-config:get', profile),
  saveConnectionConfig: payload => ipcRenderer.invoke('poormad:connection-config:save', payload),
  applyConnectionConfig: payload => ipcRenderer.invoke('poormad:connection-config:apply', payload),
  testConnectionConfig: payload => ipcRenderer.invoke('poormad:connection-config:test', payload),
  // Opt-in OS-keychain encryption for stored gateway secrets (default off —
  // see secret-storage-policy.ts). get never touches the OS keychain.
  getSecretStorageEncryption: () => ipcRenderer.invoke('poormad:secret-storage:get'),
  setSecretStorageEncryption: (on: boolean) => ipcRenderer.invoke('poormad:secret-storage:set', on),
  // v2 multi-connection registry: named agent sources (local / remote / cloud / ssh).
  connections: {
    list: () => ipcRenderer.invoke('poormad:connections:list'),
    save: payload => ipcRenderer.invoke('poormad:connections:save', payload),
    remove: id => ipcRenderer.invoke('poormad:connections:remove', id),
    setPrimary: id => ipcRenderer.invoke('poormad:connections:set-primary', id),
    setLaunchMode: mode => ipcRenderer.invoke('poormad:connections:set-launch-mode', mode),
    setLastUsed: id => ipcRenderer.invoke('poormad:connections:set-last-used', id),
    test: id => ipcRenderer.invoke('poormad:connections:test', id),
    updateManaged: id => ipcRenderer.invoke('poormad:connections:update-managed', id),
    // Fan out `poormad update` to every eligible registered connection.
    // Optional excludeIds skips rows the caller updates through another path.
    updateAll: options => ipcRenderer.invoke('poormad:connections:update-all', options),
    // Registry lifecycle push (main → renderer): a connection was removed or
    // materially edited, so secondaries scoped to it must be disposed (and,
    // for edits, re-dialed at the new target).
    onChanged: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('poormad:connections:changed', listener)

      return () => ipcRenderer.removeListener('poormad:connections:changed', listener)
    }
  },
  sshConfigHosts: () => ipcRenderer.invoke('poormad:ssh-config:hosts'),
  sshResolveHost: host => ipcRenderer.invoke('poormad:ssh-config:resolve', host),
  probeConnectionConfig: remoteUrl => ipcRenderer.invoke('poormad:connection-config:probe', remoteUrl),
  oauthLoginConnectionConfig: remoteUrl => ipcRenderer.invoke('poormad:connection-config:oauth-login', remoteUrl),
  oauthLogoutConnectionConfig: remoteUrl => ipcRenderer.invoke('poormad:connection-config:oauth-logout', remoteUrl),
  // PoorMad Cloud: one portal login powers discovery + silent per-agent sign-in
  // (cloud-auto-discovery Phase 3).
  cloud: {
    status: () => ipcRenderer.invoke('poormad:cloud:status'),
    login: () => ipcRenderer.invoke('poormad:cloud:login'),
    logout: () => ipcRenderer.invoke('poormad:cloud:logout'),
    discover: org => ipcRenderer.invoke('poormad:cloud:discover', org),
    agentSignIn: dashboardUrl => ipcRenderer.invoke('poormad:cloud:agent-sign-in', dashboardUrl)
  },
  profile: {
    get: () => ipcRenderer.invoke('poormad:profile:get'),
    remember: name => ipcRenderer.invoke('poormad:profile:remember', name),
    set: name => ipcRenderer.invoke('poormad:profile:set', name)
  },
  api: request => ipcRenderer.invoke('poormad:api', request),
  notify: payload => ipcRenderer.invoke('poormad:notify', payload),
  requestMicrophoneAccess: () => ipcRenderer.invoke('poormad:requestMicrophoneAccess'),
  readWindowBelow: () => ipcRenderer.invoke('poormad:window:readBelow'),
  readFileDataUrl: filePath => ipcRenderer.invoke('poormad:readFileDataUrl', filePath),
  readFileDataUrlForAttach: filePath => ipcRenderer.invoke('poormad:readFileDataUrlForAttach', filePath),
  dataUrlReadMax: {
    get: () => ipcRenderer.invoke('poormad:data-url-read-max:get'),
    set: maxMb => ipcRenderer.invoke('poormad:data-url-read-max:set', maxMb)
  },
  readFileText: filePath => ipcRenderer.invoke('poormad:readFileText', filePath),
  readPluginSource: (filePath: string) => ipcRenderer.invoke('poormad:readPluginSource', filePath),
  selectPaths: options => ipcRenderer.invoke('poormad:selectPaths', options),
  selectSavePath: options => ipcRenderer.invoke('poormad:selectSavePath', options),
  writeClipboard: text => ipcRenderer.invoke('poormad:writeClipboard', text),
  readClipboard: () => ipcRenderer.invoke('poormad:readClipboard'),
  saveGatewayFile: payload => ipcRenderer.invoke('poormad:saveGatewayFile', payload),
  saveImageFromUrl: url => ipcRenderer.invoke('poormad:saveImageFromUrl', url),
  contextMenuEdit: command => ipcRenderer.invoke('poormad:context-menu:edit', command),
  contextMenuCopyImage: () => ipcRenderer.invoke('poormad:context-menu:copy-image'),
  contextMenuSpellcheck: action => ipcRenderer.invoke('poormad:context-menu:spellcheck', action),
  contextMenuGuestAddWord: payload => ipcRenderer.invoke('poormad:context-menu:guest-add-word', payload),
  onContextMenuSpellcheck: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:context-menu-spellcheck', listener)

    return () => ipcRenderer.removeListener('poormad:context-menu-spellcheck', listener)
  },
  saveImageBuffer: (data, ext) => ipcRenderer.invoke('poormad:saveImageBuffer', { data, ext }),
  saveClipboardImage: () => ipcRenderer.invoke('poormad:saveClipboardImage'),
  getPathForFile: file => {
    try {
      return webUtils.getPathForFile(file) || ''
    } catch {
      return ''
    }
  },
  normalizePreviewTarget: (target, baseDir) => ipcRenderer.invoke('poormad:normalizePreviewTarget', target, baseDir),
  watchPreviewFile: url => ipcRenderer.invoke('poormad:watchPreviewFile', url),
  watchDirectory: dir => ipcRenderer.invoke('poormad:watchDirectory', dir),
  stopPreviewFileWatch: id => ipcRenderer.invoke('poormad:stopPreviewFileWatch', id),
  setActiveWork: payload => ipcRenderer.send('poormad:active-work', payload),
  setTitleBarTheme: payload => ipcRenderer.send('poormad:titlebar-theme', payload),
  setNativeTheme: mode => ipcRenderer.send('poormad:native-theme', mode),
  setTranslucency: payload => ipcRenderer.send('poormad:translucency', payload),
  setKeepAwake: on => ipcRenderer.send('poormad:keep-awake', on),
  setDisableF12: blocked => ipcRenderer.send('poormad:devtools:disable-f12', blocked),
  setPreviewShortcutActive: active => ipcRenderer.send('poormad:previewShortcutActive', Boolean(active)),
  openExternal: url => ipcRenderer.invoke('poormad:openExternal', url),
  openPreviewInBrowser: url => ipcRenderer.invoke('poormad:openPreviewInBrowser', url),
  reachPreviewUrl: url => ipcRenderer.invoke('poormad:preview:reach', url),
  setActiveConnectionRoute: route => ipcRenderer.send('poormad:connection:active-route', route),
  fetchLinkTitle: url => ipcRenderer.invoke('poormad:fetchLinkTitle', url),
  resolveFavicon: url => ipcRenderer.invoke('poormad:resolveFavicon', url),
  sanitizeWorkspaceCwd: cwd => ipcRenderer.invoke('poormad:workspace:sanitize', cwd),
  settings: {
    getDefaultProjectDir: () => ipcRenderer.invoke('poormad:setting:defaultProjectDir:get'),
    setDefaultProjectDir: dir => ipcRenderer.invoke('poormad:setting:defaultProjectDir:set', dir),
    pickDefaultProjectDir: () => ipcRenderer.invoke('poormad:setting:defaultProjectDir:pick')
  },
  zoom: {
    // Current zoom of this window, as { level, percent }.
    get: () => ipcRenderer.invoke('poormad:zoom:get'),
    // Synchronous zoom factor (1 = 100%). Coordinate math needs it in the
    // same tick as the event it converts, so no IPC round-trip here.
    factor: () => webFrame.getZoomFactor(),
    setPercent: percent => ipcRenderer.send('poormad:zoom:set-percent', percent),
    // Fires on every zoom change, including the Ctrl/Cmd +/-/0 shortcuts,
    // so the settings UI can stay in sync with the keyboard.
    onChanged: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('poormad:zoom:changed', listener)

      return () => ipcRenderer.removeListener('poormad:zoom:changed', listener)
    }
  },
  revealLogs: () => ipcRenderer.invoke('poormad:logs:reveal'),
  getRecentLogs: () => ipcRenderer.invoke('poormad:logs:recent'),
  // Fire-and-forget: persists a renderer error-boundary catch (with component
  // stack) to desktop.log so crashes survive the window (#79428).
  reportRendererError: report => ipcRenderer.send('poormad:logs:renderer-error', report),
  readDir: dirPath => ipcRenderer.invoke('poormad:fs:readDir', dirPath),
  gitRoot: startPath => ipcRenderer.invoke('poormad:fs:gitRoot', startPath),
  revealPath: targetPath => ipcRenderer.invoke('poormad:fs:reveal', targetPath),
  openDir: dirPath => ipcRenderer.invoke('poormad:fs:openDir', dirPath),
  desktopPluginsRoot: () => ipcRenderer.invoke('poormad:fs:desktopPluginsRoot'),
  logsRoot: () => ipcRenderer.invoke('poormad:fs:logsRoot'),
  agentPluginsRoot: () => ipcRenderer.invoke('poormad:fs:agentPluginsRoot'),
  renamePath: (targetPath, newName) => ipcRenderer.invoke('poormad:fs:rename', targetPath, newName),
  writeTextFile: (filePath, content) => ipcRenderer.invoke('poormad:fs:writeText', filePath, content),
  trashPath: targetPath => ipcRenderer.invoke('poormad:fs:trash', targetPath),
  git: {
    worktreeList: repoPath => ipcRenderer.invoke('poormad:git:worktreeList', repoPath),
    worktreeAdd: (repoPath, options) => ipcRenderer.invoke('poormad:git:worktreeAdd', repoPath, options),
    worktreeRemove: (repoPath, worktreePath, options) =>
      ipcRenderer.invoke('poormad:git:worktreeRemove', repoPath, worktreePath, options),
    branchSwitch: (repoPath, branch) => ipcRenderer.invoke('poormad:git:branchSwitch', repoPath, branch),
    branchList: repoPath => ipcRenderer.invoke('poormad:git:branchList', repoPath),
    baseBranchList: repoPath => ipcRenderer.invoke('poormad:git:baseBranchList', repoPath),
    repoStatus: repoPath => ipcRenderer.invoke('poormad:git:repoStatus', repoPath),
    fileDiff: (repoPath, filePath) => ipcRenderer.invoke('poormad:git:fileDiff', repoPath, filePath),
    scanRepos: (roots, options) => ipcRenderer.invoke('poormad:git:scanRepos', roots, options),
    review: {
      list: (repoPath, scope, baseRef) => ipcRenderer.invoke('poormad:git:review:list', repoPath, scope, baseRef),
      diff: (repoPath, filePath, scope, baseRef, staged) =>
        ipcRenderer.invoke('poormad:git:review:diff', repoPath, filePath, scope, baseRef, staged),
      stage: (repoPath, filePath) => ipcRenderer.invoke('poormad:git:review:stage', repoPath, filePath),
      unstage: (repoPath, filePath) => ipcRenderer.invoke('poormad:git:review:unstage', repoPath, filePath),
      revert: (repoPath, filePath) => ipcRenderer.invoke('poormad:git:review:revert', repoPath, filePath),
      revParse: (repoPath, ref) => ipcRenderer.invoke('poormad:git:review:revParse', repoPath, ref),
      commit: (repoPath, message, push) => ipcRenderer.invoke('poormad:git:review:commit', repoPath, message, push),
      commitContext: repoPath => ipcRenderer.invoke('poormad:git:review:commitContext', repoPath),
      push: repoPath => ipcRenderer.invoke('poormad:git:review:push', repoPath),
      shipInfo: repoPath => ipcRenderer.invoke('poormad:git:review:shipInfo', repoPath),
      prList: (repoPath, branches, numbers) =>
        ipcRenderer.invoke('poormad:git:review:prList', repoPath, branches, numbers),
      fetchPrComment: (repoPath, url) => ipcRenderer.invoke('poormad:git:review:fetchPrComment', repoPath, url),
      createPr: repoPath => ipcRenderer.invoke('poormad:git:review:createPr', repoPath)
    }
  },
  terminal: {
    cwd: id => ipcRenderer.invoke('poormad:terminal:cwd', id),
    dispose: id => ipcRenderer.invoke('poormad:terminal:dispose', id),
    resize: (id, size) => ipcRenderer.invoke('poormad:terminal:resize', id, size),
    start: options => ipcRenderer.invoke('poormad:terminal:start', options),
    write: (id, data) => ipcRenderer.invoke('poormad:terminal:write', id, data),
    onData: (id, callback) => {
      const channel = `poormad:terminal:${id}:data`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)

      return () => ipcRenderer.removeListener(channel, listener)
    },
    onExit: (id, callback) => {
      const channel = `poormad:terminal:${id}:exit`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)

      return () => ipcRenderer.removeListener(channel, listener)
    }
  },
  onClosePreviewRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('poormad:close-preview-requested', listener)

    return () => ipcRenderer.removeListener('poormad:close-preview-requested', listener)
  },
  onPreviewNav: callback => {
    const listener = (_event, command) => callback(command)
    ipcRenderer.on('poormad:preview-nav', listener)

    return () => ipcRenderer.removeListener('poormad:preview-nav', listener)
  },
  onOpenFolderRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('poormad:open-folder-requested', listener)

    return () => ipcRenderer.removeListener('poormad:open-folder-requested', listener)
  },
  onOpenUpdatesRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('poormad:open-updates', listener)

    return () => ipcRenderer.removeListener('poormad:open-updates', listener)
  },
  onDeepLink: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:deep-link', listener)

    return () => ipcRenderer.removeListener('poormad:deep-link', listener)
  },
  signalDeepLinkReady: () => ipcRenderer.invoke('poormad:deep-link-ready'),
  probePluginRepo: payload => ipcRenderer.invoke('poormad:plugin:probe', payload),
  installDesktopPlugin: payload => ipcRenderer.invoke('poormad:plugin:installDesktop', payload),
  onWindowStateChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:window-state-changed', listener)

    return () => ipcRenderer.removeListener('poormad:window-state-changed', listener)
  },
  onFocusSession: callback => {
    const listener = (_event, sessionId) => callback(sessionId)
    ipcRenderer.on('poormad:focus-session', listener)

    return () => ipcRenderer.removeListener('poormad:focus-session', listener)
  },
  onNotificationAction: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:notification-action', listener)

    return () => ipcRenderer.removeListener('poormad:notification-action', listener)
  },
  onNotificationActivate: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:notification-activate', listener)

    return () => ipcRenderer.removeListener('poormad:notification-activate', listener)
  },
  onPreviewFileChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:preview-file-changed', listener)

    return () => ipcRenderer.removeListener('poormad:preview-file-changed', listener)
  },
  onBackendExit: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:backend-exit', listener)

    return () => ipcRenderer.removeListener('poormad:backend-exit', listener)
  },
  // Soft gateway-mode apply finished tearing down the primary backend. Renderer
  // should wipe session lists + re-dial without a window reload.
  onConnectionApplied: callback => {
    const listener = () => callback()
    ipcRenderer.on('poormad:connection:applied', listener)

    return () => ipcRenderer.removeListener('poormad:connection:applied', listener)
  },
  onPowerResume: callback => {
    const listener = () => callback()
    ipcRenderer.on('poormad:power-resume', listener)

    return () => ipcRenderer.removeListener('poormad:power-resume', listener)
  },
  // AC ↔ battery transitions; renderers slow their backstop polls on battery.
  getOnBattery: () => ipcRenderer.invoke('poormad:power-battery:get'),
  onBatteryChanged: callback => {
    const listener = (_event, onBattery) => callback(Boolean(onBattery))
    ipcRenderer.on('poormad:power-battery', listener)

    return () => ipcRenderer.removeListener('poormad:power-battery', listener)
  },
  onBootProgress: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:boot-progress', listener)

    return () => ipcRenderer.removeListener('poormad:boot-progress', listener)
  },
  // First-launch bootstrap progress -- emitted by the install.ps1 stage
  // runner in main.ts (apps/desktop/electron/bootstrap-runner.ts).
  // Renderer's install overlay subscribes to live events and queries the
  // current snapshot via getBootstrapState() to recover after a devtools
  // reload mid-bootstrap.
  getBootstrapState: () => ipcRenderer.invoke('poormad:bootstrap:get'),
  continueBootstrapLocal: () => ipcRenderer.invoke('poormad:bootstrap:continue-local'),
  resetBootstrap: () => ipcRenderer.invoke('poormad:bootstrap:reset'),
  repairBootstrap: () => ipcRenderer.invoke('poormad:bootstrap:repair'),
  cancelBootstrap: () => ipcRenderer.invoke('poormad:bootstrap:cancel'),
  onBootstrapEvent: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('poormad:bootstrap:event', listener)

    return () => ipcRenderer.removeListener('poormad:bootstrap:event', listener)
  },
  getVersion: () => ipcRenderer.invoke('poormad:version'),
  getRemoteDisplayReason: () => ipcRenderer.invoke('poormad:get-remote-display-reason'),
  uninstall: {
    summary: () => ipcRenderer.invoke('poormad:uninstall:summary'),
    run: mode => ipcRenderer.invoke('poormad:uninstall:run', { mode })
  },
  updates: {
    check: () => ipcRenderer.invoke('poormad:updates:check'),
    apply: opts => ipcRenderer.invoke('poormad:updates:apply', opts),
    getBranch: () => ipcRenderer.invoke('poormad:updates:branch:get'),
    setBranch: name => ipcRenderer.invoke('poormad:updates:branch:set', name),
    onProgress: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('poormad:updates:progress', listener)

      return () => ipcRenderer.removeListener('poormad:updates:progress', listener)
    }
  },
  themes: {
    fetchMarketplace: id => ipcRenderer.invoke('poormad:vscode-theme:fetch', id),
    searchMarketplace: query => ipcRenderer.invoke('poormad:vscode-theme:search', query)
  },
  // Find-in-page (Ctrl/Cmd+F): delegates to Electron's
  // webContents.findInPage on the IPC sender's window so a Cmd+F pressed
  // in a secondary session window searches THAT window, not the primary.
  // `onFoundInPage` returns the unsubscribe fn; the renderer wires it via
  // `initFindInPageListener` in store/find-in-page.ts and tears it down
  // when the FindBar unmounts.
  findInPage: (query, options) => ipcRenderer.invoke('poormad:find-in-page', query, options),
  stopFindInPage: () => ipcRenderer.invoke('poormad:stop-find-in-page'),
  onFoundInPage: callback => {
    const listener = (_event, result) => callback(result)
    ipcRenderer.on('poormad:found-in-page', listener)

    return () => ipcRenderer.removeListener('poormad:found-in-page', listener)
  },
  // Main-process `before-input-event` forwards Ctrl/Cmd+F here so renderer
  // can open the FindBar even when the GTK compositor has already grabbed
  // the chord at the windowing layer (#81727).
  onOpenFindBarRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('poormad:open-find-bar', listener)

    return () => ipcRenderer.removeListener('poormad:open-find-bar', listener)
  }
})
