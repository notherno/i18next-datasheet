import 'bulma/css/bulma.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App, { BundleResponse } from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const ready = new Promise(resolve => {
  document.addEventListener('DOMContentLoaded', () => resolve())
})

const loadData = new Promise<BundleResponse>(resolve =>
  fetch('/data').then(res => res.json().then(data => resolve(data))),
)

Promise.all([loadData, ready]).then(([data]) => {
  ReactDOM.render(<App initialData={data} />, document.getElementById(
    'root',
  ) as HTMLElement)
  registerServiceWorker()
})
