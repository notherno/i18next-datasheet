import bodyParser from 'body-parser'
import express from 'express'
import fs from 'fs'
import path from 'path'
import util from 'util'

const router = express.Router()

router.use(bodyParser.json())

router
  .route('/data')
  .get(async (req, res) => {
    const langs = ['en', 'de', 'ja']
    const bundle = (await Promise.all(
      langs.map(lang => {
        return util.promisify(fs.readFile)(
          path.resolve('data', `${lang}.json`),
          {
            encoding: 'utf-8',
          },
        )
      }),
    ))
      .map(value => JSON.parse(value))
      .reduce(
        (data, value, index) => ({ ...data, ...{ [langs[index]]: value } }),
        {},
      )

    res.json({ langs, bundle })
  })
  .post(async (req, res) => {
    const data = req.body

    const langs = Object.keys(data)

    await langs.map(lang => {
      return util.promisify(fs.writeFile)(
        path.resolve('data', `${lang}.json`),
        `${JSON.stringify(data[lang], null, '  ')}\n`,
      )
    })
    res.json({ ok: true })
  })

export { router as default }
