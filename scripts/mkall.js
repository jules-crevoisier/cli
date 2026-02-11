const fs=require("fs"),path=require("path");
const B="C:/Users/Crevoisier/Desktop/cli/src/templates/modules";
function w(r,c){const f=path.join(B,r);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,c);console.log(r);}
w("admin/nextjs/src/app/admin/layout.tsx.ejs",
["import { redirect } from next/navigation;",
