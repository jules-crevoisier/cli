const fs=require("fs");
const path=require("path");
const B="C:/Users/Crevoisier/Desktop/cli/src/templates/modules";
function w(r,c){const f=path.join(B,r);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,c,"utf8");console.log("W:"+r);}
