// Recorded by scripts/capture-corpus.sh with ast-grep 0.51.0. Do not edit by hand: re-run the script.
import type { CorpusCase } from '../types'

export const CORPUS_VERSION = "ast-grep 0.51.0"

export const CORPUS: CorpusCase[] = [
  {
    "name": "search-basic",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 51,
    "paths": [
      "."
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"src/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/d.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "search-basic-max3",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 3,
    "paths": [
      "."
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"src/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/d.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "search-multi",
    "language": "typescript",
    "pattern": "foo($$$ARGS)",
    "maxResults": 51,
    "paths": [
      "src"
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{},\"multi\":{\"ARGS\":[{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}]},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"src/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{},\"multi\":{\"ARGS\":[{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}]},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/d.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{},\"multi\":{\"ARGS\":[{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}]},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(x, y)\",\"range\":{\"byteOffset\":{\"start\":25,\"end\":34},\"start\":{\"line\":1,\"column\":10},\"end\":{\"line\":1,\"column\":19}},\"file\":\"src/b.ts\",\"lines\":\"const b = foo(x, y)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{},\"multi\":{\"ARGS\":[{\"text\":\"x\",\"range\":{\"byteOffset\":{\"start\":29,\"end\":30},\"start\":{\"line\":1,\"column\":14},\"end\":{\"line\":1,\"column\":15}}},{\"text\":\",\",\"range\":{\"byteOffset\":{\"start\":30,\"end\":31},\"start\":{\"line\":1,\"column\":15},\"end\":{\"line\":1,\"column\":16}}},{\"text\":\"y\",\"range\":{\"byteOffset\":{\"start\":32,\"end\":33},\"start\":{\"line\":1,\"column\":17},\"end\":{\"line\":1,\"column\":18}}}]},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(x, y)\",\"range\":{\"byteOffset\":{\"start\":25,\"end\":34},\"start\":{\"line\":1,\"column\":10},\"end\":{\"line\":1,\"column\":19}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "search-max",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 1,
    "paths": [
      "src/a.ts"
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "no-match",
    "language": "typescript",
    "pattern": "nothere($A)",
    "maxResults": 51,
    "paths": [
      "."
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "invalid-pattern",
    "language": "typescript",
    "pattern": "function {{{",
    "maxResults": 51,
    "paths": [
      "."
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 8,
      "stdout": "",
      "stderr": "Error: Cannot parse rule INLINE_RULES\nHelp: The file is not a valid ast-grep rule. Please refer to doc and fix the error.\nSee also: https://ast-grep.github.io/guide/rule-config.html\n\n✖ Caused by\n╰▻ Rule must specify a set of AST kinds to match. Try adding `kind` rule.\n\n",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "missing-path",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 51,
    "paths": [
      "nope.ts"
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[]\n",
      "stderr": "ERROR: nope.ts: No such file or directory (os error 2)\n",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "bad-language",
    "language": "cobol",
    "pattern": "foo($A)",
    "maxResults": 51,
    "paths": [
      "."
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 8,
      "stdout": "",
      "stderr": "Error: Cannot parse rule INLINE_RULES\nHelp: The file is not a valid ast-grep rule. Please refer to doc and fix the error.\nSee also: https://ast-grep.github.io/guide/rule-config.html\n\n✖ Caused by\n╰▻ Fail to parse yaml as RuleConfig\n╰▻ error: line 1 column 24: data did not match any variant of untagged enum SgLang\n --> <input>:1:24\n  |\n1 | {\"id\":\"mod\",\"language\":\"cobol\",\"severity\":\"hint\",\"rule\":{\"pattern\":\"foo($A)\"}}\n  |                        ^ data did not match any variant of untagged enum SgLang\n╰▻ data did not match any variant of untagged enum SgLang at line 1, column 24\n\n",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "discover",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [
      "src"
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"replacement\":\"bar(1)\",\"replacementOffsets\":{\"start\":10,\"end\":16},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"src/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(2)\",\"replacementOffsets\":{\"start\":17,\"end\":23},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/d.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(4)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "discover-root",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [
      "."
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"replacement\":\"bar(1)\",\"replacementOffsets\":{\"start\":10,\"end\":16},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"src/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(2)\",\"replacementOffsets\":{\"start\":17,\"end\":23},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/d.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(4)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "search-hidden-dir",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 51,
    "paths": [
      "src/.cache"
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(6)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/.cache/e.ts\",\"lines\":\"foo(6)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"6\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(6)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "limit",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 2,
    "paths": [
      "hiddenScope",
      "visibleScope"
    ],
    "globs": [
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"visibleScope/a.ts\",\"lines\":\"foo(1)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"visibleScope/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":11,\"end\":12},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "limit-globs",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 2,
    "paths": [
      "hiddenScope",
      "visibleScope"
    ],
    "globs": [
      "*.ts",
      "!.*"
    ],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"visibleScope/a.ts\",\"lines\":\"foo(1)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"visibleScope/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":11,\"end\":12},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "raw-hidden-only",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 2,
    "paths": [
      "hiddenScope"
    ],
    "globs": [],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(1)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":11,\"end\":12},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "raw-root",
    "language": "typescript",
    "pattern": "foo($A)",
    "maxResults": 51,
    "paths": [
      "."
    ],
    "globs": [],
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(1)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":11,\"end\":12},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(3)\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":20},\"start\":{\"line\":2,\"column\":0},\"end\":{\"line\":2,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(3)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"3\",\"range\":{\"byteOffset\":{\"start\":18,\"end\":19},\"start\":{\"line\":2,\"column\":4},\"end\":{\"line\":2,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(3)\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":20},\"start\":{\"line\":2,\"column\":0},\"end\":{\"line\":2,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":27},\"start\":{\"line\":3,\"column\":0},\"end\":{\"line\":3,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":25,\"end\":26},\"start\":{\"line\":3,\"column\":4},\"end\":{\"line\":3,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":27},\"start\":{\"line\":3,\"column\":0},\"end\":{\"line\":3,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":28,\"end\":34},\"start\":{\"line\":4,\"column\":0},\"end\":{\"line\":4,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(5)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"5\",\"range\":{\"byteOffset\":{\"start\":32,\"end\":33},\"start\":{\"line\":4,\"column\":4},\"end\":{\"line\":4,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":28,\"end\":34},\"start\":{\"line\":4,\"column\":0},\"end\":{\"line\":4,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(6)\",\"range\":{\"byteOffset\":{\"start\":35,\"end\":41},\"start\":{\"line\":5,\"column\":0},\"end\":{\"line\":5,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(6)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"6\",\"range\":{\"byteOffset\":{\"start\":39,\"end\":40},\"start\":{\"line\":5,\"column\":4},\"end\":{\"line\":5,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(6)\",\"range\":{\"byteOffset\":{\"start\":35,\"end\":41},\"start\":{\"line\":5,\"column\":0},\"end\":{\"line\":5,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(7)\",\"range\":{\"byteOffset\":{\"start\":42,\"end\":48},\"start\":{\"line\":6,\"column\":0},\"end\":{\"line\":6,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(7)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"7\",\"range\":{\"byteOffset\":{\"start\":46,\"end\":47},\"start\":{\"line\":6,\"column\":4},\"end\":{\"line\":6,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(7)\",\"range\":{\"byteOffset\":{\"start\":42,\"end\":48},\"start\":{\"line\":6,\"column\":0},\"end\":{\"line\":6,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(8)\",\"range\":{\"byteOffset\":{\"start\":49,\"end\":55},\"start\":{\"line\":7,\"column\":0},\"end\":{\"line\":7,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(8)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"8\",\"range\":{\"byteOffset\":{\"start\":53,\"end\":54},\"start\":{\"line\":7,\"column\":4},\"end\":{\"line\":7,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(8)\",\"range\":{\"byteOffset\":{\"start\":49,\"end\":55},\"start\":{\"line\":7,\"column\":0},\"end\":{\"line\":7,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(9)\",\"range\":{\"byteOffset\":{\"start\":56,\"end\":62},\"start\":{\"line\":8,\"column\":0},\"end\":{\"line\":8,\"column\":6}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(9)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"9\",\"range\":{\"byteOffset\":{\"start\":60,\"end\":61},\"start\":{\"line\":8,\"column\":4},\"end\":{\"line\":8,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(9)\",\"range\":{\"byteOffset\":{\"start\":56,\"end\":62},\"start\":{\"line\":8,\"column\":0},\"end\":{\"line\":8,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(10)\",\"range\":{\"byteOffset\":{\"start\":63,\"end\":70},\"start\":{\"line\":9,\"column\":0},\"end\":{\"line\":9,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(10)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"10\",\"range\":{\"byteOffset\":{\"start\":67,\"end\":69},\"start\":{\"line\":9,\"column\":4},\"end\":{\"line\":9,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(10)\",\"range\":{\"byteOffset\":{\"start\":63,\"end\":70},\"start\":{\"line\":9,\"column\":0},\"end\":{\"line\":9,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(11)\",\"range\":{\"byteOffset\":{\"start\":71,\"end\":78},\"start\":{\"line\":10,\"column\":0},\"end\":{\"line\":10,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(11)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"11\",\"range\":{\"byteOffset\":{\"start\":75,\"end\":77},\"start\":{\"line\":10,\"column\":4},\"end\":{\"line\":10,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(11)\",\"range\":{\"byteOffset\":{\"start\":71,\"end\":78},\"start\":{\"line\":10,\"column\":0},\"end\":{\"line\":10,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(12)\",\"range\":{\"byteOffset\":{\"start\":79,\"end\":86},\"start\":{\"line\":11,\"column\":0},\"end\":{\"line\":11,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(12)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"12\",\"range\":{\"byteOffset\":{\"start\":83,\"end\":85},\"start\":{\"line\":11,\"column\":4},\"end\":{\"line\":11,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(12)\",\"range\":{\"byteOffset\":{\"start\":79,\"end\":86},\"start\":{\"line\":11,\"column\":0},\"end\":{\"line\":11,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(13)\",\"range\":{\"byteOffset\":{\"start\":87,\"end\":94},\"start\":{\"line\":12,\"column\":0},\"end\":{\"line\":12,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(13)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"13\",\"range\":{\"byteOffset\":{\"start\":91,\"end\":93},\"start\":{\"line\":12,\"column\":4},\"end\":{\"line\":12,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(13)\",\"range\":{\"byteOffset\":{\"start\":87,\"end\":94},\"start\":{\"line\":12,\"column\":0},\"end\":{\"line\":12,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(14)\",\"range\":{\"byteOffset\":{\"start\":95,\"end\":102},\"start\":{\"line\":13,\"column\":0},\"end\":{\"line\":13,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(14)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"14\",\"range\":{\"byteOffset\":{\"start\":99,\"end\":101},\"start\":{\"line\":13,\"column\":4},\"end\":{\"line\":13,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(14)\",\"range\":{\"byteOffset\":{\"start\":95,\"end\":102},\"start\":{\"line\":13,\"column\":0},\"end\":{\"line\":13,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(15)\",\"range\":{\"byteOffset\":{\"start\":103,\"end\":110},\"start\":{\"line\":14,\"column\":0},\"end\":{\"line\":14,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(15)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"15\",\"range\":{\"byteOffset\":{\"start\":107,\"end\":109},\"start\":{\"line\":14,\"column\":4},\"end\":{\"line\":14,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(15)\",\"range\":{\"byteOffset\":{\"start\":103,\"end\":110},\"start\":{\"line\":14,\"column\":0},\"end\":{\"line\":14,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(16)\",\"range\":{\"byteOffset\":{\"start\":111,\"end\":118},\"start\":{\"line\":15,\"column\":0},\"end\":{\"line\":15,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(16)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"16\",\"range\":{\"byteOffset\":{\"start\":115,\"end\":117},\"start\":{\"line\":15,\"column\":4},\"end\":{\"line\":15,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(16)\",\"range\":{\"byteOffset\":{\"start\":111,\"end\":118},\"start\":{\"line\":15,\"column\":0},\"end\":{\"line\":15,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(17)\",\"range\":{\"byteOffset\":{\"start\":119,\"end\":126},\"start\":{\"line\":16,\"column\":0},\"end\":{\"line\":16,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(17)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"17\",\"range\":{\"byteOffset\":{\"start\":123,\"end\":125},\"start\":{\"line\":16,\"column\":4},\"end\":{\"line\":16,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(17)\",\"range\":{\"byteOffset\":{\"start\":119,\"end\":126},\"start\":{\"line\":16,\"column\":0},\"end\":{\"line\":16,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(18)\",\"range\":{\"byteOffset\":{\"start\":127,\"end\":134},\"start\":{\"line\":17,\"column\":0},\"end\":{\"line\":17,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(18)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"18\",\"range\":{\"byteOffset\":{\"start\":131,\"end\":133},\"start\":{\"line\":17,\"column\":4},\"end\":{\"line\":17,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(18)\",\"range\":{\"byteOffset\":{\"start\":127,\"end\":134},\"start\":{\"line\":17,\"column\":0},\"end\":{\"line\":17,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(19)\",\"range\":{\"byteOffset\":{\"start\":135,\"end\":142},\"start\":{\"line\":18,\"column\":0},\"end\":{\"line\":18,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(19)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"19\",\"range\":{\"byteOffset\":{\"start\":139,\"end\":141},\"start\":{\"line\":18,\"column\":4},\"end\":{\"line\":18,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(19)\",\"range\":{\"byteOffset\":{\"start\":135,\"end\":142},\"start\":{\"line\":18,\"column\":0},\"end\":{\"line\":18,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(20)\",\"range\":{\"byteOffset\":{\"start\":143,\"end\":150},\"start\":{\"line\":19,\"column\":0},\"end\":{\"line\":19,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(20)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"20\",\"range\":{\"byteOffset\":{\"start\":147,\"end\":149},\"start\":{\"line\":19,\"column\":4},\"end\":{\"line\":19,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(20)\",\"range\":{\"byteOffset\":{\"start\":143,\"end\":150},\"start\":{\"line\":19,\"column\":0},\"end\":{\"line\":19,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(21)\",\"range\":{\"byteOffset\":{\"start\":151,\"end\":158},\"start\":{\"line\":20,\"column\":0},\"end\":{\"line\":20,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(21)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"21\",\"range\":{\"byteOffset\":{\"start\":155,\"end\":157},\"start\":{\"line\":20,\"column\":4},\"end\":{\"line\":20,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(21)\",\"range\":{\"byteOffset\":{\"start\":151,\"end\":158},\"start\":{\"line\":20,\"column\":0},\"end\":{\"line\":20,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(22)\",\"range\":{\"byteOffset\":{\"start\":159,\"end\":166},\"start\":{\"line\":21,\"column\":0},\"end\":{\"line\":21,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(22)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"22\",\"range\":{\"byteOffset\":{\"start\":163,\"end\":165},\"start\":{\"line\":21,\"column\":4},\"end\":{\"line\":21,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(22)\",\"range\":{\"byteOffset\":{\"start\":159,\"end\":166},\"start\":{\"line\":21,\"column\":0},\"end\":{\"line\":21,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(23)\",\"range\":{\"byteOffset\":{\"start\":167,\"end\":174},\"start\":{\"line\":22,\"column\":0},\"end\":{\"line\":22,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(23)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"23\",\"range\":{\"byteOffset\":{\"start\":171,\"end\":173},\"start\":{\"line\":22,\"column\":4},\"end\":{\"line\":22,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(23)\",\"range\":{\"byteOffset\":{\"start\":167,\"end\":174},\"start\":{\"line\":22,\"column\":0},\"end\":{\"line\":22,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(24)\",\"range\":{\"byteOffset\":{\"start\":175,\"end\":182},\"start\":{\"line\":23,\"column\":0},\"end\":{\"line\":23,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(24)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"24\",\"range\":{\"byteOffset\":{\"start\":179,\"end\":181},\"start\":{\"line\":23,\"column\":4},\"end\":{\"line\":23,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(24)\",\"range\":{\"byteOffset\":{\"start\":175,\"end\":182},\"start\":{\"line\":23,\"column\":0},\"end\":{\"line\":23,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(25)\",\"range\":{\"byteOffset\":{\"start\":183,\"end\":190},\"start\":{\"line\":24,\"column\":0},\"end\":{\"line\":24,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(25)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"25\",\"range\":{\"byteOffset\":{\"start\":187,\"end\":189},\"start\":{\"line\":24,\"column\":4},\"end\":{\"line\":24,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(25)\",\"range\":{\"byteOffset\":{\"start\":183,\"end\":190},\"start\":{\"line\":24,\"column\":0},\"end\":{\"line\":24,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(26)\",\"range\":{\"byteOffset\":{\"start\":191,\"end\":198},\"start\":{\"line\":25,\"column\":0},\"end\":{\"line\":25,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(26)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"26\",\"range\":{\"byteOffset\":{\"start\":195,\"end\":197},\"start\":{\"line\":25,\"column\":4},\"end\":{\"line\":25,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(26)\",\"range\":{\"byteOffset\":{\"start\":191,\"end\":198},\"start\":{\"line\":25,\"column\":0},\"end\":{\"line\":25,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(27)\",\"range\":{\"byteOffset\":{\"start\":199,\"end\":206},\"start\":{\"line\":26,\"column\":0},\"end\":{\"line\":26,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(27)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"27\",\"range\":{\"byteOffset\":{\"start\":203,\"end\":205},\"start\":{\"line\":26,\"column\":4},\"end\":{\"line\":26,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(27)\",\"range\":{\"byteOffset\":{\"start\":199,\"end\":206},\"start\":{\"line\":26,\"column\":0},\"end\":{\"line\":26,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(28)\",\"range\":{\"byteOffset\":{\"start\":207,\"end\":214},\"start\":{\"line\":27,\"column\":0},\"end\":{\"line\":27,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(28)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"28\",\"range\":{\"byteOffset\":{\"start\":211,\"end\":213},\"start\":{\"line\":27,\"column\":4},\"end\":{\"line\":27,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(28)\",\"range\":{\"byteOffset\":{\"start\":207,\"end\":214},\"start\":{\"line\":27,\"column\":0},\"end\":{\"line\":27,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(29)\",\"range\":{\"byteOffset\":{\"start\":215,\"end\":222},\"start\":{\"line\":28,\"column\":0},\"end\":{\"line\":28,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(29)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"29\",\"range\":{\"byteOffset\":{\"start\":219,\"end\":221},\"start\":{\"line\":28,\"column\":4},\"end\":{\"line\":28,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(29)\",\"range\":{\"byteOffset\":{\"start\":215,\"end\":222},\"start\":{\"line\":28,\"column\":0},\"end\":{\"line\":28,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(30)\",\"range\":{\"byteOffset\":{\"start\":223,\"end\":230},\"start\":{\"line\":29,\"column\":0},\"end\":{\"line\":29,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(30)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"30\",\"range\":{\"byteOffset\":{\"start\":227,\"end\":229},\"start\":{\"line\":29,\"column\":4},\"end\":{\"line\":29,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(30)\",\"range\":{\"byteOffset\":{\"start\":223,\"end\":230},\"start\":{\"line\":29,\"column\":0},\"end\":{\"line\":29,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(31)\",\"range\":{\"byteOffset\":{\"start\":231,\"end\":238},\"start\":{\"line\":30,\"column\":0},\"end\":{\"line\":30,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(31)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"31\",\"range\":{\"byteOffset\":{\"start\":235,\"end\":237},\"start\":{\"line\":30,\"column\":4},\"end\":{\"line\":30,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(31)\",\"range\":{\"byteOffset\":{\"start\":231,\"end\":238},\"start\":{\"line\":30,\"column\":0},\"end\":{\"line\":30,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(32)\",\"range\":{\"byteOffset\":{\"start\":239,\"end\":246},\"start\":{\"line\":31,\"column\":0},\"end\":{\"line\":31,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(32)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"32\",\"range\":{\"byteOffset\":{\"start\":243,\"end\":245},\"start\":{\"line\":31,\"column\":4},\"end\":{\"line\":31,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(32)\",\"range\":{\"byteOffset\":{\"start\":239,\"end\":246},\"start\":{\"line\":31,\"column\":0},\"end\":{\"line\":31,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(33)\",\"range\":{\"byteOffset\":{\"start\":247,\"end\":254},\"start\":{\"line\":32,\"column\":0},\"end\":{\"line\":32,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(33)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"33\",\"range\":{\"byteOffset\":{\"start\":251,\"end\":253},\"start\":{\"line\":32,\"column\":4},\"end\":{\"line\":32,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(33)\",\"range\":{\"byteOffset\":{\"start\":247,\"end\":254},\"start\":{\"line\":32,\"column\":0},\"end\":{\"line\":32,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(34)\",\"range\":{\"byteOffset\":{\"start\":255,\"end\":262},\"start\":{\"line\":33,\"column\":0},\"end\":{\"line\":33,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(34)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"34\",\"range\":{\"byteOffset\":{\"start\":259,\"end\":261},\"start\":{\"line\":33,\"column\":4},\"end\":{\"line\":33,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(34)\",\"range\":{\"byteOffset\":{\"start\":255,\"end\":262},\"start\":{\"line\":33,\"column\":0},\"end\":{\"line\":33,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(35)\",\"range\":{\"byteOffset\":{\"start\":263,\"end\":270},\"start\":{\"line\":34,\"column\":0},\"end\":{\"line\":34,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(35)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"35\",\"range\":{\"byteOffset\":{\"start\":267,\"end\":269},\"start\":{\"line\":34,\"column\":4},\"end\":{\"line\":34,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(35)\",\"range\":{\"byteOffset\":{\"start\":263,\"end\":270},\"start\":{\"line\":34,\"column\":0},\"end\":{\"line\":34,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(36)\",\"range\":{\"byteOffset\":{\"start\":271,\"end\":278},\"start\":{\"line\":35,\"column\":0},\"end\":{\"line\":35,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(36)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"36\",\"range\":{\"byteOffset\":{\"start\":275,\"end\":277},\"start\":{\"line\":35,\"column\":4},\"end\":{\"line\":35,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(36)\",\"range\":{\"byteOffset\":{\"start\":271,\"end\":278},\"start\":{\"line\":35,\"column\":0},\"end\":{\"line\":35,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(37)\",\"range\":{\"byteOffset\":{\"start\":279,\"end\":286},\"start\":{\"line\":36,\"column\":0},\"end\":{\"line\":36,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(37)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"37\",\"range\":{\"byteOffset\":{\"start\":283,\"end\":285},\"start\":{\"line\":36,\"column\":4},\"end\":{\"line\":36,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(37)\",\"range\":{\"byteOffset\":{\"start\":279,\"end\":286},\"start\":{\"line\":36,\"column\":0},\"end\":{\"line\":36,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(38)\",\"range\":{\"byteOffset\":{\"start\":287,\"end\":294},\"start\":{\"line\":37,\"column\":0},\"end\":{\"line\":37,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(38)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"38\",\"range\":{\"byteOffset\":{\"start\":291,\"end\":293},\"start\":{\"line\":37,\"column\":4},\"end\":{\"line\":37,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(38)\",\"range\":{\"byteOffset\":{\"start\":287,\"end\":294},\"start\":{\"line\":37,\"column\":0},\"end\":{\"line\":37,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(39)\",\"range\":{\"byteOffset\":{\"start\":295,\"end\":302},\"start\":{\"line\":38,\"column\":0},\"end\":{\"line\":38,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(39)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"39\",\"range\":{\"byteOffset\":{\"start\":299,\"end\":301},\"start\":{\"line\":38,\"column\":4},\"end\":{\"line\":38,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(39)\",\"range\":{\"byteOffset\":{\"start\":295,\"end\":302},\"start\":{\"line\":38,\"column\":0},\"end\":{\"line\":38,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(40)\",\"range\":{\"byteOffset\":{\"start\":303,\"end\":310},\"start\":{\"line\":39,\"column\":0},\"end\":{\"line\":39,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(40)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"40\",\"range\":{\"byteOffset\":{\"start\":307,\"end\":309},\"start\":{\"line\":39,\"column\":4},\"end\":{\"line\":39,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(40)\",\"range\":{\"byteOffset\":{\"start\":303,\"end\":310},\"start\":{\"line\":39,\"column\":0},\"end\":{\"line\":39,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(41)\",\"range\":{\"byteOffset\":{\"start\":311,\"end\":318},\"start\":{\"line\":40,\"column\":0},\"end\":{\"line\":40,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(41)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"41\",\"range\":{\"byteOffset\":{\"start\":315,\"end\":317},\"start\":{\"line\":40,\"column\":4},\"end\":{\"line\":40,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(41)\",\"range\":{\"byteOffset\":{\"start\":311,\"end\":318},\"start\":{\"line\":40,\"column\":0},\"end\":{\"line\":40,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(42)\",\"range\":{\"byteOffset\":{\"start\":319,\"end\":326},\"start\":{\"line\":41,\"column\":0},\"end\":{\"line\":41,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(42)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"42\",\"range\":{\"byteOffset\":{\"start\":323,\"end\":325},\"start\":{\"line\":41,\"column\":4},\"end\":{\"line\":41,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(42)\",\"range\":{\"byteOffset\":{\"start\":319,\"end\":326},\"start\":{\"line\":41,\"column\":0},\"end\":{\"line\":41,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(43)\",\"range\":{\"byteOffset\":{\"start\":327,\"end\":334},\"start\":{\"line\":42,\"column\":0},\"end\":{\"line\":42,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(43)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"43\",\"range\":{\"byteOffset\":{\"start\":331,\"end\":333},\"start\":{\"line\":42,\"column\":4},\"end\":{\"line\":42,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(43)\",\"range\":{\"byteOffset\":{\"start\":327,\"end\":334},\"start\":{\"line\":42,\"column\":0},\"end\":{\"line\":42,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(44)\",\"range\":{\"byteOffset\":{\"start\":335,\"end\":342},\"start\":{\"line\":43,\"column\":0},\"end\":{\"line\":43,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(44)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"44\",\"range\":{\"byteOffset\":{\"start\":339,\"end\":341},\"start\":{\"line\":43,\"column\":4},\"end\":{\"line\":43,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(44)\",\"range\":{\"byteOffset\":{\"start\":335,\"end\":342},\"start\":{\"line\":43,\"column\":0},\"end\":{\"line\":43,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(45)\",\"range\":{\"byteOffset\":{\"start\":343,\"end\":350},\"start\":{\"line\":44,\"column\":0},\"end\":{\"line\":44,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(45)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"45\",\"range\":{\"byteOffset\":{\"start\":347,\"end\":349},\"start\":{\"line\":44,\"column\":4},\"end\":{\"line\":44,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(45)\",\"range\":{\"byteOffset\":{\"start\":343,\"end\":350},\"start\":{\"line\":44,\"column\":0},\"end\":{\"line\":44,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(46)\",\"range\":{\"byteOffset\":{\"start\":351,\"end\":358},\"start\":{\"line\":45,\"column\":0},\"end\":{\"line\":45,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(46)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"46\",\"range\":{\"byteOffset\":{\"start\":355,\"end\":357},\"start\":{\"line\":45,\"column\":4},\"end\":{\"line\":45,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(46)\",\"range\":{\"byteOffset\":{\"start\":351,\"end\":358},\"start\":{\"line\":45,\"column\":0},\"end\":{\"line\":45,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(47)\",\"range\":{\"byteOffset\":{\"start\":359,\"end\":366},\"start\":{\"line\":46,\"column\":0},\"end\":{\"line\":46,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(47)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"47\",\"range\":{\"byteOffset\":{\"start\":363,\"end\":365},\"start\":{\"line\":46,\"column\":4},\"end\":{\"line\":46,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(47)\",\"range\":{\"byteOffset\":{\"start\":359,\"end\":366},\"start\":{\"line\":46,\"column\":0},\"end\":{\"line\":46,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(48)\",\"range\":{\"byteOffset\":{\"start\":367,\"end\":374},\"start\":{\"line\":47,\"column\":0},\"end\":{\"line\":47,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(48)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"48\",\"range\":{\"byteOffset\":{\"start\":371,\"end\":373},\"start\":{\"line\":47,\"column\":4},\"end\":{\"line\":47,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(48)\",\"range\":{\"byteOffset\":{\"start\":367,\"end\":374},\"start\":{\"line\":47,\"column\":0},\"end\":{\"line\":47,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(49)\",\"range\":{\"byteOffset\":{\"start\":375,\"end\":382},\"start\":{\"line\":48,\"column\":0},\"end\":{\"line\":48,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(49)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"49\",\"range\":{\"byteOffset\":{\"start\":379,\"end\":381},\"start\":{\"line\":48,\"column\":4},\"end\":{\"line\":48,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(49)\",\"range\":{\"byteOffset\":{\"start\":375,\"end\":382},\"start\":{\"line\":48,\"column\":0},\"end\":{\"line\":48,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(50)\",\"range\":{\"byteOffset\":{\"start\":383,\"end\":390},\"start\":{\"line\":49,\"column\":0},\"end\":{\"line\":49,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(50)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"50\",\"range\":{\"byteOffset\":{\"start\":387,\"end\":389},\"start\":{\"line\":49,\"column\":4},\"end\":{\"line\":49,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(50)\",\"range\":{\"byteOffset\":{\"start\":383,\"end\":390},\"start\":{\"line\":49,\"column\":0},\"end\":{\"line\":49,\"column\":7}},\"style\":\"primary\"}]},{\"text\":\"foo(51)\",\"range\":{\"byteOffset\":{\"start\":391,\"end\":398},\"start\":{\"line\":50,\"column\":0},\"end\":{\"line\":50,\"column\":7}},\"file\":\"hiddenScope/.hidden.ts\",\"lines\":\"foo(51)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"51\",\"range\":{\"byteOffset\":{\"start\":395,\"end\":397},\"start\":{\"line\":50,\"column\":4},\"end\":{\"line\":50,\"column\":6}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(51)\",\"range\":{\"byteOffset\":{\"start\":391,\"end\":398},\"start\":{\"line\":50,\"column\":0},\"end\":{\"line\":50,\"column\":7}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "stdin-a",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "const a = foo(1)\nfoo(2)\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"STDIN\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"replacement\":\"bar(1)\",\"replacementOffsets\":{\"start\":10,\"end\":16},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(2)\",\"replacementOffsets\":{\"start\":17,\"end\":23},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "stdin-d",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "foo(4)\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(4)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "unicode",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "const s = \"é😀\"; foo(1)\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":20,\"end\":26},\"start\":{\"line\":0,\"column\":16},\"end\":{\"line\":0,\"column\":22}},\"file\":\"STDIN\",\"lines\":\"const s = \\\"é😀\\\"; foo(1)\",\"charCount\":{\"leading\":16,\"trailing\":0},\"replacement\":\"bar(1)\",\"replacementOffsets\":{\"start\":20,\"end\":26},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":24,\"end\":25},\"start\":{\"line\":0,\"column\":20},\"end\":{\"line\":0,\"column\":21}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":20,\"end\":26},\"start\":{\"line\":0,\"column\":16},\"end\":{\"line\":0,\"column\":22}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "crlf",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "foo(1)\r\nconst x = 2\r\nfoo(3)\r\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(1)\\r\",\"charCount\":{\"leading\":0,\"trailing\":1},\"replacement\":\"bar(1)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(3)\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":27},\"start\":{\"line\":2,\"column\":0},\"end\":{\"line\":2,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(3)\\r\",\"charCount\":{\"leading\":0,\"trailing\":1},\"replacement\":\"bar(3)\",\"replacementOffsets\":{\"start\":21,\"end\":27},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"3\",\"range\":{\"byteOffset\":{\"start\":25,\"end\":26},\"start\":{\"line\":2,\"column\":4},\"end\":{\"line\":2,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(3)\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":27},\"start\":{\"line\":2,\"column\":0},\"end\":{\"line\":2,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "no-final-newline",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "const x = 1\nfoo(2)",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":12,\"end\":18},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(2)\",\"replacementOffsets\":{\"start\":12,\"end\":18},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":16,\"end\":17},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":12,\"end\":18},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "multiline",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar(\n  $A,\n)",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "foo(1)\nfoo(2)\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(1)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(\\n  1,\\n)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(\\n  2,\\n)\",\"replacementOffsets\":{\"start\":7,\"end\":13},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":11,\"end\":12},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":7,\"end\":13},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "empty-rewrite",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "foo(1);\nkeep();\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(1);\",\"charCount\":{\"leading\":0,\"trailing\":1},\"replacement\":\"\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "nested",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [],
    "globs": [],
    "stdin": "foo(foo(1))\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(foo(1))\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":11},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":11}},\"file\":\"STDIN\",\"lines\":\"foo(foo(1))\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(foo(1))\",\"replacementOffsets\":{\"start\":0,\"end\":11},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":10},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":10}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(foo(1))\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":11},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":11}},\"style\":\"primary\"}]},{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":10},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":10}},\"file\":\"STDIN\",\"lines\":\"foo(foo(1))\",\"charCount\":{\"leading\":4,\"trailing\":1},\"replacement\":\"bar(1)\",\"replacementOffsets\":{\"start\":4,\"end\":10},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":8,\"end\":9},\"start\":{\"line\":0,\"column\":8},\"end\":{\"line\":0,\"column\":9}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":10},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":10}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  }
]
