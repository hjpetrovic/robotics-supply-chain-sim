"use client";

import { C } from "../../lib/colors.js";
import { Card, SL } from "../ui/primitives.jsx";

const SECTIONS = [
  {title:"Binding constraint (min-of-four)",body:"maxRobots = min(materialCeiling, componentCeiling, OEMCeiling, demandCeiling)\n\nThe fundamental bottleneck identity — the weakest link determines throughput. All four ceilings are computed independently each year; the minimum is binding.\n\nDemand ceiling = ANNUAL_BASE_INSTALLS × (1 + dg/100)^years\nIn most high-demand scenarios the demand ceiling does not bind (supply is the constraint). It becomes relevant if demand growth is very low or supply capacity races ahead."},
  {title:"Material supply ceiling",body:"supplyFactor = 1 − (tradeWar×0.35×geoRisk) − (nationalism×0.25×producerConc) − (taiwanRisk×sectorMult) + reshoring×0.15 + recycling×0.10\nClamped: [0.05, 2.0]\n\nadjustedSupply = globalSupply × supplyFactor × 1.03^years  (3%/yr organic growth)\nsupplyKg = adjustedSupply × unitConversion\nrobotCeiling = supplyKg / demandPerRobot (kg)"},
  {title:"Component capacity ceiling",body:"capFactor = 1 − (tradeWar×0.2×geoRisk) − (taiwanRisk×sectorMult) + reshoring×0.2\nClamped: [0.05, 2.0]\n\nadjustedCap = baseCap × capFactor × 1.07^years  (7%/yr organic capacity growth)\nBinding = min(adjCap) across all component types"},
  {title:"OEM ceiling — S-curve model",body:"OEM growth follows a logistic S-curve, not unbounded exponential:\n\nsCurve(t) = t / (t + 8)   — approaches 1 asymptotically\nprojectedCap = cap2024 × (1 + (maxGrowth − 1) × sCurve(yrs)) × scenarioFactor\n\nThis prevents trillion-robot projections: a humanoid OEM with maxGrowth=15× reaches only ~9× by 2040 (t=16)."},
  {title:"Learning curve (Wright's Law)",body:"Cost falls as cumulative production doubles. Parameter: 15% cost reduction per doubling.\n\nlearnedCost = baseCost × (1 − 0.15)^log₂(cumulativeUnits / BASE_CUMULATIVE)\n\nEstimated 2024 base: ~8.5M cumulative robots. Demand growth (dg) accelerates cumulative production via a midpoint approximation:\n\napproxCumulative = BASE_CUMULATIVE + ANNUAL_BASE_INSTALLS × years × (1 + dg/100)^(years/2)\n\nHigher dg → more units produced → faster cost decline. Geopolitical stress pushes cost back up via stressMult = 1 + tw×0.35 + rn×0.15 + tr×0.25 − rs×0.08 − rc×0.04"},
  {title:"Component price volatility",body:"Each component has an empirically-estimated volatility coefficient (±5% for mature steel structures; ±22% for AI chips). Volatility is seeded deterministically by year + component ID (using sin function) to produce repeatable but scenario-sensitive price paths.\n\ncomponentCost(y) = learnedCost × stressMult × volatilityFactor(y, scenario)"},
  {title:"Geo-risk scoring",body:"Geo-risk (1–10) encodes: (1) producer concentration — HHI-like metric on top producers; (2) political stability of dominant producer; (3) refining dependency on single nation.\n\nAggregated score = mean(materialRisk × topRefinerShare) × (1 + tradeWar/200 + taiwanRisk/200), clamped [0,10]"},
  {title:"Data sources & caveats",body:"Material supply: USGS Mineral Commodity Summaries 2023–24. Component capacities: Wood Mackenzie, IDTechEx, BloombergNEF analyst estimates. OEM capacities: IFR World Robotics 2023 + company disclosures. All figures are estimates for scenario modelling, not forecasts. Client-side only — no data leaves the browser."},
];

