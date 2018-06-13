import { BundleResponse, I18nBundle } from '../types'

/** Fetches I18nBundle */
export const loadData = new Promise<BundleResponse>(resolve =>
  fetch('/data').then(res => res.json().then(data => resolve(data))),
)

/** Submits data to /data */
export const saveData = (data: I18nBundle) => {
  fetch('/data', {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }).then(() => alert('saved'))
}
