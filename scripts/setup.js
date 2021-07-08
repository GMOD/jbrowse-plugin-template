const fs = require('fs')
const os = require('os')
const path = require('path')
const { safePackageName } = require('@jbrowse/development-tools')

function main() {
  const packageJSON = require('../package.json')
  const rawPackageName = packageJSON.name
  // ensure that yarn init has been run
  if (rawPackageName === undefined) {
    console.log(
      'Warning: no name defined in package.json. Please run "yarn init" before "yarn setup".',
    )
    process.exit(1)
  }

  const packageName = safePackageName(rawPackageName)

  updateSrcIndex(packageName)
  updateJBrowseConfig(packageName)
  updateExampleFixture(packageName)

  setupGithubAction(packageName, packageJSON.repository)
}

// replace default plugin name in example plugin class
function updateSrcIndex(pluginName) {
  let pluginClassName = pluginName
  if (pluginClassName.startsWith('jbrowse-plugin-')) {
    pluginClassName = pluginClassName.replace(/jbrowse-plugin-/, '')
  }
  pluginClassName = toPascalCase(pluginClassName)
  const indexFilePath = path.join('src', 'index.ts')
  let indexFile = readFile(indexFilePath)
  indexFile = indexFile.replace(/MyProject/g, pluginClassName)
  fs.writeFileSync(indexFilePath, indexFile)
}

// replace default plugin name and url with project name and dist file
function updateJBrowseConfig(packageName) {
  const jbrowseConfig = require('../jbrowse_config.json')
  jbrowseConfig.plugins[0].url = `http://localhost:9000/dist/${packageName}.esm.js`
  writeJSON(jbrowseConfig, 'jbrowse_config.json')
}

// replace default plugin name and url with project name and dist file
function updateExampleFixture(packageName) {
  const exampleFixture = require('../cypress/fixtures/hello_view.json')
  exampleFixture.plugins[0].url = `http://localhost:9000/dist/${packageName}.esm.js`
  writeJSON(exampleFixture, path.join('cypress', 'fixtures', 'hello_view.json'))
}

function setupGithubAction(packageName, repository) {
  if (fs.existsSync(path.join('.github', 'workflows', 'integration.yml'))) {
    return
  }
  // move integration test into workflow folder
  if (!fs.existsSync(path.join('.github', 'workflows'))) {
    fs.mkdirSync(path.join('.github', 'workflows'), { recursive: true })
  }
  fs.renameSync(
    'integration.yml',
    path.join('.github', 'workflows', 'integration.yml'),
  )

  // add status badge to README
  const repoUrl = parseRepoUrl(repository)
  if (repoUrl !== undefined) {
    let README = readFile('README.md').split(/\r?\n/)
    README.unshift(
      `![Integration](${repoUrl}/workflows/Integration/badge.svg?branch=main)${os.EOL}`,
    )
    README[1] = `# ${packageName}`
    fs.writeFileSync('README.md', README.join(os.EOL), 'utf8')
  } else {
    let README = readFile('README.md').split(/\r?\n/)
    README[0] = `# ${packageName}`
    fs.writeFileSync('README.md', README.join(os.EOL), 'utf8')
  }
}

/*
****************************
Helpers
****************************
*/

function writeJSON(data, path) {
  try {
    fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
  } catch (err) {
    console.error(err)
  }
}

function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(err)
    return false
  }
}

// snagged from https://stackoverflow.com/a/53952925
function toPascalCase(string) {
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

function parseRepoUrl(repo) {
  let url
  if (repo !== undefined) {
    if (typeof repo === 'string') {
      url = repo
    } else if (typeof repo === 'object') {
      url = repo.url
    }
  }

  if (typeof url === 'string') {
    if (url.includes('github.com')) {
      return url.replace(/\.git$/, '')
    }
    if (url.startsWith('github:')) {
      return `https://github.com/${url.split(':')[1]}`
    }
  } else {
    return undefined
  }
}

main()
