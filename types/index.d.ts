export type Mode = 'on' | 'off'

/** The options in plugin.json's userConfig, parsed with defaults filled in. */
export type Config = {
  enabled: boolean
  alwaysLoaded: boolean
  /** The ast-grep executable: a name on PATH or an absolute path. */
  binary: string
  /** Time limit for each ast-grep process. */
  timeoutMs: number
}

/**
 * Where one file of a preview stands. `unstarted` before apply touches it;
 * `writing` is set in state right before its Write call, so a reload mid-write
 * leaves it there; the rest are outcomes read back from the file afterwards.
 */
export type FileStatus =
  | 'unstarted'
  | 'writing'
  | 'written'
  | 'refused'
  | 'failed'
  | 'not-written'
  | 'differs'
  | 'unknown'

export type PreviewFile = {
  /** Relative to the preview's root, `/`-separated. */
  path: string
  /** Absolute, symbolic links resolved: what is read, hashed and written. */
  abs: string
  before: string
  beforeHash: string
  after: string
  afterHash: string
  replacements: number
  status: FileStatus
  /** Why a file isn't `written`, in a sentence. */
  note?: string
}

export type Preview = {
  id: string
  sessionId: string
  /** The session's directory, symbolic links resolved, when the preview was made. */
  root: string
  createdAt: number
  expiresAt: number
  pattern: string
  rewrite: string
  language: string
  replacements: number
  files: PreviewFile[]
  /** The session epoch it was published under; it has authority only while that is still the session's. */
  epoch: number
  /**
   * `applying` while an apply owns it (`runId` names that apply); `interrupted`
   * once a reload or a failure inside the plugin ended an apply mid-way.
   */
  state: 'pending' | 'applying' | 'interrupted'
  runId: string | null
}

/** What the mod keeps for the session. Lives in $.state, so it survives a hot reload. */
export type Session = {
  /** A /ast-grep on|off override for this session; null follows the `enabled` option. */
  mode: Mode | null
  preview: Preview | null
  /** One line on the last apply's outcome, for /ast-grep status. */
  last: string | null
  /**
   * Bumped by every /ast-grep off. An operation captures it when it starts and
   * may publish or write only while it is unchanged, so off revokes work already
   * running and a later on never restores it.
   */
  epoch: number
}

/** One recorded ast-grep run (hooks/corpus.ts, written by scripts/capture-corpus.sh). */
export type CorpusCase = {
  name: string
  language: string
  pattern: string
  fix?: string
  maxResults: number
  paths: string[]
  /** Every `--globs` value of a path scan, the mod's `!.*` included. */
  globs: string[]
  stdin?: string
  result: {
    exitCode: number
    stdout: string
    stderr: string
    isStdoutTruncated: boolean
    isStderrTruncated: boolean
  }
}

declare module 'claude-code' {
  interface PluginState {
    'ast-grep': { session: Shaped<Session> }
  }
}
