import 'bulma/css/bulma.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import { loadData, saveData } from './lib/requests'
import registerServiceWorker from './registerServiceWorker'

/** A promise which resolves at a time when DOM is ready */
const ready = new Promise(resolve => {
  document.addEventListener('DOMContentLoaded', () => resolve())
})

Promise.all([loadData, ready]).then(([data]) => {
  const { bundle, langs } = data

  ReactDOM.render(
    <App initialBundle={bundle} initialLangs={langs} save={saveData} />,
    document.getElementById('root') as HTMLElement,
  )
  registerServiceWorker()
})
