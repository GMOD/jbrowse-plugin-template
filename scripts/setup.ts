import fs from 'fs'
import os from 'os'
import path from 'path'
import chalk from 'chalk'
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package'

const fsPromises = fs.promises

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

async function main() {
  const packageJSON = await readJSON(path.join(__dirname, '..', 'package.json'))
  const rawPackageName = packageJSON.name
  // ensure that yarn init has been run
  if (rawPackageName === undefined) {
    console.warn(
      chalk.red(
        'No name defined in package.json. Please run "yarn init" (or "npm init") before running "yarn setup" (or "npm run setup").',
      ),
    )
    process.exit(1)
  }
  if (rawPackageName === 'jbrowse-plugin-template') {
    console.warn(
      chalk.red(
        'Please run "yarn init" (or "npm init") before running "yarn setup" (or "npm run setup").',
      ),
    )
    process.exit(1)
  }

  const tsdxName = getTsdxPackageName(rawPackageName)
  const prefix = 'jbrowse-plugin-'
  const pluginClassName = toPascalCase(
    tsdxName.startsWith(prefix) ? tsdxName.slice(prefix.length) : tsdxName,
  )

  updatePackageJSON(tsdxName, pluginClassName, packageJSON)
  updateSrcIndex(pluginClassName)
  updateJBrowseConfig(tsdxName, pluginClassName)
  updateExampleFixture(tsdxName, pluginClassName)
  updateReadme(rawPackageName, packageJSON.repository)
}

function updatePackageJSON(
  tsdxName: string,
  pluginName: string,
  packageJSON: JSONSchemaForNPMPackageJsonFiles,
) {
  // 1. Change "name" in the "jbrowse-plugin" and "config" fields to the name of your project (e.g. "MyProject")
  packageJSON['jbrowse-plugin'].name = pluginName
  if (!packageJSON.config) {
    packageJSON.config = {}
  }
  packageJSON.config.jbrowse.plugin.name = pluginName

  // 2. In the "module" field, replace jbrowse-plugin-my-project with the name of your project (leave off the @myscope if using a scoped package name) (you can double-check that the filename is correct after running the build step below and comparing the filename to the file in the dist/ folder)
  packageJSON.module = `dist/${tsdxName}.esm.js`

  // this overwrites package.json
  writeJSON('package.json', packageJSON)
}

// replace default plugin name in example plugin class
async function updateSrcIndex(pluginClassName: string) {
  const indexFilePath = path.join('src', 'index.ts')
  let indexFile = await fsPromises.readFile(indexFilePath, 'utf-8')
  indexFile = indexFile.replace(/Template/g, pluginClassName)
  fsPromises.writeFile(indexFilePath, indexFile)
}

// replace default plugin name and url with project name and dist file
async function updateJBrowseConfig(tsdxName: string, pluginName: string) {
  const jbrowseConfig = await readJSON(
    path.join(__dirname, '..', 'jbrowse_config.json'),
  )
  jbrowseConfig.plugins[0].name = pluginName
  jbrowseConfig.plugins[0].url = `http://localhost:9000/dist/${tsdxName}.umd.development.js`
  writeJSON('jbrowse_config.json', jbrowseConfig)
}

// replace default plugin name and url with project name and dist file
async function updateExampleFixture(tsdxName: string, pluginName: string) {
  const fixtureLocation = path.join(
    __dirname,
    '..',
    'cypress',
    'fixtures',
    'hello_view.json',
  )
  const exampleFixture = await readJSON(fixtureLocation)
  exampleFixture.plugins[0].name = pluginName
  exampleFixture.plugins[0].url = `http://localhost:9000/dist/${tsdxName}.umd.development.js`
  writeJSON(fixtureLocation, exampleFixture)
}

async function updateReadme(
  packageName: string,
  repository: JSONSchemaForNPMPackageJsonFiles['repository'],
) {
  // add status badge to README
  const repoUrl = getUrlFromRepo(repository)
  let readmeLines = (await fsPromises.readFile('README.md', 'utf-8')).split(
    /\r?\n/,
  )
  if (readmeLines[0].startsWith(`# ${packageName}`)) {
    return
  }
  readmeLines[0] = `# ${packageName}`
  if (repoUrl !== undefined) {
    readmeLines.unshift(
      `![Integration](${repoUrl}/workflows/Integration/badge.svg?branch=main)${os.EOL}`,
    )
  }
  fsPromises.writeFile('README.md', readmeLines.join(os.EOL), 'utf8')
}

/*
****************************
Helpers
****************************
*/

async function writeJSON(path: string, data: JSONValue) {
  let jsonString
  try {
    jsonString = JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('There was a problem converting an object to JSON')
    throw error
  }
  return fsPromises.writeFile(path, `${jsonString}\n`)
}

async function readJSON(path: string) {
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
function toPascalCase(string: string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w+)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`,
    )
    .replace(new RegExp(/\s/, 'g'), '')
    .replace(new RegExp(/\w/), s => s.toUpperCase())
}

function getTsdxPackageName(name: string) {
  return name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')
}

function getUrlFromRepo(repo: JSONSchemaForNPMPackageJsonFiles['repository']) {
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

main()
