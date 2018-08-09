import * as React from 'react'
import 'react-datasheet/lib/react-datasheet.css'
import { colorize } from '../../lib/colorizer'
import {
  accessModule,
  buildFullKey,
  extractBundles,
  flattenBundles,
  serializeModule,
} from '../../lib/dataLoader'
import { toYAML } from '../../lib/formatter'
import { I18nBundle, LocaleBundle, LocaleModule } from '../../types'
import DataSheet, { GridElement } from '../DataSheet'
import './styles.css'

interface Props {
  initialBundle: I18nBundle
  initialLangs: string[]
  save(data: I18nBundle): void
}

interface State {
  data: LocaleModule
  langs: string[]
  pastData: Array<State['data']>
  futureData: Array<State['data']>
}

function generateNewKey(keys: string[], candidate: string | undefined): string {
  const gen = (key: string, i: number) => `${newKey}-${i}`

  let index = 1

  const newKey = candidate === '' || candidate == null ? 'NEW' : candidate

  while (keys.includes(gen(newKey, index))) {
    index++
  }

  return gen(newKey, index)
}

function updateTexts(
  localeModule: LocaleModule,
  targetPath: string[],
  texts: LocaleModule['texts'],
): LocaleModule {
  if (targetPath.length !== 0) {
    const [key, ...restPath] = targetPath
    return {
      key: localeModule.key,
      modules: localeModule.modules.map(
        (m, index) =>
          m.key === key
            ? updateTexts(localeModule.modules[index], restPath, texts)
            : m,
      ),
      texts: localeModule.texts,
    }
  } else {
    return {
      key: localeModule.key,
      modules: localeModule.modules,
      texts,
    }
  }
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { initialBundle, initialLangs } = props

    this.state = {
      data: extractBundles(initialBundle, initialLangs[0]),
      futureData: [],
      langs: initialLangs,
      pastData: [],
    }
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  public renderModule = (path: string[] = []): JSX.Element => {
    const { data, langs } = this.state
    const targetModule = accessModule(data, path)

    return (
      <section
        className="message"
        style={{
          borderLeft:
            path.length === 1 ? `6px solid ${colorize(path[0])}` : undefined,
        }}
      >
        {path.length > 0 && (
          <div
            className="message-header"
            style={{ backgroundColor: colorize(path[0]) }}
          >
            <p>{buildFullKey(path)}</p>
          </div>
        )}
        <div className="message-body">
          {path.length > 0 && (
            <DataSheet
              data={targetModule.texts.map(text => [
                { value: text.key },
                ...this.state.langs.map(lang => ({
                  value:
                    lang in text.values && text.values[lang]
                      ? text.values[lang]
                      : '',
                })),
              ])}
              update={this.handleUpdate(path)}
              columns={langs}
              keys={targetModule.texts.map(text => text.key)}
            />
          )}
          {targetModule.modules.map(m => (
            <React.Fragment key={m.key}>
              {this.renderModule([...path, m.key])}
            </React.Fragment>
          ))}
        </div>
      </section>
    )
  }

  public render() {
    return (
      <div className="container">
        {this.renderModule()}
        <button className="button" onClick={this.save}>
          Save
        </button>
        <button
          className="button"
          onClick={this.undo}
          disabled={this.state.pastData.length === 0}
        >
          Undo
        </button>
        <button
          className="button"
          onClick={this.redo}
          disabled={this.state.futureData.length === 0}
        >
          Redo
        </button>
        <button className="button" onClick={this.exportData}>
          Export
        </button>
      </div>
    )
  }

  private handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.metaKey && ev.key === 's') {
      ev.preventDefault()
      this.save()
      return
    }

    if (ev.metaKey && ev.key === 'z') {
      ev.preventDefault()
      this.undo()
      return
    }

    if (ev.metaKey && ev.key === 'y') {
      ev.preventDefault()
      this.redo()
      return
    }

    if (ev.metaKey && ev.key === 'e') {
      ev.preventDefault()
      this.exportData()
      return
    }
  }

  /**
   * Exports the whole data as YAML
   */
  private exportData = () => {
    const data = flattenBundles(this.getBundle())

    const anchor = document.createElement('a')

    anchor.href = window.URL.createObjectURL(
      new Blob([toYAML(data)], { type: 'text/vnd.yaml' }),
    )

    // TODO: Make it customizable
    anchor.download = 'export.yaml'

    document.body.appendChild(anchor)

    // Open download window
    anchor.click()

    // Remove temporary anchor
    document.body.removeChild(anchor)
  }

  private getBundle = () =>
    this.state.langs
      .map(lang => ({
        [lang]: serializeModule(lang, this.state.data).root as LocaleBundle,
      }))
      .reduce<I18nBundle>((data, bundle) => ({ ...data, ...bundle }), {})

  private save = () => {
    const { save } = this.props

    save(this.getBundle())
  }

  private handleUpdate = (modulePath: string[]) => (
    changed: GridElement[][],
  ) => {
    const { data, pastData } = this.state

    this.setState({
      data: updateTexts(
        this.state.data,
        modulePath,
        (() => {
          const texts: LocaleModule['texts'] = []
          const keys: string[] = []

          changed.forEach(row => {
            const [keyCell, ...restCells] = row
            const { value: key } = keyCell

            if (key == null || key === '' || keys.find(k => k === key)) {
              const newKey = generateNewKey(keys, key!)
              texts.push({
                key: newKey,
                values: restCells.reduce<{ [lang: string]: string }>(
                  (val, cell, index) => ({
                    ...val,
                    ...{ [this.state.langs[index]]: cell.value! },
                  }),
                  {},
                ),
              })
              keys.push(newKey)
            } else {
              texts.push({
                key,
                values: restCells.reduce<{ [lang: string]: string }>(
                  (val, cell, index) => ({
                    ...val,
                    ...{ [this.state.langs[index]]: cell.value! },
                  }),
                  {},
                ),
              })
              keys.push(key)
            }
          })
          return texts
        })(),
      ),
      futureData: [],
      pastData: [data, ...pastData],
    })
  }

  private undo = () => {
    const { data, futureData, pastData } = this.state

    if (pastData.length === 0) {
      return
    }

    const [nextData, ...restData] = pastData

    this.setState({
      data: nextData,
      futureData: [data, ...futureData],
      pastData: restData,
    })
  }

  private redo = () => {
    const { data, futureData, pastData } = this.state

    if (futureData.length === 0) {
      return
    }

    const [nextData, ...restData] = futureData

    this.setState({
      data: nextData,
      futureData: restData,
      pastData: [data, ...pastData],
    })
  }
}

export { App as default }
