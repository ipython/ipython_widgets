
const fs = require("fs")

const json = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = json.version;

const index = fs.readFileSync("lib/index.js", "utf8");

const indexFixed = index.replace(
  'export const version = "";',
  'export const version = "' + version + '";'
);

if (indexFixed === index) {
  throw new Error("Failed to insert version string into lib/index.js");
}

fs.writeFileSync("lib/index.js", indexFixed);
