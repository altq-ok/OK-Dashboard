#!/usr/bin/env bash
set -e

SESSION="next-uvicorn-dev"

# Clean up ports before start
kill_port () {
  local PORT=$1
  PIDS=$(lsof -ti tcp:$PORT || true)
  if [ -n "$PIDS" ]; then
    kill $PIDS # Use kill -9 if you want to force close
  fi
}

kill_port 3000 # Next.js
kill_port 8000 # Uvicorn

if tmux has-session -t "$SESSION" 2>/dev/null; then
  # Re-use an existing session if exists
  if [ -n "$TMUX" ]; then
    tmux switch-client -t "$SESSION"
  else
    tmux attach -t "$SESSION"
  fi
else
  # Start new tmux session
  WINDOW="$SESSION" # Same name as there is only one window
  tmux new-session -d -s "$SESSION" -n "$WINDOW"
fi

# frontend
tmux send-keys -t "$SESSION" \
  "cd apps/web && pnpm dev" C-m

# backend
tmux split-window -v -t "$SESSION"
tmux send-keys -t "$SESSION" \
  "cd apps/py-api && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" C-m

tmux select-layout even-horizontal
