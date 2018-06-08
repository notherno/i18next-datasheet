import * as React from 'react'
import ReactDataSheet from 'react-datasheet'
import DataEditor from './DataEditor'

export type DataType = string

export interface GridElement
  extends ReactDataSheet.Cell<GridElement, DataType> {
  value: DataType | null
}

class DataSheet extends ReactDataSheet<GridElement, DataType> {}

interface Props {
  data: GridElement[][]
}

export default class CustomDataSheet extends React.PureComponent<Props> {
  public render() {
    const { data } = this.props
    return (
      <DataSheet
        data={data}
        valueRenderer={this.valueRenderer}
        onCellsChanged={this.handleCellsChange}
        dataEditor={DataEditor}
      />
    )
  }
  private valueRenderer(cell: GridElement) {
    return cell.value
  }

  private handleCellsChange = (
    changes: ReactDataSheet.CellsChangedArgs<GridElement, DataType>,
  ) => {
    const { data } = this.props
    const grid = data.map(row => [...row])
    changes.forEach(({ cell, row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value }
    })
    this.setState({ grid })
  }
}
