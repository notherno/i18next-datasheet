import * as React from 'react'
import 'react-datasheet/lib/react-datasheet.css'
import './App.css'
import allData, { columns } from './data'
import DataSheet, { GridElement } from './DataSheet'
import {
  accessModule,
  accessText,
  extractBundles,
  LocaleModule,
  serializeModule,
} from './lib/dataLoader'

interface State {
  data: LocaleModule[]
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

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = {
      data: extractBundles(columns, allData),
    }
  }

  public renderModule = (path: string[] = []): JSX.Element => {
    const { data } = this.state
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
              columns={columns}
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
              <pre>{JSON.stringify(serializeModule(m)[m.key], null, '  ')}</pre>
            </div>
          ))}
        </div>
      </div>
    )
  }

  private save = () => {
    fetch('/save', {
      body: JSON.stringify(this.state.data.map(m => serializeModule(m))),
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
