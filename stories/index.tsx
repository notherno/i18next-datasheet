import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import 'bulma/css/bulma.css'
import React from 'react'
import App from '../src/App'

const data = {
  bundle: {
    en: {
      greetings: {
        hello: 'Hello',
      },
    },
  },
  langs: ['en'],
}

const stories = storiesOf('App', module)

stories.add('can be mounted', () => (
  <App initialData={data} save={action('save')} />
))
