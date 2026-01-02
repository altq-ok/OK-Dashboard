#!/usr/bin/env bash
set -eu

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


# Use tmux to run frontend and backend servers
SESSION="dev"
tmux kill-session -t $SESSION 2>/dev/null || echo ""
# tmux attach -t $SESSION || tmux new -s $SESSION
tmux new -s $SESSION -d
tmux split-window -h
tmux send-keys -t $SESSION.0 "cd apps/web && pnpm dev" C-m
tmux send-keys -t $SESSION.1 "cd apps/py-api && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" C-m
tmux attach -t $SESSION
