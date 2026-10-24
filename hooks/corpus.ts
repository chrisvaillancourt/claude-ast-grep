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
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"src/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/d.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\".hidden.ts\",\"lines\":\"foo(5)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"5\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
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
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"file\":\"src/a.ts\",\"lines\":\"const a = foo(1)\",\"charCount\":{\"leading\":10,\"trailing\":0},\"replacement\":\"bar(1)\",\"replacementOffsets\":{\"start\":10,\"end\":16},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"1\",\"range\":{\"byteOffset\":{\"start\":14,\"end\":15},\"start\":{\"line\":0,\"column\":14},\"end\":{\"line\":0,\"column\":15}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(1)\",\"range\":{\"byteOffset\":{\"start\":10,\"end\":16},\"start\":{\"line\":0,\"column\":10},\"end\":{\"line\":0,\"column\":16}},\"style\":\"primary\"}]},{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"file\":\"src/a.ts\",\"lines\":\"foo(2)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(2)\",\"replacementOffsets\":{\"start\":17,\"end\":23},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"2\",\"range\":{\"byteOffset\":{\"start\":21,\"end\":22},\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(2)\",\"range\":{\"byteOffset\":{\"start\":17,\"end\":23},\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/d.ts\",\"lines\":\"foo(4)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(4)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"4\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(4)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]},{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\".hidden.ts\",\"lines\":\"foo(5)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(5)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"5\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
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
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(6)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"src/.cache/e.ts\",\"lines\":\"foo(6)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"6\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(6)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
      "stderr": "",
      "isStdoutTruncated": false,
      "isStderrTruncated": false
    }
  },
  {
    "name": "stdin-hidden",
    "language": "typescript",
    "pattern": "foo($A)",
    "fix": "bar($A)",
    "maxResults": 1001,
    "paths": [],
    "stdin": "foo(5)\n",
    "result": {
      "exitCode": 0,
      "stdout": "[{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"file\":\"STDIN\",\"lines\":\"foo(5)\",\"charCount\":{\"leading\":0,\"trailing\":0},\"replacement\":\"bar(5)\",\"replacementOffsets\":{\"start\":0,\"end\":6},\"language\":\"TypeScript\",\"metaVariables\":{\"single\":{\"A\":{\"text\":\"5\",\"range\":{\"byteOffset\":{\"start\":4,\"end\":5},\"start\":{\"line\":0,\"column\":4},\"end\":{\"line\":0,\"column\":5}}}},\"multi\":{},\"transformed\":{}},\"ruleId\":\"mod\",\"severity\":\"hint\",\"note\":null,\"message\":\"\",\"labels\":[{\"text\":\"foo(5)\",\"range\":{\"byteOffset\":{\"start\":0,\"end\":6},\"start\":{\"line\":0,\"column\":0},\"end\":{\"line\":0,\"column\":6}},\"style\":\"primary\"}]}]\n",
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
