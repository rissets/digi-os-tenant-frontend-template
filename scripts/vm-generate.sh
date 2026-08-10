#!/usr/bin/env sh
set -eu

manifest=${1:?"Usage: vm-generate.sh MANIFEST OUTPUT_DIR"}
output_dir=${2:?"Usage: vm-generate.sh MANIFEST OUTPUT_DIR"}
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
template_root=$(dirname -- "$script_dir")

cd "$template_root"
npm run tenant:generate -- --manifest "$manifest" --output "$output_dir"
cd "$output_dir"
npm ci
npm run check

printf 'Generated and validated tenant frontend: %s\n' "$output_dir"
