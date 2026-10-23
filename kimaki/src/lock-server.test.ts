import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterAll, expect, test } from 'vitest'

import { installShim } from './lock-server.ts'

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "kimaki shim's "))
afterAll(() => fs.rmSync(dataDir, { recursive: true, force: true }))

// The shim forwards its own args after the install's, so `-e <script> arg` prints them.
const run = (node: string) => installShim({ dataDir, command: [node, '-e', 'console.log(process.env.KIMAKI_DATA_DIR, process.argv.slice(1))'] })
  .then(() => promisify(execFile)(path.join(dataDir, 'bin', 'kimaki'), ["it's"], { timeout: 10_000 }))
  .then(({ stdout }) => stdout.replace(dataDir, '<dataDir>').trim())

test.skipIf(process.platform === 'win32')('the shim runs the Node of the bot, and node from PATH once an upgrade removed it', async () => {
  expect(await run(process.execPath)).toMatchInlineSnapshot(`"<dataDir> [ "it's" ]"`)
  // Homebrew deletes .../Cellar/node/<old version>/bin/node on `brew upgrade node`.
  expect(await run(path.join(dataDir, 'Cellar', 'node', '0.0.0', 'bin', 'node'))).toMatchInlineSnapshot(`"<dataDir> [ "it's" ]"`)
})
