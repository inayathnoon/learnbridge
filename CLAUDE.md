# Conductor Commands

## Commands

| Say | I Do |
|-----|------|
| `Conductor: president` | `touch agentic-workflow/.president` |
| `Conductor: coach` | `touch agentic-workflow/.coach` |
| `Conductor: player` | `touch agentic-workflow/.player` |
| `Conductor: player:task [id]` | `echo "[id]" > agentic-workflow/.player` |
| `Conductor: refree` | `touch agentic-workflow/.refree` |
| `Conductor: finish` | `touch agentic-workflow/.finish` |

See agentic-workflow/.agents/ for agent configurations.

## Workflow

```
Conductor: president   → discuss scaffolding → writes SCAFFOLDING.md
Conductor: coach       → reads 4 docs + scaffolding → creates Linear tasks
Conductor: player      → picks up task → implements → marks done in Linear
Conductor: refree      → marks done in Linear, then asks to call finisher
Conductor: finish      → all done → final sign-off
```
