#!/usr/bin/env bash
# Records real ast-grep outputs for the CLI corpus (hooks/corpus.ts).
#
#   scripts/capture-corpus.sh            uses `ast-grep` on PATH
#   AST_GREP=/path/to/ast-grep scripts/capture-corpus.sh
#
# Every case runs on scratch fixtures written to a fresh temp directory, with
# the same rule shape, flags and config the mod uses (hooks/cli.ts), and
# relative paths so the recorded output holds no machine path. Re-run it after
# an ast-grep upgrade and review the diff: the tests then say what changed.
set -euo pipefail

root="$(CDPATH= cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bin="${AST_GREP:-ast-grep}"
config="$root/assets/sgconfig.yml"
out="$root/hooks/corpus.ts"
work="$(mktemp -d)"
proj="$work/proj"
mkdir -p "$proj/src"

# The project fixture: TypeScript files with and without matches, one JS file
# (another language: never scanned for typescript), a non-ASCII comment.
printf 'const a = foo(1)\nfoo(2)\n' >"$proj/src/a.ts"
printf '// \xc3\xbcn\xc3\xafc\xc3\xb6d\xc3\xa9\nconst b = foo(x, y)\n' >"$proj/src/b.ts"
printf 'foo(3)\n' >"$proj/src/c.js"
printf 'foo(4)\n' >"$proj/src/d.ts"
# Hidden paths: ast-grep 0.51.0 skips hidden directories but still reports a
# hidden file at the top of a scanned directory, so every path scan the mod
# makes ends with `--globs '!.*'`; a hidden path named explicitly still scans.
printf 'foo(5)\n' >"$proj/.hidden.ts"
mkdir -p "$proj/src/.cache"
printf 'foo(6)\n' >"$proj/src/.cache/e.ts"
# A hidden file with 200 matches beside four visible ones: hidden matches must
# not use up the result cap (round-2 review repro).
# It lives in a second project so the first one's cases stay small.
main="$proj"
limit="$work/limit"
mkdir -p "$limit/hiddenScope" "$limit/visibleScope/sub"
for i in $(seq 1 200); do printf 'foo(%d)\n' "$i"; done >"$limit/hiddenScope/.hidden.ts"
printf 'foo(1)\nfoo(2)\n' >"$limit/visibleScope/a.ts"
printf 'foo(3)\nfoo(4)\n' >"$limit/visibleScope/sub/b.ts"

version="$("$bin" --version)"
cases="$work/cases.jsonl"
: >"$cases"

