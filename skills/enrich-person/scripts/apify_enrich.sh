#!/usr/bin/env bash
# apify_enrich.sh — scrape a person's public profile via Apify, print JSON to stdout.
# Bundled so every enrichment doesn't reconstruct the curl. Cites nothing itself —
# the caller distills + cites the returned data into the vault.
#
# Usage:
#   APIFY_TOKEN=... apify_enrich.sh linkedin  https://www.linkedin.com/in/<slug>
#   APIFY_TOKEN=... apify_enrich.sh instagram <handle>
#   APIFY_TOKEN=... apify_enrich.sh actors    linkedin        # find a live LinkedIn actor
#
# Actors are overridable via env so they stay current without editing the skill:
#   LINKEDIN_ACTOR (default dev_fusion~linkedin-profile-scraper)
#   INSTAGRAM_ACTOR (default apify~instagram-scraper — official, stable)
set -euo pipefail

die() { echo "ERROR: $*" >&2; exit 1; }
[ -n "${APIFY_TOKEN:-}" ] || die "APIFY_TOKEN not set. Add it to your shell env (console.apify.com → Settings → Integrations). Falling back to web search is the caller's job."

mode="${1:-}"; arg="${2:-}"
api="https://api.apify.com/v2"
LINKEDIN_ACTOR="${LINKEDIN_ACTOR:-dev_fusion~linkedin-profile-scraper}"
INSTAGRAM_ACTOR="${INSTAGRAM_ACTOR:-apify~instagram-scraper}"

run_sync() { # actor  json_input
  curl -s -X POST "$api/acts/$1/run-sync-get-dataset-items?token=$APIFY_TOKEN" \
    -H 'Content-Type: application/json' -d "$2"
}

case "$mode" in
  linkedin)
    [ -n "$arg" ] || die "usage: apify_enrich.sh linkedin <profile-url>"
    out=$(run_sync "$LINKEDIN_ACTOR" "{\"profileUrls\":[\"$arg\"]}")
    # Some actors expect "urls" not "profileUrls"; retry once on an input-validation error.
    if echo "$out" | grep -qi "did not match\|invalid input\|is required"; then
      out=$(run_sync "$LINKEDIN_ACTOR" "{\"urls\":[\"$arg\"]}")
    fi
    echo "$out"
    ;;
  instagram)
    [ -n "$arg" ] || die "usage: apify_enrich.sh instagram <handle>"
    handle="${arg#@}"
    run_sync "$INSTAGRAM_ACTOR" "{\"usernames\":[\"$handle\"],\"resultsLimit\":1}"
    ;;
  actors) # discover a live actor when the default 404s
    q="${arg:-linkedin profile}"
    curl -s "$api/store?search=$(printf '%s' "$q" | sed 's/ /+/g')&limit=10&token=$APIFY_TOKEN" \
      | grep -oE '"username":"[^"]+","name":"[^"]+"' | head -10
    ;;
  *)
    die "usage: apify_enrich.sh {linkedin <url>|instagram <handle>|actors [query]}"
    ;;
esac
