"use client";

import { useState } from "react";
import { C, rCol, fmt } from "../lib/colors.js";
import { TABS, DEF, MATERIALS, COMPONENTS, OEMS } from "../lib/data.js";
import { sim, validate } from "../lib/simulation.js";
import { Metric } from "./ui/primitives.jsx";
import { OverviewTab } from "./tabs/OverviewTab.jsx";
import { ScenariosTab } from "./tabs/ScenariosTab.jsx";
import { TrajectoryTab } from "./tabs/TrajectoryTab.jsx";
import { FlowMapTab } from "./tabs/FlowMapTab.jsx";
import { MaterialsTab } from "./tabs/MaterialsTab.jsx";
import { ComponentsTab } from "./tabs/ComponentsTab.jsx";
import { OEMsTab } from "./tabs/OEMsTab.jsx";
import { CostTab } from "./tabs/CostTab.jsx";
import { MethodologyTab } from "./tabs/MethodologyTab.jsx";

// Load Chart.js once
if (typeof window !== "undefined" && !window.Chart) {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
  document.head.appendChild(s);
}

export default function App() {
  const [tab, setTab] = useState("Overview");
  const [sc, setSc] = useState(DEF);
  const [saved, setSaved] = useState([]);
  const [valLog, setValLog] = useState([]);
  const setS = (k, v) => setSc(p => ({...p, [k]: v}));
  const result = sim(sc);
  const validationIssues = validate(sc, result);

  return (
    <div style={{background:C.bg0,minHeight:"100vh",color:C.text,fontFamily:"var(--font-sans)",padding:"1.5rem 1.25rem 3rem"}}>
      {/* header */}
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{fontSize:11,color:C.blue,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:500,marginBottom:3}}>Robotics Supply Chain</div>
        <h1 style={{fontSize:22,fontWeight:600,margin:"0 0 2px",letterSpacing:"-0.02em",color:C.white}}>Bottleneck Simulator</h1>
        <p style={{fontSize:12,color:C.textMuted,margin:0}}>{MATERIALS.length} materials · {COMPONENTS.length} components · {OEMS.length} OEMs · Wright's Law learning curve · client-side</p>
      </div>

      {/* kpi */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8,marginBottom:"1.25rem"}}>
        <Metric label="Max robots/yr" value={fmt(result.maxR)} sub="supply-constrained ceiling" accent={C.blue}/>
        <Metric label="Binding constraint" value={result.binding.split(":")[0]} sub={result.binding.includes(":")?result.binding.split(":")[1].trim():"assembly"} accent={C.red}/>
        <Metric label="Geo-risk score" value={result.geoRisk.toFixed(1)+"/10"} sub={result.geoRisk>=8?"critical":result.geoRisk>=6?"elevated":"acceptable"} accent={rCol(result.geoRisk)}/>
        <Metric label="Cost per robot" value={"$"+Math.round(result.costPerRobot/1000)+"K"} sub="learning-curve adjusted" accent={C.amber}/>
      </div>

      {/* tabs */}
      <div style={{display:"flex",flexWrap:"wrap",gap:2,borderBottom:`0.5px solid ${C.border}`,marginBottom:"1.5rem"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 13px",fontSize:12,border:"none",borderBottom:tab===t?`2px solid ${C.blue}`:"2px solid transparent",background:"transparent",color:tab===t?C.blue:C.textSub,cursor:"pointer",fontWeight:tab===t?500:400,whiteSpace:"nowrap",marginBottom:-1}}>{t}</button>
        ))}
      </div>

      {/* tab content */}
      {tab==="Overview"    && <OverviewTab    result={result} sc={sc} setS={setS} validationIssues={validationIssues}/>}
      {tab==="Scenarios"   && <ScenariosTab   sc={sc} setS={setS} result={result} saved={saved} setSaved={setSaved}/>}
      {tab==="Trajectory"  && <TrajectoryTab  result={result}/>}
      {tab==="Flow Map"    && <FlowMapTab/>}
      {tab==="Materials"   && <MaterialsTab   result={result}/>}
      {tab==="Components"  && <ComponentsTab  result={result}/>}
      {tab==="OEMs"        && <OEMsTab        result={result}/>}
      {tab==="Cost"        && <CostTab        result={result}/>}
      {tab==="Methodology" && <MethodologyTab/>}
    </div>
  );
}
