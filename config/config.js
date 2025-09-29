import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

export const paths = {
    root: ROOT,
    public: path.join(ROOT, 'public'),
    views: path.join(ROOT, 'src', 'views'),
    layouts: path.join(ROOT, 'src', 'views', 'layouts'),
    partials: path.join(ROOT, 'src', 'views', 'partials'),
}

export const PORT = process.env.PORT || 8080

export function getFilePath(filename) {
    return path.join(__dirname, `../data/${filename}`)
}
