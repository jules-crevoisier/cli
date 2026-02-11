const fs = require("fs");
const path = require("path");
const B = "C:/Users/Crevoisier/Desktop/cli/src/templates/modules";
function w(r, c) { fs.mkdirSync(path.dirname(path.join(B, r)), { recursive: true }); fs.writeFileSync(path.join(B, r), c, "utf8"); console.log("Wrote: " + r); }

// All templates will be read from separate data files
const templates = require("./template-data.json");
for (const [relPath, content] of Object.entries(templates)) {
  w(relPath, content);
}
console.log("All templates written!");