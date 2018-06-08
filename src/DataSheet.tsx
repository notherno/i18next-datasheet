import ReactDataSheet from 'react-datasheet'

export type DataType = string

export interface GridElement
  extends ReactDataSheet.Cell<GridElement, DataType> {
  value: DataType | null
}

export default class DataSheet extends ReactDataSheet<GridElement, DataType> {}
