const fs=require("fs");
const b="C:/Users/Crevoisier/Desktop/cli/src/templates/modules";
const T=(t,c)=>String.fromCharCode(60)+"%"+t+" "+c+" %"+String.fromCharCode(62);
const E=c=>T("=",c),S=c=>T("",c);
const w=(r,c)=>{fs.writeFileSync(b+"/"+r,c);console.log("W:",r)};
