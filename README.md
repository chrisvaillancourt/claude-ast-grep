# ast-grep

A Claude Code mod that gives the model structural code search and previewed rewrites through the [ast-grep](https://ast-grep.github.io/) CLI. The model searches with a syntax pattern (`console.log($A)`), previews a rewrite as a complete diff, and then applies exactly that diff, or discards it. Apply writes the content the preview showed, never a fresh rewrite, and refuses to write anything when a target changed after the preview.

Each file is written through Claude Code's own Write tool, so your permission rules, permission prompts, the auto-mode classifier and your settings hooks judge every write the way they judge the model's own edits.

## Behavior

- **`mcp__ast-grep__search`** `{ pattern, language, paths?, globs?, maxResults? }`: matches of one pattern in one language under the session's directory. Each match has its file, 1-based line and column, matched text, the source lines it spans, and the captured metavariables. Read-only.
- **`mcp__ast-grep__preview`** `{ pattern, rewrite, language, paths, globs? }`: computes a rewrite without touching any file and returns a preview id, its expiry, the files and replacement counts, and the complete unified diff. `rewrite` may be empty (deletes each match).
- **`mcp__ast-grep__apply`** `{ previewId }`: writes the preview. Before the first write it re-reads every target and compares its SHA-256 with the hash taken at preview time; if any file differs, nothing is written and the preview is dropped. Then each file is written with the built-in Write tool, re-read and hashed again. The result lists every file as `written`, `refused`, `failed`, `not-written`, `differs`, `unknown` or `unstarted` (never reached), and says to Read a file before editing it. Anything short of every file `written` comes back as an error result.
- **`mcp__ast-grep__discard`** `{ previewId }`: drops a pending preview.
- **Hidden paths are skipped:** a file whose path has a segment starting with a dot (`.env.ts`, `.cache/x.ts`) is left out of search and preview results unless a path you named is itself hidden (`paths: [".cache"]`). ast-grep 0.51.0 skips hidden directories but still reports hidden files, so every scan the mod runs ends with `--globs '!.*'`: ast-grep leaves hidden paths out before it counts results, and a glob of yours can't bring them back. Hidden files are therefore not listed. If ast-grep ever returns a hidden file anyway, the mod drops it, lists it as `skippedHidden` (the first 50, with `skippedHiddenCount`), and marks the search `truncated`, since the dropped matches may have taken the place of others.
- One preview may be pending at a time; a second preview is refused until the first is applied or discarded. A preview expires after 15 minutes, and `/clear`, `/ast-grep off` and `/ast-grep discard` drop it.
- The tools serve the main conversation only. A subagent's call is refused with an error.
- Every failure is an explicit error the model reads, with a code (`INVALID_RULE`, `CLI_ERROR`, `STALE`, `OVERLAP`, `TOO_LARGE`, ...). An invalid pattern, a missing path or an unsupported language is never reported as "no matches".

### How a rewrite is computed

1. `ast-grep scan` runs over the paths with a rule the mod writes itself (`--inline-rules` with one pattern, the language and the rewrite as `fix`) and a config file the mod ships (`assets/sgconfig.yml`), so a repository's own `sgconfig.yml`, rule files and custom languages never change the operation. Arguments go to the CLI as an argument vector, never through a shell. The mod uses `scan`, not `run`: `run` exits 0 with no matches on an invalid pattern.
2. Each matching file is checked (a regular file, no symbolic link on its path, inside the session's directory, at most 256 KiB, valid UTF-8 with no NUL byte and no byte-order mark) and read once. ast-grep then runs again on that snapshot through stdin, so the replacements belong to exactly the bytes that were read.
3. The replacements are applied by UTF-8 byte offset, from the end of the file to the start. Overlapping replacements (a rewrite of `foo($A)` over `foo(foo(1))`) are refused: no preview id. Untouched bytes stay as they were, line endings and a missing final newline included.
4. The diff is computed from the stored before and after text. It is exact (applying it gives the stored after text) but not always minimal: unchanged lines between two nearby replacements can show as removed and added.

### Apply and permissions

Apply calls the built-in Write tool once per file, as the plugin's own tool call. That call goes through the same permission path as the model's Write: allow and deny rules, the permission mode, the prompt in an interactive session, the auto-mode classifier, and `PreToolUse` hooks. Before any write the mod also asks the permission check (`$.tool.check`) about every file and refuses the whole apply when one would be denied.

- A refused write (a deny rule, a declined prompt, a headless session in the default mode) stops the apply at that file. Files before it stay written, and the result says which. When nothing was written yet (the first file was refused, or the Write tool failed on it and the file is unchanged), the preview stays pending, so the same id can be applied once the write is allowed. That holds only while the preview's authority stands: if `/ast-grep off` ran at any point since the preview was made, the preview is dropped instead, and turning the tools on again does not bring it back.
- A write the person edited in the prompt, or one held for review instead of written (`staged`), is reported as `differs` or `not-written` after the file is re-read: never as written.
- In a headless session (`claude -p`) in the default permission mode the first write is refused and nothing is written. `--permission-mode acceptEdits`, or a `Write` allow rule, lets apply write. (Checked on Claude Code 2.1.310.)

The writes are sequential, not a transaction. Every target is checked before the first write and again right before its own write, which narrows the window for a concurrent change but does not close it: another program writing a target between that check and the write is not detected until the re-read afterwards. A failure part way through leaves the earlier files written; the mod does not roll them back.

### What it costs

No model calls. Each tool call runs the local ast-grep CLI: one process for a search, and for a preview one discovery scan plus one per changed file (at most 21). The results are ordinary tool-result tokens: a search result is at most 32 KiB of JSON, a preview at most a 64 KiB diff plus its summary.

The four tools are registered once when the session starts and stay the same for the whole session. They are deferred behind ToolSearch by default, so each request carries only their names until the model loads them. Set `alwaysLoaded` to put their full schemas in every request instead, which costs input tokens on every request of the session.

### What it never does

- Write a file with its own file access: every write is a Write tool call.
- Re-run the rewrite at apply time, or include files or matches that appeared after the preview.
- Follow symbolic links, read outside the session's directory, or touch binary or non-UTF-8 files.
- Truncate a preview diff: a rewrite whose diff or snapshots exceed the bounds gets no preview id.

## Contract

In scope: regular UTF-8 source files under the session's working directory; the languages built into the installed ast-grep; one pattern and one rewrite per call, in one language; ast-grep's own file selection (its ignore files and `--globs`), with hidden paths skipped by the mod; a file set frozen at preview time; writing exactly the stored content when every target is unchanged.

Out of contract:

- YAML rules, rule files, `constraints`, `transform`, relational rules (`inside`, `has`), several rewrites in one call, mixed languages in one call.
- A repository's `sgconfig.yml`, custom languages and `utils`: ignored on purpose.
- Files outside the session's directory, symbolic links, hard-link aliases, binary or invalid UTF-8 files, files with a byte-order mark, files over 256 KiB.
- Semantic or type-aware refactoring; a guarantee that the rewritten code parses.
- File metadata (mode, timestamps) beyond what the Write tool keeps.
- An atomic multi-file write, rollback, crash recovery, or protection against a program writing the same files while apply runs.
- Context lines around search matches (ast-grep's JSON output has none; each match carries its own source lines).

## Command

`/ast-grep [status|on|off|discard]`

- `status` (the default): on or off and why, the ast-grep version found, the pending preview (id, files, time left) and the last apply's outcome.
- `on` / `off`: turn the tools on or off for this session. Off, every call is refused with a message saying so and a pending preview is dropped. A preview or apply already running when you turn it off stops at its next step: the preview is not kept, and the apply issues no further Write (a Write already issued is not undone). Turning it on again does not resume either. The tools stay registered either way, so the tool list doesn't change mid-session.
- `discard`: drop the pending preview, or clear the record of an apply a reload interrupted.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `enabled` | `true` | Turn the tools on for new sessions. `/ast-grep on|off` overrides it per session. |
| `alwaysLoaded` | `false` | Put the four tools' schemas in every request instead of behind ToolSearch. |
| `binary` | `ast-grep` | The ast-grep executable, a name on `PATH` or an absolute path. (`sg` is a deprecated alias that warns on stderr, which the mod treats as an error.) |
| `timeoutSeconds` | `30` | Time limit for each ast-grep process (5 to 300). |

Fixed bounds:

| Bound | Value |
| --- | --- |
| Pattern, rewrite | 16 KiB each |
| Paths, globs | 16 each |
| Search matches | 50 by default, `maxResults` up to 200; more is reported as `truncated` |
| Search result | 32 KiB of JSON for the whole result (rows, notes and lists); matches past it are dropped and the result says `truncated` |
| Matched text, source lines and captures in a search result | 400 characters each, marked when cut; at most 50 nodes per `$$$` capture, with `multiTruncated` giving the full count and `capturesTruncated: true` on the result |
| Replacements in one preview | 1,000 |
| Changed files in one preview | 20 |
| One changed file | 256 KiB |
| Stored before and after text, all files together | 1 MiB |
| Preview diff | 64 KiB |
| ast-grep output | 1 MiB of stdout; any stderr output fails the call |

## Requirements

ast-grep 0.51.0 or newer on `PATH` (`brew install ast-grep`, `cargo install ast-grep`, or `npm i -g @ast-grep/cli`). It was built and checked against 0.51.0. The mod checks the shape of every JSON field it reads, so an incompatible output format fails with `CLI_OUTPUT` rather than producing a wrong rewrite.

## Limitations

- One pattern per call; no YAML rules, constraints or transforms (cut for the first version).
- No context lines around search matches.
- No pagination: a search returns at most 200 matches; narrow the paths or globs for more.
- The diff is exact but not minimal for nearby replacements.
- A partial apply is not rolled back. Claude Code's own file history (rewind) may hold the earlier content; the mod keeps no copy of its own once the apply ends.
- A reload during an apply leaves an `interrupted` record listing what was known about each file; the mod never resumes it. `/ast-grep discard` clears it. If the old copy of the module still has a Write in flight at that moment (the engine may let it finish), that Write can land after the record was discarded; its file is then changed with no report. Check the files the record listed before discarding it.
- Tools are refused in subagents.
- On Claude Code 2.1.310 the built-in Edit accepted a file the mod had just written without a fresh Read (the Write call refreshes the engine's record of the file), even though the conversation never saw the new content. The apply result tells the model to Read first anyway.
- Checked live on Claude Code 2.1.310 in headless sessions (search, preview, apply on CRLF, non-ASCII and no-final-newline files; a stale target; a refused write) and interactively: declining the first file's Write prompt reported `WRITE_DENIED` with 0 files written and the next `unstarted`, and kept the preview pending; applying the same id again and approving wrote every file. The terminal prompt offers no way to edit the proposed content ("Tab to amend" adds a note to the approval), so `userModified` is covered by the test kit only (an IDE diff view may set it). In two live runs that note never reached the model: the engine hands the plugin's Write call no trace of it, so the apply result can't carry it. The test kit also covers a second apply or a discard during an apply (`BUSY`), `/clear` or a directory change right before a write, and `/ast-grep off` during a preview or an apply.
- A reload during an apply (the `interrupted` record) is not tested. On 2.1.310 a file-save hot reload of a `--plugin-dir` folder, made while an apply waited on its Write prompt, was held until the turn ended (the apply wrote 2 of 2 first), so that path was not reached live.

## Install

```sh
claude plugin marketplace add chrisvaillancourt/claude-ast-grep
claude plugin install ast-grep@ast-grep --scope user
```

Or from inside Claude Code: `/plugin install ast-grep --marketplace chrisvaillancourt/claude-ast-grep`.

To work on it locally, add your clone as the marketplace instead (`claude plugin marketplace add <path to clone>`). The plugin is read from that folder; after editing, run `/reload-plugins`.

## Update

```sh
claude plugin marketplace update ast-grep
claude plugin update ast-grep@ast-grep
```

Then restart Claude Code.

## Develop

```sh
scripts/check.sh
scripts/capture-corpus.sh   # re-record the ast-grep outputs the tests replay
```

`check.sh` runs `claude plugin validate .`, `claude plugin test .` and a TypeScript check. The CLI tests replay real ast-grep 0.51.0 outputs recorded in `hooks/corpus.ts`. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

## License

MIT. See [LICENSE](LICENSE).