const REFERENCES = [
  {cat:"Critical minerals & materials",items:[
    {title:"USGS Mineral Commodity Summaries 2024",detail:"Primary source for global production, reserves, and supply figures for rare earths, cobalt, lithium, gallium, nickel, tungsten, and copper."},
    {title:"IEA: Critical Minerals and Clean Energy Transitions (2023)",detail:"Cross-supply chain analysis of mineral intensity across clean tech, including robotics-adjacent applications."},
    {title:"S&P Global: Future of Copper — Will the Looming Supply Gap Short-Circuit the Energy Transition?",detail:"Detailed supply-demand modelling for copper through 2035."},
    {title:"European Commission: Critical Raw Materials Act (CRMA) 2023",detail:"EU policy framework for reshoring strategic mineral processing; directly modelled in the reshoring parameter."},
    {title:"China Geological Survey: China Mineral Resources Reports",detail:"Production and reserve data for rare earths, gallium, tungsten, and polysilicon — key to Chinese monopoly risk scores."},
  ]},
  {cat:"Robotics industry & OEM capacity",items:[
    {title:"IFR World Robotics Report 2023 — International Federation of Robotics",detail:"Annual survey of industrial robot installations and OEM capacity by country. Primary source for cap24 values."},
    {title:"IDTechEx: Humanoid Robots 2024–2044",detail:"Market sizing and technology roadmap for humanoid and mobile robots; informs maxGrowth estimates for newer OEMs."},
    {title:"BloombergNEF: Electric Vehicle Battery Supply Chain Outlook",detail:"Battery pack cost curves and supply chain concentration; adapted for robot battery packs."},
    {title:"Wood Mackenzie: EV Supply Chain Tracker",detail:"Component capacity estimates by region, particularly for motors, gearboxes, and battery modules."},
    {title:"Nabtesco Corporation / Harmonic Drive SE: Annual Reports & Technical Datasheets",detail:"Primary source for precision gearbox capacity and concentration; ~80% market share figure for Japan-based gearbox makers."},
  ]},
  {cat:"Semiconductors & electronics",items:[
    {title:"SEMI: World Fab Watch",detail:"Wafer fab capacity data by region and node; underpins the Taiwan risk sensitivity for semiconductors."},
    {title:"TrendForce: Semiconductor Supply Chain Intelligence",detail:"Quarterly capacity utilisation and chip supply forecasts. Informs AI chip ceiling (semis component cap)."},
    {title:"US CHIPS and Science Act (2022)",detail:"Policy text for domestic semiconductor manufacturing investment; modelled as a partial offset to Taiwan risk."},
    {title:"TSMC Annual Report 2023",detail:"Capacity expansion plans, CoWoS/advanced packaging constraints, and customer mix relevant to AI chip supply."},
  ]},
  {cat:"Economic modelling",items:[
    {title:"Wright, T.P. (1936): Factors Affecting the Cost of Airplanes, Journal of Aeronautical Sciences",detail:"Original formulation of the learning curve (Wright's Law) applied here at 15% cost reduction per production doubling."},
    {title:"Way, R. et al. (2022): Empirically grounded technology forecasts and the energy transition, Joule",detail:"Empirical validation of learning curve rates across clean-tech hardware, supporting the 15% parameter choice."},
    {title:"Lafond, F. et al. (2018): How well do experience curves predict technological progress? Energy Policy",detail:"Meta-analysis of Wright's Law across technology sectors."},
  ]},
];

export function MethodologyTab() {
  return(
    <div style={{display:"grid",gap:"0.75rem"}}>
      {SECTIONS.map(s=>(
        <Card key={s.title}>
          <div style={{fontSize:13,fontWeight:600,color:C.teal,marginBottom:8,letterSpacing:"-0.01em"}}>{s.title}</div>
          <div style={{fontSize:11.5,color:C.textSub,lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"'JetBrains Mono','Fira Code',monospace",background:C.bg3,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.border}`}}>{s.body}</div>
        </Card>
      ))}

      <Card>
        <div style={{fontSize:13,fontWeight:600,color:C.teal,marginBottom:12,letterSpacing:"-0.01em"}}>References & further reading</div>
        <div style={{display:"grid",gap:"1.25rem"}}>
          {REFERENCES.map(cat=>(
            <div key={cat.cat}>
              <SL>{cat.cat}</SL>
              {cat.items.map((ref,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:2}}>{ref.title}</div>
                  <div style={{fontSize:11,color:C.textSub,lineHeight:1.5}}>{ref.detail}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
