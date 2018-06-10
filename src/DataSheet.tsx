import classnames from 'classnames'
import React from 'react'
import ReactDataSheet from 'react-datasheet'
import DataEditor from './DataEditor'

export type DataType = string

export interface GridElement
  extends ReactDataSheet.Cell<GridElement, DataType> {
  value: DataType | null
}

function validatePastedCells(cells: string[][]) {
  try {
    const sample = cells[0].length
    return cells.every(row => row.length === sample)
  } catch {
    return false
  }
  return true
}

const isEmpty = (obj: any) => Object.keys(obj).length === 0

const range = (start: number, end: number) => {
  const array = []
  const inc = end - start > 0
  for (let i = start; inc ? i <= end : i >= end; inc ? i++ : i--) {
    inc ? array.push(i) : array.unshift(i)
  }
  return array
}

interface CellCoordinates {
  i: number
  j: number
}

type CellChanges = ReactDataSheet.CellsChangedArgs<GridElement>
type CellAdditions = ReactDataSheet.CellAdditionsArgs<GridElement['value']>
interface CellData {
  cell: GridElement
  data: string
}

class DataSheet extends ReactDataSheet<GridElement> {
  public handleCopy(e: ClipboardEvent) {
    if (isEmpty(this.state.editing)) {
      e.preventDefault()

      const { dataRenderer, valueRenderer, data } = this.props

      // @ts-ignore
      const { start, end } = this.getState() as {
        start: CellCoordinates
        end: CellCoordinates
      }

      const cells = range(start.i, end.i).map(i =>
        range(start.j, end.j)
          .map(j => {
            const cell = data[i][j]
            const value = dataRenderer ? dataRenderer(cell, i, j) : null
            if (
              value === '' ||
              value === null ||
              typeof value === 'undefined'
            ) {
              return valueRenderer(cell, i, j)
            }
            return value
          })
          .map(String),
      )

      e.clipboardData.setData('text/plain', this.handleFormatText(cells))
      e.clipboardData.setData('text/html', this.handleFormatHTML(cells))
    }
  }

  public handlePaste = (e: ClipboardEvent) => {
    if (isEmpty(this.state.editing)) {
      // @ts-ignore
      const { start } = this.getState() as { start: CellCoordinates }

      const pasteData =
        this.handleParseHTML(e.clipboardData.getData('text/html')) ||
        this.handleParseText(e.clipboardData.getData('text/plain'))

      if (pasteData == null) {
        return
      }

      // in order of preference
      const { data, onCellsChanged, onPaste, onChange } = this
        .props as ReactDataSheet<GridElement>['props'] & {
        onPaste(changes: CellData[][]): void
        onChange(
          cell: GridElement,
          row: number,
          col: number,
          value: GridElement['value'],
        ): void
      }

      let end: CellCoordinates | undefined

      if (onCellsChanged) {
        const changes: CellChanges = []
        const additions: CellAdditions = []

        pasteData.forEach((row, i) => {
          row.forEach((value, j) => {
            end = {
              i: start.i + i,
              j: start.j + j,
            }
            const cell = data[end.i] && data[end.i][end.j]
            if (!cell) {
              additions.push({ row: end.i, col: end.j, value })
            } else if (!cell.readOnly) {
              changes.push({ cell, row: end.i, col: end.j, value })
            }
          })
        })
        if (additions.length) {
          onCellsChanged(changes, additions)
        } else {
          onCellsChanged(changes)
        }
      } else if (onPaste) {
        const changes: CellData[][] = []
        pasteData.forEach((row, i) => {
          const rowData: CellData[] = []
          row.forEach((pastedData, j) => {
            end = { i: start.i + i, j: start.j + j }
            const cell = data[end.i] && data[end.i][end.j]
            rowData.push({ cell, data: pastedData })
          })
          changes.push(rowData)
        })
        onPaste(changes)
      } else if (onChange) {
        pasteData.forEach((row, i) => {
          row.forEach((value, j) => {
            end = { i: start.i + i, j: start.j + j }
            const cell = data[end.i] && data[end.i][end.j]
            if (cell && !cell.readOnly) {
              onChange(cell, end.i, end.j, value)
            }
          })
        })
      }

      // @ts-ignore
      this._setState({ end })
    }
  }

  private handleFormatText = (cells: string[][]) =>
    cells.map(row => row.join('\t')).join('\n')

  private handleFormatHTML = (cells: string[][]) => {
    const table = document.createElement('table')
    cells.forEach(row => {
      const tr = document.createElement('tr')

      row.forEach(cell => {
        const td = document.createElement('td')
        td.innerText = cell
        tr.appendChild(td)
      })

      table.appendChild(tr)
    })

    return table.outerHTML
  }

  private handleParseHTML = (html: string): string[][] | null => {
    let data: string[][] | null = null

    try {
      const container = document.createElement('div')
      container.innerHTML = html
      const trs = container.querySelectorAll('table tr')

      data = Array.from(trs).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.innerText),
      )

      if (!validatePastedCells(data)) {
        return null
      }
    } catch {
      return null
    }

    return data
  }

  private handleParseText = (str: string) => {
    const data = str.split(/\r\n|\n|\r/).map(row => row.split('\t'))

    if (!validatePastedCells(data)) {
      return null
    }

    return data
  }
}

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
