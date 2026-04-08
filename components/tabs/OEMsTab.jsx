"use client";

import { useState, useEffect, useRef } from "react";
import { C, fmt } from "../../lib/colors.js";
import { OEMS } from "../../lib/data.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";

const FLAGS = {Japan:"🇯🇵",China:"🇨🇳",Germany:"🇩🇪",Switzerland:"🇨🇭",USA:"🇺🇸",Denmark:"🇩🇰","S.Korea":"🇰🇷",Italy:"🇮🇹"};
function flag(country) {
  for(const [k,v] of Object.entries(FLAGS)){if(country.includes(k))return v;}
  return "🏳";
}

export function OEMsTab({result}) {
  const [filter,setFilter]=useState("All");
  const types=["All",...new Set(OEMS.map(o=>o.type))];
  const sorted=[...result.oemList].sort((a,b)=>b.projCap-a.projCap);
  const filtered=filter==="All"?sorted:sorted.filter(o=>o.type===filter);
  const maxCap=sorted[0]?.projCap||1;
  const canRef=useRef(null),cInst=useRef(null);
  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    const top10=sorted.slice(0,10);
    cInst.current=new window.Chart(canRef.current,{type:"bar",indexAxis:"y",data:{
      labels:top10.map(o=>o.name),
      datasets:[
        {label:"2024 cap.",data:top10.map(o=>o.cap24),backgroundColor:C.steelD,borderColor:C.steel,borderWidth:1},
        {label:"Projected",data:top10.map(o=>Math.round(o.projCap)),backgroundColor:C.blueD,borderColor:C.blue,borderWidth:1},
      ]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10},callback:v=>v+"K"}},y:{grid:{display:false},ticks:{color:C.steel,font:{size:10}}}}}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[result.oemList]);
  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card>
        <div style={{display:"flex",gap:12,marginBottom:8}}>
          {[{l:"2024 capacity",c:C.steel},{l:"Scenario projected",c:C.blue}].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub}}>
              <span style={{width:10,height:10,borderRadius:2,background:x.c+"44",border:`1px solid ${x.c}`,display:"inline-block"}}></span>{x.l}
            </span>
          ))}
        </div>
        <div style={{position:"relative",height:320}}><canvas ref={canRef}></canvas></div>
        <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>OEM growth modelled via S-curve (logistic) capped at each manufacturer's stated maximum capacity multiple. No unbounded exponential extrapolation.</div>
      </Card>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {types.map(t=><button key={t} onClick={()=>setFilter(t)} style={{fontSize:11,padding:"4px 12px",borderRadius:20,border:`1px solid ${filter===t?C.blue:C.border}`,background:filter===t?C.blueD:"transparent",color:filter===t?C.blue:C.textSub,cursor:"pointer"}}>{t}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
        {filtered.map(o=>(
          <div key={o.id} style={{padding:"12px 14px",border:`1px solid ${C.border}`,borderRadius:9,background:C.bg3}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div><div style={{fontSize:12,fontWeight:500,color:C.text}}>{o.name}</div><div style={{fontSize:10,color:C.textSub}}>{flag(o.country)} {o.country}</div></div>
              <Badge col={C.steel} bg={C.steelD}>{o.type}</Badge>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
              <div><div style={{fontSize:9,color:C.textMuted}}>2024</div><div style={{fontSize:12,fontWeight:500,color:C.steel}}>{o.cap24}K</div></div>
              <div><div style={{fontSize:9,color:C.textMuted}}>Projected</div><div style={{fontSize:12,fontWeight:500,color:C.blue}}>{Math.round(o.projCap)}K</div></div>
            </div>
            <div style={{height:3,background:C.bg3,borderRadius:2}}><div style={{height:3,background:C.blue,borderRadius:2,width:`${Math.round((o.projCap/maxCap)*100)}%`}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}
