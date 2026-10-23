---
'kimaki': patch
---

The `kimaki` command that agents run keeps working after a Node upgrade. The `<dataDir>/bin/kimaki` shim pointed at the exact Node binary that started the bot (for example `/opt/homebrew/Cellar/node/26.12.0/bin/node`), so `brew upgrade node` made every agent `kimaki` call fail with `node: not found` until the bot restarted. The shim now falls back to `node` from `PATH` when that binary is gone, like `autostart.command` already does.