# record NAME LANGUAGE PATTERN FIX|- MAX STDIN_FILE|- [PATH...]
# Path scans pass each glob in the GLOBS array (set it per call), as the mod does:
# the caller's globs, then '!.*'.
GLOBS=()
record() {
  local name="$1" language="$2" pattern="$3" fix="$4" max="$5" stdin_file="$6"
  shift 6
  local rule
  if [[ "$fix" == "-" ]]; then
    rule="$(jq -cn --arg l "$language" --arg p "$pattern" '{id:"mod",language:$l,severity:"hint",rule:{pattern:$p}}')"
  else
    rule="$(jq -cn --arg l "$language" --arg p "$pattern" --arg f "$fix" '{id:"mod",language:$l,severity:"hint",rule:{pattern:$p},fix:$f}')"
  fi
  local args=(scan --inline-rules "$rule" --config "$config" --custom-languages ignore
    --json=compact --max-results "$max" --threads 2 --color never)
  local rc=0 stdin_text=""
  if [[ "$stdin_file" != "-" ]]; then
    stdin_text="$(cat "$stdin_file"; printf x)"
    stdin_text="${stdin_text%x}"
    (cd "$proj" && "$bin" "${args[@]}" --stdin <"$stdin_file" >"$work/stdout" 2>"$work/stderr") || rc=$?
  else
    local g
    for g in ${GLOBS[@]+"${GLOBS[@]}"}; do args+=(--globs "$g"); done
    (cd "$proj" && "$bin" "${args[@]}" -- "$@" >"$work/stdout" 2>"$work/stderr") || rc=$?
  fi
  local globs_json='[]'
  if [[ "$stdin_file" == "-" && ${#GLOBS[@]} -gt 0 ]]; then globs_json="$(printf '%s\n' "${GLOBS[@]}" | jq -R . | jq -cs .)"; fi
  local paths_json
  if [[ $# -gt 0 ]]; then paths_json="$(printf '%s\n' "$@" | jq -R . | jq -cs .)"; else paths_json='[]'; fi
  jq -cn --arg name "$name" --arg language "$language" --arg pattern "$pattern" --arg fix "$fix" \
    --argjson max "$max" --argjson paths "$paths_json" --argjson globs "$globs_json" --arg stdin "$stdin_text" --argjson hasStdin "$([[ "$stdin_file" != "-" ]] && echo true || echo false)" \
    --argjson exitCode "$rc" --rawfile stdout "$work/stdout" --rawfile stderr "$work/stderr" \
    '{name:$name, language:$language, pattern:$pattern}
     + (if $fix == "-" then {} else {fix:$fix} end)
     + {maxResults:$max, paths:$paths, globs:$globs}
     + (if $hasStdin then {stdin:$stdin} else {} end)
     + {result:{exitCode:$exitCode, stdout:$stdout, stderr:$stderr, isStdoutTruncated:false, isStderrTruncated:false}}' >>"$cases"
}

# stdin fixtures for byte-level rewrites
s="$work/stdin"
mkdir -p "$s"
printf 'const s = "\xc3\xa9\xf0\x9f\x98\x80"; foo(1)\n' >"$s/unicode"
printf 'foo(1)\r\nconst x = 2\r\nfoo(3)\r\n' >"$s/crlf"
printf 'const x = 1\nfoo(2)' >"$s/nofinal"
printf 'foo(1)\nfoo(2)\n' >"$s/multiline"
printf 'foo(1);\nkeep();\n' >"$s/empty"
printf 'foo(foo(1))\n' >"$s/nested"

GLOBS=('!.*')
record search-basic typescript 'foo($A)' - 51 - .
record search-basic-max3 typescript 'foo($A)' - 3 - .
record search-multi typescript 'foo($$$ARGS)' - 51 - src
record search-max typescript 'foo($A)' - 1 - src/a.ts
record no-match typescript 'nothere($A)' - 51 - .
record invalid-pattern typescript 'function {{{' - 51 - .
record missing-path typescript 'foo($A)' - 51 - nope.ts
record bad-language cobol 'foo($A)' - 51 - .
record discover typescript 'foo($A)' 'bar($A)' 1001 - src
record discover-root typescript 'foo($A)' 'bar($A)' 1001 - .
record search-hidden-dir typescript 'foo($A)' - 51 - src/.cache
proj="$limit"
record limit typescript 'foo($A)' - 2 - hiddenScope visibleScope
GLOBS=('*.ts' '!.*')
record limit-globs typescript 'foo($A)' - 2 - hiddenScope visibleScope
# Without the mod's glob: what ast-grep reports for the hidden scope alone, and
# for the whole directory (the hidden file at its top is included).
GLOBS=()
record raw-hidden-only typescript 'foo($A)' - 2 - hiddenScope
record raw-root typescript 'foo($A)' - 51 - .
proj="$main"
record stdin-a typescript 'foo($A)' 'bar($A)' 1001 "$proj/src/a.ts"
record stdin-d typescript 'foo($A)' 'bar($A)' 1001 "$proj/src/d.ts"
record unicode typescript 'foo($A)' 'bar($A)' 1001 "$s/unicode"
record crlf typescript 'foo($A)' 'bar($A)' 1001 "$s/crlf"
record no-final-newline typescript 'foo($A)' 'bar($A)' 1001 "$s/nofinal"
record multiline typescript 'foo($A)' $'bar(\n  $A,\n)' 1001 "$s/multiline"
record empty-rewrite typescript 'foo($A)' '' 1001 "$s/empty"
record nested typescript 'foo($A)' 'bar($A)' 1001 "$s/nested"

{
  echo "// Recorded by scripts/capture-corpus.sh with ${version}. Do not edit by hand: re-run the script."
  echo "import type { CorpusCase } from '../types'"
  echo
  echo "export const CORPUS_VERSION = $(jq -cn --arg v "$version" '$v')"
  echo
  echo "export const CORPUS: CorpusCase[] = $(jq -s . "$cases")"
} >"$out"
n="$(wc -l <"$cases" | tr -d " ")"
rm -rf "$work"
echo "wrote $out ($n cases) with $version"
