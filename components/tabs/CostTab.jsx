"use client";

import { useState, useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { COMPONENTS } from "../../lib/data.js";
import { Card, SL, Metric } from "../ui/primitives.jsx";

export function CostTab({result}) {
  const [selId, setSelId] = useState(null);
  const selComp = selId ? COMPONENTS.find(c=>c.id===selId) : null;
  const totalBase = COMPONENTS.reduce((s,c)=>s+c.cost,0);

  const canRef  = useRef(null), cInst  = useRef(null);
  const canRef2 = useRef(null), cInst2 = useRef(null);

  // Bar chart — base component costs
  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    const sorted=[...COMPONENTS].sort((a,b)=>b.cost-a.cost);
    cInst.current=new window.Chart(canRef.current,{type:"bar",data:{
      labels:sorted.map(c=>c.name.split("/")[0].trim()),
      datasets:[{data:sorted.map(c=>c.cost),backgroundColor:sorted.map(c=>rBg(c.geoRisk)),borderColor:sorted.map(c=>rCol(c.geoRisk)),borderWidth:1}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{display:false},ticks:{color:C.steel,font:{size:9},maxRotation:35}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10},callback:v=>"$"+(v/1000).toFixed(1)+"K"}},
    }}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[]);

  // Line chart — selected component cost trajectory
  useEffect(()=>{
    if(!canRef2.current||!window.Chart||!selComp)return;
    if(cInst2.current)cInst2.current.destroy();
    const trajCosts=result.traj.map(t=>t.compCosts.find(c=>c.id===selComp.id)?.cost||0);
    cInst2.current=new window.Chart(canRef2.current,{type:"line",data:{
      labels:result.traj.map(t=>t.year),
      datasets:[{
        label:"Cost trajectory",
        data:trajCosts,
        borderColor:rCol(selComp.geoRisk),
        backgroundColor:rBg(selComp.geoRisk),
        fill:true,borderWidth:2,pointRadius:2,tension:0.3,
      }]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10}}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10},callback:v=>"$"+(v/1000).toFixed(1)+"K"}},
    }}});
    return()=>{if(cInst2.current)cInst2.current.destroy();};
  },[selComp,result.traj]);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
        <Metric label="Base component cost"  value={"$"+Math.round(totalBase/1000)+"K"}                   sub="no learning, no scenario"                                        accent={C.steel}/>
        <Metric label="Scenario-adjusted"    value={"$"+Math.round(result.costPerRobot/1000)+"K"}          sub="learning curve + scenario stress"                                accent={C.amber}/>
        <Metric label="Cost multiplier"      value={(result.costPerRobot/totalBase).toFixed(2)+"×"}        sub={result.costPerRobot<totalBase?"below base — learning curve":"above base — scenario stress"} accent={result.costPerRobot<totalBase?C.green:C.red}/>
      </div>

      <Card><SL>Component base costs (geo-risk colour)</SL><div style={{position:"relative",height:240}}><canvas ref={canRef}></canvas></div></Card>

      <div style={{display:"grid",gridTemplateColumns:selComp?"1fr 1fr":"1fr",gap:"1.25rem"}}>
        <Card>
          <SL>Per-component detail — click to see cost trajectory</SL>
          {[...COMPONENTS].sort((a,b)=>b.cost-a.cost).map(c=>(
            <div key={c.id}
              onClick={()=>setSelId(selId===c.id?null:c.id)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,borderRadius:8,border:`1px solid ${selId===c.id?rCol(c.geoRisk):C.border}`,background:selId===c.id?rBg(c.geoRisk):C.bg3,cursor:"pointer",transition:"background 0.15s"}}
            >
              <span style={{fontSize:12,color:C.text,flex:1}}>{c.name}</span>
              <div style={{width:72,height:4,background:C.bg1,borderRadius:2}}>
                <div style={{height:4,width:`${Math.round((c.cost/3500)*100)}%`,background:rCol(c.geoRisk),borderRadius:2}}/>
              </div>
              <span style={{fontSize:12,fontWeight:500,color:C.text,width:55,textAlign:"right"}}>${c.cost.toLocaleString()}</span>
              <span style={{fontSize:10,color:C.textMuted,width:26,textAlign:"right"}}>{Math.round((c.cost/totalBase)*100)}%</span>
              <span style={{fontSize:10,color:C.textMuted,width:44,textAlign:"right"}}>±{Math.round(c.volatility*100)}% vol</span>
            </div>
          ))}
        </Card>

        {selComp&&<Card>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:3}}>{selComp.name}</div>
          <div style={{fontSize:11,color:C.textSub,marginBottom:12}}>
            Base: ${selComp.cost.toLocaleString()} · Lead: {selComp.lead}wk · Volatility: ±{Math.round(selComp.volatility*100)}%
          </div>
          <SL>Cost trajectory under current scenario</SL>
          <div style={{position:"relative",height:180,marginBottom:14}}><canvas ref={canRef2}></canvas></div>
          <SL>Key manufacturers</SL>
          {selComp.makers.map(k=>(
            <div key={k.co} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.text}}>{k.co}</span>
              <span style={{color:C.textSub}}>{k.cn}</span>
            </div>
          ))}
        </Card>}
      </div>
    </div>
  );
}
