import * as React from 'react'
import 'react-datasheet/lib/react-datasheet.css'
import './App.css'
import DataSheet, { GridElement } from './DataSheet'

interface State {
  grid: GridElement[][]
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = {
      grid: [
        [{ value: 'Hello' }, { value: 'Hey' }],
        [{ value: 'Good morning' }, { value: 'Good night' }],
      ],
    }
  }

  public render() {
    return (
      <div className="App">
        <DataSheet data={this.state.grid} />
      </div>
    )
  }
}

export default App
