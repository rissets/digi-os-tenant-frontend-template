#!/usr/bin/env sh
set -eu

site_dir=${1:?"Usage: vm-refine.sh SITE_DIR [--model MODEL]"}
shift
env_file=${DIGI_AGENT_ENV_FILE:-/etc/digi-os/frontend-agent.env}

if [ ! -r "$env_file" ]; then
  printf 'Agent environment is not readable: %s\n' "$env_file" >&2
  exit 1
fi

set -a
. "$env_file"
set +a
export PI_CODING_AGENT_DIR=${PI_CODING_AGENT_DIR:-/root/.pi/agent}

cd "$site_dir"
exec npm run agent:refine -- "$@"
