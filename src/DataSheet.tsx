import classnames from 'classnames'
import React from 'react'
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
  columns: string[]
  keys: string[]
  update(data: Props['data']): void
}

interface SheetRendererProps {
  data: Props['data']
  className: string
  children: JSX.Element
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
        sheetRenderer={this.sheetRenderer}
      />
    )
  }
  private valueRenderer(cell: GridElement) {
    return cell.value
  }

  private handleCellsChange = (
    changes: ReactDataSheet.CellsChangedArgs<GridElement, DataType>,
  ) => {
    const { data, update } = this.props
    const grid = data.map(row => [...row])
    changes.forEach(({ cell, row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value }
    })
    update(grid)
  }

  private sheetRenderer = (props: SheetRendererProps) => (
    <table className={classnames(props.className, 'table', 'is-striped')}>
      <thead>
        <tr>
          {['Key', ...this.props.columns].map(column => (
            <td key={column}>{column}</td>
          ))}
        </tr>
      </thead>
      <tbody>{props.children}</tbody>
    </table>
  )
}
