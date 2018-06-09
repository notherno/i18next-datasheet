import * as React from 'react'
import ReactDataSheet from 'react-datasheet'
import * as keys from './lib/keys'

type Props<T> = ReactDataSheet.DataEditorProps<T, string>

export default class TextDataEditor<T> extends React.PureComponent<Props<T>> {
  private _input: HTMLTextAreaElement // tslint:disable-line variable-name

  constructor(props: Props<T>) {
    super(props)
  }

  public componentDidMount() {
    this.autoSize()
    this._input.focus()
  }

  public render() {
    const { value } = this.props
    return (
      <textarea
        ref={this.handleRef}
        className="data-editor"
        value={value as string}
        onChange={this.handleChange}
        onKeyDown={this.handleKey}
      />
    )
  }

  private handleRef = (input: HTMLTextAreaElement) => {
    this._input = input
  }

  private autoSize = () => {
    const target = this._input
    target.style.height = '0px'
    target.style.height = `${target.scrollHeight}px`
  }

  private handleChange = () => {
    const target = this._input
    this.autoSize()
    this.props.onChange(target.value)
  }

  private handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { onKeyDown } = this.props

    const keyCode = e.which || e.keyCode

    if (e.shiftKey && keyCode === keys.ENTER_KEY) {
      // allow input line breaks with shift+Enter
      return
    }

    // call parent's key handler
    onKeyDown(e)
  }
}
