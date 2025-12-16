#!/usr/bin/env bash
set -euo pipefail

CG="https://api.coingecko.com/api/v3"
UA="factor-flow-mvp/1.0"

TOP=20
DAYS=365
SLEEP=20

TMP=".cg_tmp"
OUT="mock-history-coingecko-top20-1y.json"

mkdir -p "$TMP"
rm -f "$TMP"/*.array.json

echo "⏳ Fetching TOP-${TOP} markets snapshot..."

curl -sS -H "User-Agent: ${UA}" \
  "${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${TOP}&page=1&sparkline=false" \
  > "$TMP/markets.json"

jq 'length' "$TMP/markets.json" >/dev/null

jq -r '.[] | "\(.id)\t\(.symbol|ascii_upcase)"' \
  "$TMP/markets.json" > "$TMP/coins.tsv"

echo "✅ Coins: $(wc -l < "$TMP/coins.tsv")"

while IFS=$'\t' read -r id sym; do
  echo "→ $sym"

  raw="$TMP/${sym}.raw.json"
  arr="$TMP/${sym}.array.json"

  code="$(curl -sS -H "User-Agent: ${UA}" \
    -w "%{http_code}" \
    -o "$raw" \
    "${CG}/coins/${id}/market_chart?vs_currency=usd&days=${DAYS}&interval=daily" \
    || echo 000)"

  if [[ "$code" != "200" ]]; then
    echo "   ⚠️ HTTP $code — skipped"
    rm -f "$raw"
    continue
  fi

  pts="$(jq '(.prices // []) | length' "$raw")"
  if [[ "$pts" -eq 0 ]]; then
    echo "   ⚠️ NO DATA — skipped"
    rm -f "$raw"
    continue
  fi

  echo "   ✔ $pts points"

  jq --arg sym "$sym" '
    [.prices[]
      | {
          timestamp: (.[0] / 1000 | floor),
          prices: { ($sym): .[1] }
        }
    ]
  ' "$raw" > "$arr"

  rm -f "$raw"

  echo "   ⏸ sleep ${SLEEP}s"
  sleep "$SLEEP"

done < "$TMP/coins.tsv"

echo "⏳ Building final JSON..."

jq -s '
  add
  | group_by(.timestamp)
  | map({
      timestamp: .[0].timestamp,
      prices: (reduce .[] as $x ({}; . + $x.prices))
    })
  | sort_by(.timestamp)
' "$TMP"/*.array.json > "$OUT"

echo "✅ DONE"
echo "→ File: $OUT"
echo "→ Assets: $(jq '.[0].prices | keys | length' "$OUT")"
echo "→ Points: $(jq 'length' "$OUT")"

