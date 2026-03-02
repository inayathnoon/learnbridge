# Quick Start — Project Execution

This project was created by IdeaForge. The planning docs are in `docs/`.
The Conductor agents in this directory run your execution workflow.

## Workflow

```
Conductor: president   → scaffolding session → SCAFFOLDING.md
Conductor: coach       → Linear tasks created from docs + scaffolding
Conductor: player      → implement tasks one by one
Conductor: review-task → review each completed task
Conductor: finish      → all done, final sign-off
```

## Setup

### 1. Start agents (in separate terminals)

```bash
cd agentic-workflow
./start-all.sh        # launches all 5 in VS Code tabs
# or individually:
./start-agent.sh president
./start-agent.sh coach
./start-agent.sh player
./start-agent.sh review-task
./start-agent.sh finisher
```

### 2. Open Claude Code in project root

```bash
claude .
```

### 3. Run the President first

```
Conductor: president
```

President will walk through every scaffolding decision with you.
This is a long conversation — take your time on each decision.
Output goes to `SCAFFOLDING.md`.

### 4. Run Coach after scaffolding is done

```
Conductor: coach
```

Coach reads all docs + SCAFFOLDING.md and creates your Linear project with all tasks wired up.

### 5. Start building

Pick up a task and run:
```
Conductor: player
```
or for a specific task:
```
Conductor: player:task TASK-ID
```

### 6. Review completed work

```
Conductor: review-task
```

### 7. When all tasks are done

```
Conductor: finish
```

## Agents

| Agent | Signal file | Does |
|-------|-------------|------|
| president | `.president` | Scaffolding discussion → SCAFFOLDING.md |
| coach | `.coach` | Creates Linear project + all tasks |
| player | `.player` | Implements task, creates scaffolding on first run |
| review-task | `.review-task` | Reviews completed task vs PRD |
| finisher | `.finish` | Final validation + DONE.md |
