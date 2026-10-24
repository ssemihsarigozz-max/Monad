const fs = require("fs");
const path = require("path");
const input = path.join(__dirname, "..", "artifacts", "contracts", "CommonGround.sol", "CommonGround.json");
const output = path.join(__dirname, "..", "abi", "CommonGround.json");
if (!fs.existsSync(input)) throw new Error("Compile first: npm run compile");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(JSON.parse(fs.readFileSync(input)).abi, null, 2) + "\n");
console.log(output);
