import 'bulma/css/bulma.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App, { BundleResponse } from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import { LocaleBundle } from './types'

const save = (data: { [lang: string]: LocaleBundle }) => {
  fetch('/data', {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }).then(() => alert('saved'))
}

const ready = new Promise(resolve => {
  document.addEventListener('DOMContentLoaded', () => resolve())
})

const loadData = new Promise<BundleResponse>(resolve =>
  fetch('/data').then(res => res.json().then(data => resolve(data))),
)

Promise.all([loadData, ready]).then(([data]) => {
  ReactDOM.render(
    <App initialData={data} save={save} />,
    document.getElementById('root') as HTMLElement,
  )
  registerServiceWorker()
})
