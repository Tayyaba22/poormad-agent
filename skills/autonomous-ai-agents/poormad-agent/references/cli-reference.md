# PoorMad CLI Reference

Live sources when anything looks stale: `poormad --help`, `poormad <command> --help`,
https://poormad.dev/docs/reference/cli-commands

### Global Flags

```
poormad [flags] [command]        (no subcommand = interactive chat)

  --version, -V             Show version
  -z, --oneshot PROMPT      One-shot: print ONLY the final response (for scripts/pipes)
  -m MODEL  --provider P    Model/provider override for this invocation
  -t, --toolsets LIST       Comma-separated toolsets for this invocation
  --resume, -r SESSION      Resume session by ID or title
  --continue, -c [NAME]     Resume by name, or most recent session
  --worktree, -w            Isolated git worktree mode (parallel agents)
  --skills, -s SKILL        Preload skills (comma-separate or repeat)
  --profile, -p NAME        Use a named profile
  --yolo                    Skip dangerous command approval
  --tui / --cli             Force the Ink TUI / classic REPL
  --ignore-rules            Skip AGENTS.md/SOUL.md/memory/skill injection
  --safe-mode               Disable ALL customizations (troubleshooting)
  --pass-session-id         Include session ID in system prompt
```

### Chat

```
poormad chat [flags]
  -q, --query TEXT          Single query, non-interactive
  --image PATH              Attach a local image to a single query
  -Q, --quiet               Suppress banner, spinner, tool previews
  --checkpoints             Enable filesystem checkpoints (/rollback)
  --max-turns N             Cap tool-calling iterations
  --source TAG              Session source tag (default: cli)
```
(plus the global flags above)

### Configuration

```
poormad setup [section]      Wizard (model|tts|terminal|gateway|tools|agent)
poormad model                Interactive model/provider picker
poormad fallback [add|remove|list]  Fallback provider chain
poormad config [show|edit|get|set|unset|path|env-path|check|migrate]
poormad login / logout       OAuth sign-in / clear stored auth
poormad doctor [--fix]       Check dependencies and config
poormad status [--all]       Component status
```

### Tools & Skills

```
poormad tools [list|enable NAME|disable NAME]   Per-platform toolsets (curses UI with no args)

poormad skills list|browse|search QUERY|inspect ID
poormad skills install ID    Hub identifier OR a direct https://…/SKILL.md URL
poormad skills config        Enable/disable skills per platform
poormad skills check|update|uninstall|publish PATH
poormad skills tap add REPO  Add a GitHub repo as a skill source
poormad bundles              Skill bundles (one /<name> alias loads several skills)
```

### MCP Servers

```
poormad mcp add NAME (--url or --command) | remove | list | test NAME
poormad mcp catalog | install NAME     Curated catalog install
poormad mcp configure NAME             Toggle tool selection
poormad mcp serve                      Run PoorMad as an MCP server
```
Details (transport, tool discovery, catalog): `references/native-mcp.md`.

### Gateway (Messaging Platforms)

```
poormad gateway run|install|start|stop|restart|status|setup
```

20+ platforms: Telegram, Discord, Slack, WhatsApp (Baileys + Business Cloud API), iMessage (Photon — `poormad photon setup`), Signal, Email, SMS, Matrix, Mattermost, Teams, LINE, SimpleX, ntfy, Google Chat, Home Assistant, DingTalk, Feishu, WeCom, Weixin, API Server, Webhooks. Open WebUI connects via the API Server adapter. Most adapters ship under `plugins/platforms/`.
Docs: https://poormad.dev/docs/user-guide/messaging/

### Sessions

```
poormad sessions list|browse|rename ID TITLE|delete ID|export OUT|prune|stats
```

### Cron / Webhooks

```
poormad cron list|create SCHED|edit ID|pause|resume|run ID|remove|status
    Schedules: '30m', 'every 2h', '0 9 * * *', ISO timestamp
poormad webhook subscribe NAME|list|remove NAME|test NAME
```
Webhook payloads/routes: `references/webhooks.md`.

### Profiles

```
poormad profile list|create NAME (--clone|--clone-all|--clone-from)|use|show|delete
poormad profile rename A B | alias NAME | export NAME | import FILE
```

### Credentials & Pools

```
poormad auth                 Interactive credential manager
poormad auth add [PROVIDER]  Add OAuth or API-key credential (nous, openai-codex, qwen-oauth, …)
poormad auth list|remove P IDX|reset PROVIDER|status
```
Multiple credentials per provider form a pool that rotates automatically and skips exhausted keys.

### Other

```
poormad desktop / gui        Native desktop app
poormad dashboard            Web admin panel + embedded chat (--stop / --status)
poormad proxy                OpenAI-compatible local proxy backed by an OAuth provider
poormad portal               Quick setup / sign in via PoorMad Portal
poormad kanban <verb>        Multi-agent work-queue board
poormad project              Named multi-folder workspaces
poormad skin list|use|set    Switch/tweak skins (see references/themes.md)
poormad pets <verb>          Pet mascots (see references/petdex.md)
poormad memory setup|status|off|reset   Memory provider
poormad secrets bitwarden|onepassword   External secret stores
poormad moa                  Mixture-of-Agents slots
poormad hooks / security / backup / import / checkpoints / console
poormad logs [-f] [errors]   View agent/error logs
poormad send                 One-off message through a gateway platform
poormad pairing / plugins / insights / journey / computer-use
poormad acp                  ACP server (IDE integration)
poormad completion bash|zsh|fish
poormad update / uninstall / claw migrate
```

Plugin- and provider-supplied subcommands (e.g. `poormad photon setup`) only appear once their plugin is installed/active.

### Where to Find Things

| Looking for... | Location |
|---|---|
| Config options | `poormad config edit` · [Configuration docs](https://poormad.dev/docs/user-guide/configuration) |
| Tools / toolsets | `poormad tools list` · [Tools reference](https://poormad.dev/docs/reference/tools-reference) |
| Skills catalog | `poormad skills browse` · [Skills catalog](https://poormad.dev/docs/reference/skills-catalog) |
| Provider setup | `poormad model` · [Providers guide](https://poormad.dev/docs/integrations/providers) |
| Env variables | `poormad config env-path` · [Env vars reference](https://poormad.dev/docs/reference/environment-variables) |
| Gateway logs | `~/.poormad/logs/gateway.log` (or `poormad logs`) |
| Sessions | `poormad sessions browse` (reads state.db) |
