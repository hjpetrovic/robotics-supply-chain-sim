"use client";

import { useState, useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";

export function ComponentsTab({result}) {
  const [sel,setSel]=useState(null);
  const comp=sel?result.compB.find(c=>c.id===sel):null;
  const canRef=useRef(null),cInst=useRef(null);
  const canRef2=useRef(null),cInst2=useRef(null);

  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    cInst.current=new window.Chart(canRef.current,{type:"bar",data:{
      labels:result.compB.map(c=>c.name.split("/")[0].trim()),
      datasets:[{data:result.compB.map(c=>c.cost),backgroundColor:result.compB.map(c=>rBg(c.geoRisk)),borderColor:result.compB.map(c=>rCol(c.geoRisk)),borderWidth:1}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{display:false},ticks:{color:C.steel,font:{size:9},maxRotation:35}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10},callback:v=>"$"+(v/1000).toFixed(1)+"K"}},
    }}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[]);

  useEffect(()=>{
    if(!canRef2.current||!window.Chart||!comp)return;
    if(cInst2.current)cInst2.current.destroy();
    const trajCosts=result.traj.map(t=>t.compCosts.find(c=>c.id===comp.id)?.cost||0);
    cInst2.current=new window.Chart(canRef2.current,{type:"line",data:{
      labels:result.traj.map(t=>t.year),
      datasets:[{label:"Cost trajectory",data:trajCosts,borderColor:C.amber,backgroundColor:"rgba(245,158,11,0.07)",fill:true,borderWidth:2,pointRadius:2,tension:0.3}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10}}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10},callback:v=>"$"+(v/1000).toFixed(1)+"K"}},
    }}});
    return()=>{if(cInst2.current)cInst2.current.destroy();};
  },[comp,result.traj]);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card><SL>Component base costs (coloured by geo-risk)</SL><div style={{position:"relative",height:200}}><canvas ref={canRef}></canvas></div></Card>
      <div style={{display:"grid",gridTemplateColumns:comp?"1fr 1fr":"1fr",gap:"1.25rem"}}>
        <Card>
          <SL>Components — ranked by bottleneck severity</SL>
          {result.compB.map((c,i)=>(
            <div key={c.id} onClick={()=>setSel(sel===c.id?null:c.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,borderRadius:8,border:`1px solid ${sel===c.id?C.blue:C.border}`,background:sel===c.id?C.blueD:C.bg3,cursor:"pointer",transition:"background 0.15s"}}>
              <span style={{fontSize:10,color:C.textMuted,width:14}}>#{i+1}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:C.text}}>{c.name}</div>
                <div style={{fontSize:10,color:C.textSub}}>Lead: {c.lead}wk · ${(c.cost/1000).toFixed(1)}K base · ±{Math.round(c.volatility*100)}% vol.</div>
              </div>
              <Badge col={rCol(c.geoRisk)} bg={rBg(c.geoRisk)}>{c.geoRisk}</Badge>
            </div>
          ))}
        </Card>
        {comp&&<Card>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:3}}>{comp.name}</div>
          <div style={{fontSize:11,color:C.textSub,marginBottom:12}}>Lead: {comp.lead}wk · Base cost: ${comp.cost.toLocaleString()} · Volatility: ±{Math.round(comp.volatility*100)}%</div>
          <SL>Price trajectory under current scenario</SL>
          <div style={{position:"relative",height:160,marginBottom:14}}><canvas ref={canRef2}></canvas></div>
          <SL>Key manufacturers</SL>
          {comp.makers.map(k=>(
            <div key={k.co} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.text}}>{k.co}</span><span style={{color:C.textSub}}>{k.cn}</span>
            </div>
          ))}
        </Card>}
      </div>
    </div>
  );
}
