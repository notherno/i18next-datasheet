import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'

const data = [
  {
    en: {
      greetings: {
        hello: 'Hello',
      },
    },
  },
]

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App initialData={data} />, div)
  ReactDOM.unmountComponentAtNode(div)
})
