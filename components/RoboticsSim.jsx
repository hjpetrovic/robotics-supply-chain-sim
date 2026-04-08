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
    <div style={{
      background: C.bg0,
      minHeight: "100vh",
      color: C.text,
      backgroundImage: `
        radial-gradient(ellipse at 50% -5%, rgba(117,113,228,0.06) 0, transparent 55%),
        radial-gradient(ellipse at 88% 65%, rgba(173,227,226,0.025) 0, transparent 40%)
      `,
    }}>

      {/* ── Sticky header ──────────────────────────────────────────────────────── */}
      <div style={{position: "sticky", top: 0, zIndex: 50}}>
        <div style={{
          background: "rgba(8,12,34,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}>
          <div style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            height: "3.5rem",
            gap: "1rem",
          }}>
            <div>
              <div style={{
                fontSize: 9,
                color: "rgba(173,227,226,0.75)",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: 600,
                lineHeight: 1,
                marginBottom: 3,
              }}>
                Exponential View
              </div>
              <div style={{
                fontSize: 15,
                fontWeight: 700,
                color: C.white,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>
                Robotics Supply Chain Simulator
              </div>
            </div>
            <div style={{
              marginLeft: "auto",
              display: "flex",
              gap: "1.25rem",
              fontSize: 11,
              color: C.textMuted,
            }}>
              <span>{MATERIALS.length} materials</span>
              <span>{COMPONENTS.length} components</span>
              <span>{OEMS.length} OEMs</span>
            </div>
          </div>
        </div>
        {/* Crystal gradient border */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, #7571e4 20%, #ade3e2 45%, #52a272 65%, #e8854d 85%, transparent)",
          opacity: 0.65,
        }}/>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────────── */}
      <main style={{maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem 4rem"}}>

        {/* KPI row */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: "2rem"}}>
          <Metric label="Max robots/yr"       value={fmt(result.maxR)}                          sub="supply-constrained ceiling"       accent={C.orange}/>
          <Metric label="Binding constraint"  value={result.binding.split(":")[0]}               sub={result.binding.includes(":")?result.binding.split(":")[1].trim():"assembly"} accent={C.red}/>
          <Metric label="Geo-risk score"      value={result.geoRisk.toFixed(1)+"/10"}            sub={result.geoRisk>=8?"critical":result.geoRisk>=6?"elevated":"acceptable"}      accent={rCol(result.geoRisk)}/>
          <Metric label="Cost per robot"      value={"$"+Math.round(result.costPerRobot/1000)+"K"} sub="learning-curve adjusted"        accent={C.amber}/>
        </div>

        {/* Tab bar */}
        <div style={{borderBottom: `1px solid ${C.border}`, marginBottom: "1.75rem"}}>
          <div style={{display: "flex", flexWrap: "wrap", gap: 0}}>
            {TABS.map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{
                padding: "9px 16px",
                fontSize: 12,
                border: "none",
                borderBottom: tab===t ? `2px solid ${C.blue}` : "2px solid transparent",
                background: "transparent",
                color: tab===t ? C.blue : C.textSub,
                cursor: "pointer",
                fontWeight: tab===t ? 600 : 400,
                whiteSpace: "nowrap",
                marginBottom: -1,
                letterSpacing: "0.01em",
                transition: "color 0.15s ease",
                outline: "none",
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab==="Overview"    && <OverviewTab    result={result} sc={sc} setS={setS} validationIssues={validationIssues}/>}
        {tab==="Scenarios"   && <ScenariosTab   sc={sc} setS={setS} result={result} saved={saved} setSaved={setSaved}/>}
        {tab==="Trajectory"  && <TrajectoryTab  result={result}/>}
        {tab==="Flow Map"    && <FlowMapTab/>}
        {tab==="Materials"   && <MaterialsTab   result={result}/>}
        {tab==="Components"  && <ComponentsTab  result={result}/>}
        {tab==="OEMs"        && <OEMsTab        result={result}/>}
        {tab==="Cost"        && <CostTab        result={result}/>}
        {tab==="Methodology" && <MethodologyTab/>}
      </main>
    </div>
  );
}
