"use client";

import { useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { COMPONENTS } from "../../lib/data.js";
import { Card, SL, Metric } from "../ui/primitives.jsx";

export function CostTab({result}) {
  const totalBase=COMPONENTS.reduce((s,c)=>s+c.cost,0);
  const canRef=useRef(null),cInst=useRef(null);
  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    const sorted=[...COMPONENTS].sort((a,b)=>b.cost-a.cost);
    cInst.current=new window.Chart(canRef.current,{type:"bar",data:{labels:sorted.map(c=>c.name.split("/")[0].trim()),datasets:[{data:sorted.map(c=>c.cost),backgroundColor:sorted.map(c=>rBg(c.geoRisk)),borderColor:sorted.map(c=>rCol(c.geoRisk)),borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:C.steel,font:{size:9},maxRotation:35}},y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:10},callback:v=>"$"+(v/1000).toFixed(1)+"K"}}}}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[]);
  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
        <Metric label="Base component cost" value={"$"+Math.round(totalBase/1000)+"K"} sub="no learning, no scenario" accent={C.steel}/>
        <Metric label="Scenario-adjusted" value={"$"+Math.round(result.costPerRobot/1000)+"K"} sub="learning curve + scenario stress" accent={C.amber}/>
        <Metric label="Cost multiplier" value={(result.costPerRobot/totalBase).toFixed(2)+"×"} sub={result.costPerRobot<totalBase?"below base — learning curve":"above base — scenario stress"} accent={result.costPerRobot<totalBase?C.green:C.red}/>
      </div>
      <Card><SL>Component base costs</SL><div style={{position:"relative",height:240}}><canvas ref={canRef}></canvas></div></Card>
      <Card>
        <SL>Per-component detail</SL>
        {[...COMPONENTS].sort((a,b)=>b.cost-a.cost).map(c=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:12,color:C.text,flex:1}}>{c.name}</span>
            <div style={{width:80,height:4,background:C.bg3,borderRadius:2}}><div style={{height:4,width:`${Math.round((c.cost/3500)*100)}%`,background:rCol(c.geoRisk),borderRadius:2}}/></div>
            <span style={{fontSize:12,fontWeight:500,color:C.text,width:55,textAlign:"right"}}>${c.cost.toLocaleString()}</span>
            <span style={{fontSize:10,color:C.textMuted,width:26,textAlign:"right"}}>{Math.round((c.cost/totalBase)*100)}%</span>
            <span style={{fontSize:10,color:C.textMuted,width:40,textAlign:"right"}}>±{Math.round(c.volatility*100)}% vol</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
