"use client";

import { useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { MATERIALS, POLICY } from "../../lib/data.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";

export function TrajectoryTab({result}) {
  const c1=useRef(null),c2=useRef(null),ci1=useRef(null),ci2=useRef(null);

  useEffect(()=>{
    if(!c1.current||!window.Chart)return;
    if(ci1.current)ci1.current.destroy();
    const labels=result.traj.map(t=>t.year);
    ci1.current=new window.Chart(c1.current,{type:"line",data:{labels,datasets:[
      {label:"Binding ceiling",data:result.traj.map(t=>t.robots),   borderColor:C.orange, backgroundColor:"rgba(232,133,77,0.07)", fill:true, borderWidth:2,pointRadius:2,tension:0.35},
      {label:"Material",       data:result.traj.map(t=>t.matCap),   borderColor:C.red,    borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
      {label:"Components",     data:result.traj.map(t=>t.compCap),  borderColor:C.blue,   borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
      {label:"OEM",            data:result.traj.map(t=>t.oemCap),   borderColor:C.teal,   borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11}}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11},callback:v=>v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(0)+"K":v}},
    }}});
  },[result.traj]);

  useEffect(()=>{
    if(!c2.current||!window.Chart)return;
    if(ci2.current)ci2.current.destroy();
    const labels=result.traj.map(t=>t.year);
    ci2.current=new window.Chart(c2.current,{type:"line",data:{labels,datasets:[
      {label:"Cost/robot",data:result.traj.map(t=>t.costPerRobot),borderColor:C.amber,backgroundColor:"rgba(245,158,11,0.07)",fill:true,borderWidth:2,pointRadius:2,tension:0.35},
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11}}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11},callback:v=>"$"+(v/1000).toFixed(0)+"K"}},
    }}});
    return()=>{if(ci1.current)ci1.current.destroy();if(ci2.current)ci2.current.destroy();};
  },[result.traj]);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card>
        <div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>
          {[{l:"Binding ceiling",c:C.orange,d:false},{l:"Material",c:C.red,d:true},{l:"Components",c:C.blue,d:true},{l:"OEM",c:C.teal,d:true}].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textSub}}>
              <span style={{display:"inline-block",width:18,height:0,borderTop:`${x.d?"2px dashed":"2px solid"} ${x.c}`}}></span>{x.l}
            </span>
          ))}
        </div>
        <div style={{position:"relative",height:280}}><canvas ref={c1}></canvas></div>
      </Card>
      <Card>
        <div style={{fontSize:12,color:C.textSub,marginBottom:10}}>Cost per robot — Wright's Law learning curve drives cost down with cumulative production. Geopolitical stress pushes it back up.</div>
        <div style={{position:"relative",height:200}}><canvas ref={c2}></canvas></div>
      </Card>
      <Card>
        <SL>Policy events</SL>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
          {POLICY.map(e=>{const mat=MATERIALS.find(m=>m.id===e.mat);return(
            <div key={e.name} style={{padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:8,borderLeft:`2px solid ${e.type==="restriction"?C.red:C.green}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:10,color:C.textMuted}}>{e.year}</span>
                <Badge col={e.type==="restriction"?C.red:C.green} bg={e.type==="restriction"?C.redD:C.greenD}>{e.type}</Badge>
              </div>
              <div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:2}}>{e.name}</div>
              <div style={{fontSize:11,color:C.textSub}}>{mat?.name} · {e.impact>0?"+":""}{Math.round(e.impact*100)}%</div>
            </div>
          );})}
        </div>
      </Card>
    </div>
  );
}
