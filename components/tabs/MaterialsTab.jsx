"use client";

import { useState, useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";
import { GeoRiskLegend } from "./OverviewTab.jsx";

export function MaterialsTab({result}) {
  const [sel,setSel]=useState(null);
  const mat=sel?result.matB.find(m=>m.id===sel):null;
  const canRef=useRef(null),cInst=useRef(null);

  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    const top=result.matB.slice(0,8);
    cInst.current=new window.Chart(canRef.current,{type:"bar",data:{
      labels:top.map(m=>m.short),
      datasets:[{data:top.map(m=>m.geoRisk),backgroundColor:top.map(m=>rBg(m.geoRisk)),borderColor:top.map(m=>rCol(m.geoRisk)),borderWidth:1}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{display:false},ticks:{color:C.steel,font:{size:10}}},
      y:{min:0,max:10,grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10}}},
    }}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[result.matB]);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card>
        <SL>Geo-risk by material</SL>
        <div style={{position:"relative",height:180}}><canvas ref={canRef}></canvas></div>
        <GeoRiskLegend/>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:mat?"1fr 1fr":"1fr",gap:"1.25rem"}}>
        <Card>
          <SL>All materials — ranked by bottleneck severity</SL>
          {result.matB.map((m,i)=>(
            <div key={m.id} onClick={()=>setSel(sel===m.id?null:m.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,borderRadius:8,border:`1px solid ${sel===m.id?C.blue:C.border}`,background:sel===m.id?C.blueD:C.bg3,cursor:"pointer",transition:"background 0.15s"}}>
              <span style={{fontSize:10,color:C.textMuted,width:14}}>#{i+1}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:C.text}}>{m.name}</div>
                <div style={{fontSize:10,color:C.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.desc}</div>
              </div>
              <Badge col={rCol(m.geoRisk)} bg={rBg(m.geoRisk)}>{m.geoRisk}/10</Badge>
            </div>
          ))}
        </Card>
        {mat&&<Card>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:3}}>{mat.name}</div>
          <div style={{fontSize:12,color:C.textSub,marginBottom:16}}>{mat.desc}</div>
          {[{title:"Top producers",data:mat.producers,col:C.blue},{title:"Refining",data:mat.refiners,col:C.orange}].map(s=>(
            <div key={s.title} style={{marginBottom:14}}>
              <SL>{s.title}</SL>
              {s.data.map(p=>(
                <div key={p.c} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:11,color:C.textSub,width:80,flexShrink:0}}>{p.c}</span>
                  <div style={{flex:1,height:4,background:C.bg3,borderRadius:2}}><div style={{width:`${p.s}%`,height:4,background:s.col,borderRadius:2,transition:"width 0.4s"}}/></div>
                  <span style={{fontSize:11,color:s.col,width:26,textAlign:"right",fontFamily:"monospace"}}>{p.s}%</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
            <div style={{background:C.bg3,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.textMuted,marginBottom:3}}>Global supply</div>
              <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:"monospace"}}>{mat.supply} {mat.unit}</div>
            </div>
            <div style={{background:C.bg3,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.textMuted,marginBottom:3}}>Geo-risk</div>
              <div style={{fontSize:13,fontWeight:600,color:rCol(mat.geoRisk),fontFamily:"monospace"}}>{mat.geoRisk}/10</div>
            </div>
          </div>
        </Card>}
      </div>
    </div>
  );
}
