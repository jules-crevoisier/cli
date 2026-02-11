const fs = require("fs");
const path = require("path");
const B = "C:/Users/Crevoisier/Desktop/cli/src/templates/modules";

function w(r, lines) {
  const fp = path.join(B, r);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, lines.join("
"), "utf8");
  console.log("Wrote: " + r);
}

const data = require("./template-data.json");
for (const [k, v] of Object.entries(data)) {
  const fp = path.join(B, k);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, v, "utf8");
  console.log("Wrote: " + k);
}
console.log("Done! Total files:", Object.keys(data).length);