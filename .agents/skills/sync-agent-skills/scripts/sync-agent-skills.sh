#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../../../.." && pwd)"
agents_dir="$repo_root/.agents/skills"

sync_target_dir() {
  local target_dir="$1"
  local label="$2"
  local added=0
  local updated=0
  local removed=0
  local skipped=0

  mkdir -p "$target_dir"

  for skill_path in "$agents_dir"/*; do
    [ -d "$skill_path" ] || continue
    [ -f "$skill_path/SKILL.md" ] || continue

    local skill_name
    local link_path
    local target

    skill_name="$(basename "$skill_path")"
    link_path="$target_dir/$skill_name"
    target="../../.agents/skills/$skill_name"

    if [ -L "$link_path" ]; then
      local current_target
      current_target="$(readlink "$link_path")"
      if [ "$current_target" != "$target" ]; then
        ln -sfn "$target" "$link_path"
        updated=$((updated + 1))
        printf '[%s] updated %s -> %s\n' "$label" "$link_path" "$target"
      fi
    elif [ -e "$link_path" ]; then
      skipped=$((skipped + 1))
      printf '[%s] skipped non-symlink %s\n' "$label" "$link_path" >&2
    else
      ln -s "$target" "$link_path"
      added=$((added + 1))
      printf '[%s] added %s -> %s\n' "$label" "$link_path" "$target"
    fi
  done

  for link_path in "$target_dir"/*; do
    [ -L "$link_path" ] || continue

    local target
    target="$(readlink "$link_path")"
    case "$target" in
      ../../.agents/skills/*)
        local skill_name
        skill_name="${target##*/}"
        if [ ! -f "$agents_dir/$skill_name/SKILL.md" ]; then
          rm "$link_path"
          removed=$((removed + 1))
          printf '[%s] removed stale %s\n' "$label" "$link_path"
        fi
        ;;
    esac
  done

  printf '[%s] sync complete: added=%d updated=%d removed=%d skipped=%d\n' "$label" "$added" "$updated" "$removed" "$skipped"
}

sync_target_dir "$repo_root/.claude/skills" "claude"
sync_target_dir "$repo_root/.gemini/skills" "gemini"
