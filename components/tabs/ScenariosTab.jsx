"use client";

import { C, rCol, fmt } from "../../lib/colors.js";
import { PRESETS } from "../../lib/data.js";
import { Card, SL } from "../ui/primitives.jsx";
import { GeoRiskLegend } from "./OverviewTab.jsx";

export function ScenariosTab({sc,setS,result,saved,setSaved}) {
  const sliders=[
    {k:"tw",l:"Trade war intensity",     desc:"US-China tariffs, export controls",      min:0, max:100,unit:"%",   col:C.red},
    {k:"rn",l:"Resource nationalism",    desc:"Export bans, royalty increases",          min:0, max:100,unit:"%",   col:C.amber},
    {k:"tr",l:"Taiwan strait risk",      desc:"Semiconductor supply disruption risk",    min:0, max:100,unit:"%",   col:C.red},
    {k:"dg",l:"Demand growth rate",      desc:"Annual growth in global robot demand",    min:0, max:50, unit:"%/yr",col:C.blue},
    {k:"rs",l:"Reshoring speed",         desc:"Manufacturing returning to home nations", min:0, max:100,unit:"%",   col:C.green},
    {k:"rc",l:"Recycling / substitution",desc:"Material recovery & alternatives",        min:0, max:40, unit:"%",   col:C.green},
    {k:"yr",l:"Target year",             desc:"Forecast horizon",                        min:2025,max:2040,unit:"",col:C.steel},
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",alignItems:"start"}}>
      <div style={{display:"grid",gap:"1.25rem"}}>
        <Card>
          <SL>Presets</SL>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {PRESETS.map(p=><button key={p.name} onClick={()=>Object.entries(p.sc).forEach(([k,v])=>setS(k,v))} style={{fontSize:12,padding:"5px 14px",borderRadius:20,border:`1px solid ${C.borderHi}`,background:C.bg3,color:C.textSub,cursor:"pointer"}}>{p.name}</button>)}
          </div>
        </Card>
        <Card>
          <SL>Parameters</SL>
          {sliders.map(s=>(
            <div key={s.k} style={{marginBottom:"1rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <div><div style={{fontSize:12,fontWeight:500,color:C.text}}>{s.l}</div><div style={{fontSize:10,color:C.textMuted}}>{s.desc}</div></div>
                <span style={{fontSize:14,fontWeight:600,color:s.col,minWidth:40,textAlign:"right"}}>{sc[s.k]}{s.unit}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.k==="yr"?1:5} value={sc[s.k]} onChange={e=>setS(s.k,+e.target.value)} style={{width:"100%",accentColor:s.col}}/>
            </div>
          ))}
          <button onClick={()=>setSaved(p=>[...p,{...sc,label:`Scenario ${p.length+1}`,maxR:result.maxR,cost:result.costPerRobot,risk:result.geoRisk}])} style={{marginTop:4,fontSize:12,padding:"6px 0",borderRadius:20,border:`1px solid ${C.blue}66`,background:C.blueD,color:C.blue,cursor:"pointer",width:"100%"}}>Save scenario</button>
        </Card>
      </div>
      <div style={{display:"grid",gap:"1.25rem"}}>
        <Card>
          <SL>Output</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
            {[{l:"Max robots",v:fmt(result.maxR),a:C.blue},{l:"Cost/robot",v:"$"+Math.round(result.costPerRobot/1000)+"K",a:C.amber},{l:"Geo-risk",v:result.geoRisk.toFixed(1)+"/10",a:rCol(result.geoRisk)},{l:"Top bottleneck",v:result.matB[0].short,a:C.red}].map(x=>(
              <div key={x.l} style={{background:C.bg1,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{x.l}</div>
                <div style={{fontSize:16,fontWeight:600,color:x.a}}>{x.v}</div>
              </div>
            ))}
          </div>
          {[{l:"Material supply",v:result.mfm,col:C.red},{l:"Component capacity",v:result.mfc,col:C.amber},{l:"OEM assembly",v:result.mfo,col:C.green}].map(b=>{
            const bind=b.v===Math.min(result.mfm,result.mfc,result.mfo);
            return <div key={b.l} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",marginBottom:3,borderRadius:7,background:bind?C.redD:C.bg1,border:bind?`1px solid ${C.red}44`:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:bind?C.red:C.textSub}}>{b.l}{bind?" — binding":""}</span>
              <span style={{fontSize:12,fontWeight:500,color:bind?C.red:C.text}}>{fmt(b.v)}</span>
            </div>;
          })}
        </Card>
        <GeoRiskLegend/>
        {saved.length>0&&<Card>
          <SL>Saved scenarios</SL>
          {saved.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <span style={{color:C.textSub}}>{s.label} (yr {s.yr})</span>
              <div style={{display:"flex",gap:10}}>
                <span style={{color:C.blue}}>{fmt(s.maxR)}</span>
                <span style={{color:C.amber}}>${Math.round(s.cost/1000)}K</span>
                <span style={{color:rCol(s.risk)}}>{s.risk.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </Card>}
      </div>
    </div>
  );
}
