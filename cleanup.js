// cleanup.js
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function cleanup() {
  const directories = ['dev-dist', 'dist']
  const files = ['sw.js', 'workbox-*.js', 'workbox-*.js.map', 'sw.js.map', 'registerSW.js']
  
  for (const dir of directories) {
    const dirPath = resolve(__dirname, dir)
    if (await fs.pathExists(dirPath)) {
      console.log(`Cleaning up ${dir} directory...`)
      for (const file of files) {
        try {
          const matches = await fs.glob(resolve(dirPath, file))
          for (const match of matches) {
            await fs.remove(match)
            console.log(`Removed: ${match}`)
          }
        } catch (error) {
          console.warn(`Failed to remove ${file} from ${dir}:`, error)
        }
      }
    }
  }
}

cleanup().catch(console.error)