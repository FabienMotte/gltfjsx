#!/usr/bin/env node
'use strict'
import meow from 'meow'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import gltfjsx from './src/gltfjsx.js'
import { readPackageUpSync } from 'read-pkg-up'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cli = meow(
  `
	Usage
	  $ npx gltfjsx [Model.glb] [options]

	Options
    --output, -o        Output file name/path
    --types, -t         Add Typescript definitions
    --keepnames, -k     Keep original names
    --keepgroups, -K    Keep (empty) groups, disable pruning
    --meta, -m          Include metadata (as userData)
    --shadows, s        Let meshes cast and receive shadows
    --printwidth, w     Prettier printWidth (default: 120)
    --precision, -p     Number of fractional digits (default: 2)
    --draco, -d         Draco binary path
    --root, -r          Sets directory from which .gltf file is served
    --instance, -i      Instance re-occuring geometry
    --instanceall, -I   Instance every geometry (for cheaper re-use)
    --transform, -T     Transform the asset for the web (draco, prune, resize)
      --resolution, -R  Transform resolution for texture resizing (default: 1024)
      --simplify, -S    Transform simplification (default: false) (experimental!)
        --weld          Weld tolerance (default: 0.0001)
        --ratio         Simplifier ratio (default: 0.75)
        --error         Simplifier error threshold (default: 0.001)
    --debug, -D         Debug output
`,
  {
    importMeta: import.meta,
    flags: {
      output: { type: 'string', alias: 'o' },
      types: { type: 'boolean', alias: 't' },
      keepnames: { type: 'boolean', alias: 'k' },
      keepgroups: { type: 'boolean', alias: 'K' },
      shadows: { type: 'boolean', alias: 's' },
      printwidth: { type: 'number', alias: 'p', default: 1000 },
      meta: { type: 'boolean', alias: 'm' },
      precision: { type: 'number', alias: 'p', default: 2 },
      draco: { type: 'string', alias: 'd' },
      root: { type: 'string', alias: 'r' },
      instance: { type: 'boolean', alias: 'i' },
      instanceall: { type: 'boolean', alias: 'I' },
      transform: { type: 'boolean', alias: 'T' },
      resolution: { type: 'number', alias: 'R', default: 1024 },
      simplify: { type: 'boolean', alias: 'S', default: false },
      weld: { type: 'number', default: 0.0001 },
      ratio: { type: 'number', default: 0.75 },
      error: { type: 'number', default: 0.001 },
      debug: { type: 'boolean', alias: 'D' },
    },
  }
)

const { packageJson } = readPackageUpSync({ cwd: __dirname, normalize: false })

if (cli.input.length === 0) {
  console.log(cli.help)
} else {
  const config = {
    ...cli.flags,
    header: `Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@${packageJson.version} ${process.argv.slice(2).join(' ')}`,
  }
  const file = cli.input[0]
  const filePath = path.resolve(__dirname, file)
  let nameExt = file.match(/[-_\w]+[.][\w]+$/i)[0]
  let name = nameExt.split('.').slice(0, -1).join('.')
  const output = path.join(config.output, name.charAt(0).toUpperCase() + name.slice(1) + (config.types ? '.tsx' : '.jsx'))
  const showLog = (log) => {
    console.info('log:', log)
  }
  try {
    const response = await gltfjsx(file, output, { ...config, showLog, timeout: 0, delay: 1 })
  } catch (e) {
    console.error(e)
  }
}
