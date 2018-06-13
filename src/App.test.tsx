import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'

const bundle = {
  en: {
    greetings: {
      hello: 'Hello',
    },
  },
}
const langs = ['en']

/** A mock for save method */
const save = (payload: any) => {
  console.log(payload)
}

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <App initialBundle={bundle} initialLangs={langs} save={save} />,
    div,
  )
  ReactDOM.unmountComponentAtNode(div)
})
