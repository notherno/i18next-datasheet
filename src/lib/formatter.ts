import yaml = require('js-yaml')

export function toYAML(data: any): string {
  return yaml.safeDump(data)
}

export function toJSON(data: any): string {
  return JSON.stringify(data, undefined, '  ')
}
