import bodyParser from 'body-parser'
import express from 'express'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { fromYAML, toJSON, toYAML } from '../src/lib/formatter'

interface AppConfig {
  sourceDir: string
  resources: Array<{
    name: string
    file: string
    type: 'json' | 'yaml'
  }>
}

function loadConfig() {
  try {
    return require('../config.json') as AppConfig
  } catch (e) {
    return require('../config.sample.json') as AppConfig
  }
}

function resolvePath(sourceDir: string, filename: string) {
  return path.resolve(__dirname, '..', sourceDir, filename)
}

const router = express.Router()

router.use(bodyParser.json({ limit: '50mb' }))

router
  .route('/data')
  .get(async (_, res) => {
    const config = loadConfig()

    const bundle = (await Promise.all(
      config.resources.map(resource => {
        const filePath = resolvePath(config.sourceDir, resource.file)

        return util.promisify(fs.readFile)(filePath, {
          encoding: 'utf-8',
        })
      }),
    ))
      .map(value => fromYAML(value))
      .reduce(
        (data, value, index) => ({
          ...data,
          ...{ [config.resources[index].name]: value },
        }),
        {},
      )

    res.json({ langs: config.resources.map(resource => resource.name), bundle })
  })
  .post(async (req, res) => {
    const data = req.body
    const config = loadConfig()

    await config.resources.map(resource => {
      const filePath = resolvePath(config.sourceDir, resource.file)

      const bundle = data[resource.name]

      if (bundle == null) {
        throw new Error(`Data "${resource.name}" does not exist`)
      }

      const content = resource.type === 'json' ? toJSON(bundle) : toYAML(bundle)

      return util.promisify(fs.writeFile)(filePath, content)
    })
    res.json({ ok: true })
  })

export { router as default }
