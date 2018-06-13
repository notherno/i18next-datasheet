import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import 'bulma/css/bulma.css'
import React from 'react'
import App from '../src/App'

const bundle = {
  en: {
    greetings: {
      hello: 'Hello',
    },
  },
}

const langs = ['en']

const stories = storiesOf('App', module)

stories.add('can be mounted', () => (
  <App initialBundle={bundle} initialLangs={langs} save={action('save')} />
))
