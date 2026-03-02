# Conductor Commands

## Commands

| Say | I Do |
|-----|------|
| `Conductor: president` | `touch agentic-workflow/.president` |
| `Conductor: coach` | `touch agentic-workflow/.coach` |
| `Conductor: player` | `touch agentic-workflow/.player` |
| `Conductor: player:task [id]` | `echo "[id]" > agentic-workflow/.player` |
| `Conductor: review-task` | `touch agentic-workflow/.review-task` |
| `Conductor: finish` | `touch agentic-workflow/.finish` |

See agentic-workflow/.agents/ for agent configurations.

## Workflow

```
Conductor: president   → discuss scaffolding → writes SCAFFOLDING.md
Conductor: coach       → reads 4 docs + scaffolding → creates Linear tasks
Conductor: player      → picks up task → implements → marks done in Linear
Conductor: review-task → reviews completed task vs PRD
Conductor: finish      → all done → final sign-off
```
