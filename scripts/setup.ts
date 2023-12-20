import fs from 'fs'
import os from 'os'
import path from 'path'
import chalk from 'chalk'
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package'
import {
  getSafePackageName,
  getUrlFromRepo,
  readJSON,
  toPascalCase,
  writeJSON,
} from './util'

const { readFile, writeFile } = fs.promises

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

  const n = getSafePackageName(rawPackageName)
  const prefix = 'jbrowse-plugin-'
  const className = toPascalCase(
    n.startsWith(prefix) ? n.slice(prefix.length) : n,
  )

  updatePackageJSON(className, packageJSON)
  updateSrcIndex(className)
  updateJBrowseConfig(n, className)
  updateExampleFixture(n, className)
  updateReadme(rawPackageName, packageJSON.repository)
}

function updatePackageJSON(
  pluginName: string,
  packageJSON: JSONSchemaForNPMPackageJsonFiles,
) {
  // 1. Change "name" in the "jbrowse-plugin" and "config" fields to the name
  // of your project (e.g. "MyProject")
  packageJSON['jbrowse-plugin'].name = pluginName
  if (!packageJSON.config) {
    packageJSON.config = {}
  }
  // @ts-expect-error
  packageJSON.config.jbrowse.plugin.name = pluginName

  // this overwrites package.json
  writeJSON('package.json', packageJSON)
}

// replace default plugin name in example plugin class
async function updateSrcIndex(pluginClassName: string) {
  const indexFilePath = path.join('src', 'index.ts')
  let indexFile = await readFile(indexFilePath, 'utf-8')
  indexFile = indexFile.replace(/TemplatePlugin/g, `${pluginClassName}Plugin`)
  writeFile(indexFilePath, indexFile)
}

// replace default plugin name and url with project name and dist file
async function updateJBrowseConfig(packageName: string, pluginName: string) {
  const jbrowseConfig = await readJSON(
    path.join(__dirname, '..', 'jbrowse_config.json'),
  )
  jbrowseConfig.plugins[0].name = pluginName
  jbrowseConfig.plugins[0].url = `http://localhost:9000/dist/${packageName}.umd.development.js`
  writeJSON('jbrowse_config.json', jbrowseConfig)
}

// replace default plugin name and url with project name and dist file
async function updateExampleFixture(packageName: string, pluginName: string) {
  const fixtureLocation = path.join(
    __dirname,
    '..',
    'cypress',
    'fixtures',
    'hello_view.json',
  )
  const exampleFixture = await readJSON(fixtureLocation)
  exampleFixture.plugins[0].name = pluginName
  exampleFixture.plugins[0].url = `http://localhost:9000/dist/${packageName}.umd.development.js`
  writeJSON(fixtureLocation, exampleFixture)
}

async function updateReadme(
  packageName: string,
  repository: JSONSchemaForNPMPackageJsonFiles['repository'],
) {
  // add status badge to README
  const repoUrl = getUrlFromRepo(repository)
  let readme = (await readFile('README.md', 'utf-8')).split(/\r?\n/)
  if (readme[0].startsWith(`# ${packageName}`)) {
    return
  }
  readme[0] = `# ${packageName}`
  if (repoUrl !== undefined) {
    readme.unshift(
      `![Integration](${repoUrl}/workflows/Integration/badge.svg?branch=main)${os.EOL}`,
    )
  }
  writeFile('README.md', readme.join(os.EOL), 'utf8')
}

main()
