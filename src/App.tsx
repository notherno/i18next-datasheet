import * as React from 'react'
import 'react-datasheet/lib/react-datasheet.css'
import './App.css'
import DataSheet, { GridElement } from './DataSheet'
import {
  accessModule,
  accessText,
  extractBundles,
  LocaleBundle,
  LocaleModule,
  serializeModule,
} from './lib/dataLoader'

export interface BundleResponse {
  langs: string[]
  bundle: { [lang: string]: LocaleBundle }
}

interface Props {
  initialData: BundleResponse
}

interface State {
  data: LocaleModule[]
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

    const { initialData } = props

    const langs = initialData.langs

    const bundles = langs.map(lang => initialData.bundle[lang])

    this.state = {
      data: extractBundles(langs, bundles),
      futureData: [],
      langs,
      pastData: [],
    }
  }

  public renderModule = (path: string[] = []): JSX.Element => {
    const { data, langs } = this.state
    const target = accessModule(data[0], path)

    return (
      <section className="message">
        {path.length > 0 && (
          <div className="message-header">
            <p>{path[path.length - 1]}</p>
          </div>
        )}
        <div className="message-body">
          {path.length > 0 && (
            <DataSheet
              data={target.texts.map(text => [
                { value: text.key },
                ...data.map(n => {
                  return {
                    value: accessText(accessModule(n, path), text.key),
                  }
                }),
              ])}
              update={this.handleUpdate(path)}
              columns={langs}
              keys={target.texts.map(text => text.key)}
            />
          )}
          {target.modules.map(m => (
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
        <div className="columns">
          {this.state.data.map(m => (
            <div key={m.key} className="column">
              <h2 className="title is-5">{m.key}</h2>
              <pre className="json-viewer">
                {JSON.stringify(serializeModule(m)[m.key], null, '  ')}
              </pre>
            </div>
          ))}
        </div>
      </div>
    )
  }

  private save = () => {
    fetch('/data', {
      body: JSON.stringify(
        this.state.data
          .map(m => serializeModule(m))
          .reduce((data, bundle) => ({ ...data, ...bundle }), {}),
      ),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }).then(() => alert('saved'))
  }

  private handleUpdate = (modulePath: string[]) => (
    changed: GridElement[][],
  ) => {
    const { data, pastData } = this.state

    this.setState({
      data: data.map((localeModule, index) =>
        updateTexts(
          localeModule,
          modulePath,
          (() => {
            const texts: LocaleModule['texts'] = []
            const keys: string[] = []

            changed.forEach(row => {
              const [keyCell, ...restCells] = row
              const { value: key } = keyCell

              if (key == null || key === '' || keys.find(k => k === key)) {
                const newKey = generateNewKey(keys, key!)
                texts.push({ key: newKey, text: restCells[index].value! })
                keys.push(newKey)
              } else {
                texts.push({ key, text: restCells[index].value! })
                keys.push(key)
              }
            })
            return texts
          })(),
        ),
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

export default App
