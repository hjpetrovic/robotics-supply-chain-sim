"use client";

import { useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { MATERIALS, POLICY } from "../../lib/data.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";

const TYPE_COLORS = {
  Industrial:   C.blue,
  Collaborative:C.teal,
  Mobile:       C.green,
  Humanoid:     C.orange,
};

export function TrajectoryTab({result}) {
  const c1=useRef(null),c2=useRef(null),c3=useRef(null);
  const ci1=useRef(null),ci2=useRef(null),ci3=useRef(null);

  // Chart 1 — supply ceilings vs binding output
  useEffect(()=>{
    if(!c1.current||!window.Chart)return;
    if(ci1.current)ci1.current.destroy();
    const labels=result.traj.map(t=>t.year);
    ci1.current=new window.Chart(c1.current,{type:"line",data:{labels,datasets:[
      {label:"Binding ceiling",data:result.traj.map(t=>t.robots),   borderColor:C.orange, backgroundColor:"rgba(232,133,77,0.07)", fill:true, borderWidth:2,pointRadius:2,tension:0.35},
      {label:"Material",       data:result.traj.map(t=>t.matCap),   borderColor:C.red,    borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
      {label:"Components",     data:result.traj.map(t=>t.compCap),  borderColor:C.blue,   borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
      {label:"OEM",            data:result.traj.map(t=>t.oemCap),   borderColor:C.teal,   borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
      {label:"Demand",         data:result.traj.map(t=>t.demandCap),borderColor:C.steel,  borderWidth:1,borderDash:[3,5],pointRadius:0,tension:0.35,fill:false},
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11}}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11},callback:v=>v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(0)+"K":v}},
    }}});
    return()=>{if(ci1.current)ci1.current.destroy();};
  },[result.traj]);

  // Chart 2 — cost per robot
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
    return()=>{if(ci2.current)ci2.current.destroy();};
  },[result.traj]);

  // Chart 3 — robot output by type (derived from OEM capacity mix)
  useEffect(()=>{
    if(!c3.current||!window.Chart)return;
    if(ci3.current)ci3.current.destroy();
    const labels=result.traj.map(t=>t.year);
    const types=Object.keys(TYPE_COLORS);
    ci3.current=new window.Chart(c3.current,{type:"line",data:{labels,datasets:
      types.map(type=>({
        label:type,
        data:result.traj.map(t=>t.typeRobots?.[type]||0),
        borderColor:TYPE_COLORS[type],
        backgroundColor:TYPE_COLORS[type]+"14",
        fill:true,
        borderWidth:2,
        pointRadius:2,
        tension:0.35,
      }))
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11}}},
      y:{stacked:true,grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11},callback:v=>v>=1e3?(v/1e3).toFixed(0)+"K":v}},
    }}});
    return()=>{if(ci3.current)ci3.current.destroy();};
  },[result.traj]);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card>
        <div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>
          {[
            {l:"Binding ceiling",c:C.orange,d:false},
            {l:"Material",c:C.red,d:true},
            {l:"Components",c:C.blue,d:true},
            {l:"OEM",c:C.teal,d:true},
            {l:"Demand",c:C.steel,d:true},
          ].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textSub}}>
              <span style={{display:"inline-block",width:18,height:0,borderTop:`${x.d?"2px dashed":"2px solid"} ${x.c}`}}></span>{x.l}
            </span>
          ))}
        </div>
        <div style={{position:"relative",height:280}}><canvas ref={c1}></canvas></div>
      </Card>

      <Card>
        <SL>Robot output by type — derived from OEM capacity mix</SL>
        <div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>
          {Object.entries(TYPE_COLORS).map(([t,col])=>(
            <span key={t} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textSub}}>
              <span style={{width:10,height:10,borderRadius:2,background:col+"33",border:`1px solid ${col}`,display:"inline-block"}}></span>{t}
            </span>
          ))}
        </div>
        <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>
          Type mix is proportional to OEM capacity by category. Humanoids are a tiny share today but grow fastest under high-demand scenarios.
        </div>
        <div style={{position:"relative",height:220}}><canvas ref={c3}></canvas></div>
      </Card>

      <Card>
        <div style={{fontSize:12,color:C.textSub,marginBottom:10}}>Cost per robot — Wright's Law: 15% cost reduction per cumulative doubling. Higher demand growth accelerates learning. Geopolitical stress pushes it back up.</div>
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
