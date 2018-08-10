import yaml = require('js-yaml')

export function fromYAML(dataYAML: string): any {
  return yaml.safeLoad(dataYAML)
}

export function fromJSON(dataJSON: string): any {
  return JSON.parse(dataJSON)
}

export function toYAML(data: any): string {
  return yaml.safeDump(data)
}

export function toJSON(data: any): string {
  return JSON.stringify(data, undefined, '  ')
}
