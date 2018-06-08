import * as React from 'react'
import ReactDataSheet from 'react-datasheet'

type Props<T> = ReactDataSheet.DataEditorProps<T, string>

export default class TextDataEditor<T> extends React.PureComponent<Props<T>> {
  private _input: HTMLTextAreaElement // tslint:disable-line variable-name

  constructor(props: Props<T>) {
    super(props)
  }

  public componentDidMount() {
    this._input.focus()
  }

  public render() {
    const { value, onKeyDown } = this.props
    return (
      <textarea
        ref={this.handleRef}
        className="data-editor"
        value={value as string}
        onChange={this.handleChange}
        onKeyDown={onKeyDown}
      />
    )
  }

  private handleRef = (input: HTMLTextAreaElement) => {
    this._input = input
  }

  private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target as HTMLTextAreaElement
    this.props.onChange(value)
  }
}
