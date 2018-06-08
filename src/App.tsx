import * as React from 'react'
import ReactDataSheet from 'react-datasheet'
import 'react-datasheet/lib/react-datasheet.css'
import './App.css'
import TextDataEditor from './DataEditor'
import DataSheet, { DataType, GridElement } from './DataSheet'

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
        <DataSheet
          data={this.state.grid}
          valueRenderer={this.valueRenderer}
          onCellsChanged={this.handleCellsChange}
          dataEditor={TextDataEditor}
        />
      </div>
    )
  }

  private handleCellsChange = (
    changes: ReactDataSheet.CellsChangedArgs<GridElement, DataType>,
  ) => {
    const grid = this.state.grid.map(row => [...row])
    changes.forEach(({ cell, row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value }
    })
    this.setState({ grid })
  }

  private valueRenderer(cell: GridElement) {
    return cell.value
  }
}

export default App
