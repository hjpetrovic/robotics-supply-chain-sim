"use client";

import { C, rCol, rBg, fmt } from "../../lib/colors.js";
import { PRESETS } from "../../lib/data.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";

export function GeoRiskLegend() {
  return (
    <div style={{marginTop:12,padding:"8px 10px",background:C.bg3,borderRadius:8,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
      <span style={{fontSize:10,color:C.textMuted}}>Geo-risk scale:</span>
      {[{range:"0–5",label:"Low",col:C.green,bg:C.greenD},{range:"6–7",label:"Elevated",col:C.amber,bg:C.amberD},{range:"8–10",label:"Critical",col:C.red,bg:C.redD}].map(x=>(
        <span key={x.label} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}>
          <span style={{padding:"1px 6px",borderRadius:10,background:x.bg,color:x.col,fontWeight:500}}>{x.range}</span>
          <span style={{color:C.textMuted}}>{x.label}</span>
        </span>
      ))}
      <span style={{fontSize:10,color:C.textMuted,marginLeft:4}}>based on producer concentration, political stability & refining dependency</span>
    </div>
  );
}

export function OverviewTab({result,sc,setS,validationIssues}) {
  const maxV=Math.max(result.mfm,result.mfc,result.mfo,1);
  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card>
        <SL>Quick scenarios</SL>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"}}>
          {PRESETS.map(p=><button key={p.name} onClick={()=>Object.entries(p.sc).forEach(([k,v])=>setS(k,v))} style={{fontSize:12,padding:"5px 14px",borderRadius:20,border:`0.5px solid ${C.borderHi}`,background:C.bg3,color:C.textSub,cursor:"pointer"}}>{p.name}</button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"0.75rem 2rem"}}>
          {[{k:"tw",l:"Trade war",col:C.red},{k:"tr",l:"Taiwan risk",col:C.red},{k:"rn",l:"Resource nationalism",col:C.amber},{k:"rs",l:"Reshoring speed",col:C.green}].map(s=>(
            <div key={s.k}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,color:C.textSub}}>{s.l}</span>
                <span style={{fontSize:12,fontWeight:500,color:s.col}}>{sc[s.k]}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={sc[s.k]} onChange={e=>setS(s.k,+e.target.value)} style={{width:"100%",accentColor:s.col}}/>
            </div>
          ))}
        </div>
        <div style={{marginTop:"0.75rem",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:C.textMuted}}>Year:</span>
          {[2027,2030,2033,2035,2040].map(y=>(
            <button key={y} onClick={()=>setS("yr",y)} style={{fontSize:11,padding:"3px 10px",borderRadius:20,border:`0.5px solid ${sc.yr===y?C.blue:C.border}`,background:sc.yr===y?C.blueD:"transparent",color:sc.yr===y?C.blue:C.textMuted,cursor:"pointer"}}>{y}</button>
          ))}
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>
        <Card>
          <SL>Supply constraint ceilings</SL>
          {[{l:"Material supply",v:result.mfm,col:C.red},{l:"Component capacity",v:result.mfc,col:C.amber},{l:"OEM assembly",v:result.mfo,col:C.green}].map(b=>(
            <div key={b.l} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:C.textSub}}>{b.l}</span>
                <span style={{fontWeight:500,color:b.col}}>{fmt(b.v)}</span>
              </div>
              <div style={{height:5,background:C.bg3,borderRadius:3}}>
                <div style={{height:5,background:b.col,borderRadius:3,width:`${Math.round((b.v/maxV)*100)}%`,transition:"width 0.4s"}}/>
              </div>
            </div>
          ))}
          <div style={{padding:"8px 12px",background:C.blueD,border:`0.5px solid ${C.blue}33`,borderRadius:8,fontSize:12,marginTop:8}}>
            <span style={{color:C.blue,fontWeight:500}}>Binding: </span><span style={{color:C.blue}}>{result.binding}</span>
          </div>
        </Card>
        <Card>
          <SL>Top material bottlenecks</SL>
          {result.matB.slice(0,5).map((m,i)=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
              <span style={{fontSize:10,color:C.textMuted,width:14}}>#{i+1}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                <div style={{fontSize:10,color:C.textSub}}>{m.producers[0].c} {m.producers[0].s}% production</div>
              </div>
              <Badge col={rCol(m.geoRisk)} bg={rBg(m.geoRisk)}>{m.geoRisk}/10</Badge>
            </div>
          ))}
          <GeoRiskLegend/>
        </Card>
      </div>

      <Card>
        <SL>Mathematical validation — deterministic</SL>
        {validationIssues.length===0?(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:C.greenD,border:`0.5px solid ${C.green}44`,borderRadius:8}}>
            <span style={{color:C.green,fontSize:18,lineHeight:1}}>✓</span>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:C.green}}>All 8 checks passed</div>
              <div style={{fontSize:11,color:C.textSub}}>min-constraint, bounds, learning curve monotonicity, OEM ceiling, supply factor clamps, cost floor, trade war monotonicity</div>
            </div>
          </div>
        ):(
          <div style={{display:"grid",gap:5}}>
            {validationIssues.map((iss,i)=>(
              <div key={i} style={{padding:"7px 12px",background:C.redD,border:`0.5px solid ${C.red}44`,borderRadius:7,fontSize:12,color:C.red}}>{iss}</div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
