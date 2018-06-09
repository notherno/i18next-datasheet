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
      langs,
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
    const { data } = this.state

    this.setState({
      data: data.map((localeModule, index) =>
        updateTexts(
          localeModule,
          modulePath,
          changed.map(row => {
            const [key, ...texts] = row
            return {
              key: key.value!,
              text: texts[index].value!,
            }
          }),
        ),
      ),
    })
  }
}

export default App
