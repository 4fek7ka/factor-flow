#!/bin/bash

OUT_DIR="dump_parts"
CHUNK_SIZE=30000
SELF="$(basename "$0")"

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR"/part_*.txt

part=1
count=0
out="$OUT_DIR/part_$(printf '%03d' $part).txt"
> "$out"

append() {
  local text="$1"
  local len=${#text}

  if (( count + len > CHUNK_SIZE )); then
    part=$((part + 1))
    out="$OUT_DIR/part_$(printf '%03d' $part).txt"
    > "$out"
    count=0
  fi

  printf "%s" "$text" >> "$out"
  count=$((count + len))
}

STATS=$(mktemp)

find . \
  -type d \( \
    -name node_modules -o \
    -name .git -o \
    -name dist -o \
    -name build -o \
    -name .vite -o \
    -name .next -o \
    -name .cache -o \
    -name "$OUT_DIR" \
  \) -prune -o \
  -type f \
    ! -name "*.json" \
    ! -name ".env" \
    ! -name "project_dump.txt" \
    ! -name "$SELF" \
  -print |
  sort |
  while read -r file; do
    size=$(wc -m < "$file")
    echo "$size ${file#./}" >> "$STATS"

    append "${file#./}\n"
    append "$(cat "$file")\n"
  done

echo
echo "FILE SIZE STATS (chars, desc):"
sort -nr "$STATS" | awk '{ printf "%-60s %s\n", $2, $1 }'

rm "$STATS"

echo
echo "Done -> $OUT_DIR"

