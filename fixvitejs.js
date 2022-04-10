// Yes, this is dirty
const fs = require("fs")
const path = require("path")

const pnpmDir = path.join(__dirname, "node_modules/.pnpm")
const modules = fs.readdirSync(pnpmDir, {withFileTypes: true})
const versions = modules.filter(e => e.isDirectory() && /^@vite\+vitejs@\d+\.\d+\.\d+$/.test(e.name))

for(const folder of versions){
    const pth = path.join(pnpmDir, folder.name, "node_modules", "@vite/vitejs")
    const file = path.join(pth, "distSrc/viteAPI/index.ts")
    let data = fs.readFileSync(file, "utf-8")
    data = data.replace("from './../accountblock/utils';", "from './../accountBlock/utils';")
    fs.writeFileSync(file, data)
}