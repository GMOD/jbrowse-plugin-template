import fs from 'fs'
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package'

const fsPromises = fs.promises

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

export async function writeJSON(path: string, data: JSONValue) {
  let jsonString
  try {
    jsonString = JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('There was a problem converting an object to JSON')
    throw error
  }
  return fsPromises.writeFile(path, `${jsonString}\n`)
}

export async function readJSON(path: string) {
  let jsonString
  try {
    jsonString = await fsPromises.readFile(path, 'utf8')
  } catch (error) {
    console.error(`Could not read JSON file at ${path}`)
    throw error
  }
  let jsonData
  try {
    jsonData = JSON.parse(jsonString)
  } catch (error) {
    console.error(
      `Could not parse JSON file at ${path}, check for JSON syntax errors`,
    )
    throw error
  }
  return jsonData
}

// snagged from https://stackoverflow.com/a/53952925
export function toPascalCase(string: string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w+)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`,
    )
    .replace(new RegExp(/\s/, 'g'), '')
    .replace(new RegExp(/\w/), (s) => s.toUpperCase())
}

export function getSafePackageName(name: string) {
  return name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')
}

export function getUrlFromRepo(
  repo: JSONSchemaForNPMPackageJsonFiles['repository'],
) {
  if (repo === undefined) {
    return repo
  }
  let url = undefined
  if (typeof repo === 'string') {
    url = repo
  } else if (typeof repo === 'object') {
    url = repo.url
  }

  if (typeof url === 'string') {
    if (url.includes('github.com')) {
      return url.replace(/\.git$/, '')
    }
    if (url.startsWith('github:')) {
      return `https://github.com/${url.split(':')[1]}`
    }
  }
  return undefined
}
