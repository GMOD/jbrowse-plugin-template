import fs from 'node:fs'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  cleanupJBrowse,
  createJBrowsePage,
  launchBrowser,
  setupJBrowse,
  startJBrowseServer,
  stopServer,
  waitForJBrowseLoad,
} from './setup'

import type { ChildProcess } from 'node:child_process'
import type { Browser, Page } from 'puppeteer'

const JBROWSE_VERSION = process.env.TEST_JBROWSE_VERSION || 'nightly'
const SCREENSHOT_DIR = path.join('test-screenshots', JBROWSE_VERSION)

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

function screenshot(name: string) {
  return path.join(SCREENSHOT_DIR, `${name}.png`)
}

describe('Template Plugin E2E', () => {
  let server: ChildProcess | undefined
  let browser: Browser | undefined
  let page: Page | undefined
  const pluginErrors: string[] = []

  beforeAll(async () => {
    setupJBrowse()
    server = await startJBrowseServer()
    browser = await launchBrowser()
    page = await createJBrowsePage(browser)

    page.on('console', msg => {
      const text = msg.text()
      if (
        msg.type() === 'error' &&
        (text.includes('plugin') || text.includes('Plugin'))
      ) {
        pluginErrors.push(text)
      }
    })

    await waitForJBrowseLoad(page)
  }, 180_000)

  afterAll(async () => {
    if (browser) {
      await browser.close()
    }
    if (server) {
      await stopServer(server)
    }
    await cleanupJBrowse()
  })

  it('should load JBrowse without errors', async () => {
    expect(page).toBeDefined()
    const root = await page!.$('#root')
    expect(root).not.toBeNull()
    await page!.screenshot({ path: screenshot('jbrowse-loaded') })
  }, 30_000)

  it('should load the plugin without errors', async () => {
    expect(page).toBeDefined()

    if (pluginErrors.length > 0) {
      console.warn('Plugin errors:', pluginErrors)
    }
    expect(pluginErrors).toHaveLength(0)

    const pluginLoaded = await page!.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))
      return scripts.some(s => s.src.includes('template'))
    })

    console.log(`Plugin loaded: ${pluginLoaded}`)
    expect(pluginLoaded).toBe(true)
  }, 30_000)

  it('should render HelloView without crashing', async () => {
    expect(page).toBeDefined()
    await page!.waitForSelector('h1', { timeout: 10_000 })
    await page!.screenshot({ path: screenshot('hello-view-rendered') })

    const heading = await page!.$eval(
      'h1',
      el => el.textContent,
    ).catch(() => null)
    console.log(`Heading text: ${heading}`)
    expect(heading).toContain('Hello plugin developers!')
  }, 30_000)
})
