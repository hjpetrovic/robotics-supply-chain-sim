"use client";

import { useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { MATERIALS, POLICY } from "../../lib/data.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";

const TYPE_COLORS = {
  Industrial:    C.blue,
  Collaborative: C.teal,
  Mobile:        C.green,
  Humanoid:      C.orange,
};

export function TrajectoryTab({result}) {
  const c1=useRef(null),c2=useRef(null),c3=useRef(null);
  const ci1=useRef(null),ci2=useRef(null),ci3=useRef(null);

  // Chart 1 — four supply/demand ceilings (no "binding" line — it's redundant)
  useEffect(()=>{
    if(!c1.current||!window.Chart)return;
    if(ci1.current)ci1.current.destroy();
    const labels=result.traj.map(t=>t.year);
    ci1.current=new window.Chart(c1.current,{type:"line",data:{labels,datasets:[
      {label:"Material",   data:result.traj.map(t=>t.matCap),  borderColor:C.red,    borderWidth:1.5,borderDash:[5,4], pointRadius:0,tension:0.35,fill:false},
      {label:"Components", data:result.traj.map(t=>t.compCap), borderColor:C.blue,   borderWidth:1.5,borderDash:[5,4], pointRadius:0,tension:0.35,fill:false},
      {label:"OEM",        data:result.traj.map(t=>t.oemCap),  borderColor:C.teal,   borderWidth:1.5,borderDash:[8,3], pointRadius:0,tension:0.35,fill:false},
      {label:"Demand",     data:result.traj.map(t=>t.demandCap),borderColor:C.purple,borderWidth:1.5,borderDash:[2,6], pointRadius:0,tension:0.35,fill:false},
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
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11},callback:v=>"$"+(v/1000).toFixed(1)+"K"}},
    }}});
    return()=>{if(ci2.current)ci2.current.destroy();};
  },[result.traj]);

  // Chart 3 — robot output by type (lines, not stacked — so humanoid growth is visible)
  useEffect(()=>{
    if(!c3.current||!window.Chart)return;
    if(ci3.current)ci3.current.destroy();
    const labels=result.traj.map(t=>t.year);
    ci3.current=new window.Chart(c3.current,{type:"line",data:{labels,datasets:
      Object.entries(TYPE_COLORS).map(([type,col])=>({
        label:type,
        data:result.traj.map(t=>t.typeRobots?.[type]||0),
        borderColor:col,
        borderWidth:type==="Humanoid"?2.5:1.5,
        pointRadius:type==="Humanoid"?3:1,
        tension:0.35,
        fill:false,
      }))
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
      x:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11}}},
      y:{grid:{color:C.bg3},ticks:{color:C.steel,font:{size:11},callback:v=>v>=1e3?(v/1e3).toFixed(1)+"K":v}},
    }}});
    return()=>{if(ci3.current)ci3.current.destroy();};
  },[result.traj]);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>

      <Card>
        <SL>Supply & demand ceilings — binding output is the minimum across all four</SL>
        <div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>
          {[
            {l:"Material",   c:C.red,    dash:"5 4"},
            {l:"Components", c:C.blue,   dash:"5 4"},
            {l:"OEM",        c:C.teal,   dash:"8 3"},
            {l:"Demand",     c:C.purple, dash:"2 6"},
          ].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.textSub}}>
              <svg width="20" height="2" style={{overflow:"visible"}}>
                <line x1="0" y1="1" x2="20" y2="1" stroke={x.c} strokeWidth="1.5" strokeDasharray={x.dash}/>
              </svg>
              {x.l}
            </span>
          ))}
        </div>
        <div style={{position:"relative",height:260}}><canvas ref={c1}></canvas></div>
      </Card>

      <Card>
        <SL>Robot output by type — derived from OEM capacity mix each year</SL>
        <div style={{display:"flex",gap:16,marginBottom:8,flexWrap:"wrap"}}>
          {Object.entries(TYPE_COLORS).map(([t,col])=>(
            <span key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub}}>
              <span style={{width:16,height:0,display:"inline-block",borderTop:`2px solid ${col}`}}></span>{t}
            </span>
          ))}
        </div>
        <div style={{fontSize:11,color:C.textMuted,marginBottom:10,padding:"6px 10px",background:C.bg3,borderRadius:6,borderLeft:`2px solid ${C.orange}`}}>
          Humanoids start from a tiny 2024 base (~1.5K units) but have the steepest growth curve (up to 15×). Their absolute output grows significantly over the period but remains small relative to industrial scale. Use high-demand scenarios (dg &gt; 20%) to accelerate learning-curve cost declines for all types.
        </div>
        <div style={{position:"relative",height:220}}><canvas ref={c3}></canvas></div>
      </Card>

      <Card>
        <div style={{fontSize:12,color:C.textSub,marginBottom:10}}>
          Cost per robot — Wright's Law: 15% reduction per cumulative production doubling. Higher demand growth accelerates this. Geopolitical stress pushes cost back up.
        </div>
        <div style={{position:"relative",height:180}}><canvas ref={c2}></canvas></div>
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
