#!/bin/bash
# start-all.sh - Launch all agents in a persistent screen session
# Session survives terminal closes. Re-run to attach if already running.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION="learnbridge-agents"

# If session already exists, just attach
if screen -list | grep -q "$SESSION"; then
  echo "✅ Agents already running. Attaching to session '$SESSION'..."
  screen -r "$SESSION"
  exit 0
fi

echo "🚀 Starting learnbridge agents in screen session '$SESSION'..."

# Create detached session with first agent
screen -dmS "$SESSION" -t president bash -c "cd '$SCRIPT_DIR' && ./start-agent.sh president"

# Add remaining agents as windows
for AGENT in coach player refree finisher; do
  screen -S "$SESSION" -X screen -t "$AGENT" bash -c "cd '$SCRIPT_DIR' && ./start-agent.sh $AGENT"
  sleep 0.2
done

echo ""
echo "✅ All 5 agents running in background."
echo ""
echo "  Attach anytime:  screen -r $SESSION"
echo "  List windows:    Ctrl-A then \""
echo "  Detach:          Ctrl-A then D"
echo "  Stop all:        screen -S $SESSION -X quit"
echo ""
