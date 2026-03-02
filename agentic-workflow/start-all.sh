#!/bin/bash
# start-all.sh - Launch all project agents in VS Code terminal tabs

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Launching project agents..."
echo ""
echo "Opening terminals:"
echo "  1. President  (scaffolding session)"
echo "  2. Coach      (Linear task creation)"
echo "  3. Player     (task implementation)"
echo "  4. Review Task Analyst"
echo "  5. Finisher"
echo ""

osascript <<EOF
tell application "Visual Studio Code"
    activate
end tell

tell application "System Events"
    tell process "Code"
        -- Terminal 1: President
        keystroke "\`" using {control down}
        delay 0.5
        keystroke "cd '$SCRIPT_DIR' && clear && ./start-agent.sh president"
        keystroke return

        delay 1

        -- Terminal 2: Coach
        keystroke "\`" using {control down}
        delay 0.5
        keystroke "cd '$SCRIPT_DIR' && clear && ./start-agent.sh coach"
        keystroke return

        delay 1

        -- Terminal 3: Player
        keystroke "\`" using {control down}
        delay 0.5
        keystroke "cd '$SCRIPT_DIR' && clear && ./start-agent.sh player"
        keystroke return

        delay 1

        -- Terminal 4: Review Task Analyst
        keystroke "\`" using {control down}
        delay 0.5
        keystroke "cd '$SCRIPT_DIR' && clear && ./start-agent.sh review-task"
        keystroke return

        delay 1

        -- Terminal 5: Finisher
        keystroke "\`" using {control down}
        delay 0.5
        keystroke "cd '$SCRIPT_DIR' && clear && ./start-agent.sh finisher"
        keystroke return
    end tell
end tell
EOF

echo "✅ All 5 agent terminals launched"
