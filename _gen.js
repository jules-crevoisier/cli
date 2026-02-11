const fs=require("fs"),p=require("path");
const B="C:/Users/Crevoisier/Desktop/cli/src/templates/modules";
const w=(r,c)=>{fs.writeFileSync(p.join(B,r),c);console.log("W:",r)};
const files=[];
