"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    Chart: any;
    d3: any;
    topojson: any;
  }
}

const C = {
  bg0:"#0a0c0f",bg1:"#111418",bg2:"#181c22",bg3:"#1f2530",
  border:"rgba(255,255,255,0.07)",borderHi:"rgba(255,255,255,0.14)",
  blue:"#4a9eff",blueD:"rgba(74,158,255,0.12)",
  amber:"#f0a830",amberD:"rgba(240,168,48,0.12)",
  steel:"#8899aa",steelD:"rgba(136,153,170,0.12)",
  red:"#e05555",redD:"rgba(224,85,85,0.12)",
  green:"#3db87a",greenD:"rgba(61,184,122,0.12)",
  purple:"#9b7fe8",
  text:"#e8ecf0",textSub:"#8899aa",textMuted:"#4a5568",white:"#ffffff",
};
const rCol=r=>r>=8?C.red:r>=6?C.amber:C.green;
const rBg=r=>r>=8?C.redD:r>=6?C.amberD:C.greenD;
const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":Math.round(n).toLocaleString();

/* ─── LEARNING CURVE ─── */
// IFR 2025: 4,664,000 robots in operational use globally in 2024.
// ~542,000 new installations in 2024 alone (annual rate baseline).
// Cumulative production since 1960s estimated ~8–10M units total.
const LEARNING_RATE = 0.15;
const BASE_CUMULATIVE = 8500000; // realistic 2024 cumulative base
const ANNUAL_BASE_INSTALLS = 542000; // IFR 2025: actual 2024 installation rate

function learningCurveCost(baseCost, cumulativeUnits) {
  const doublings = Math.log2(cumulativeUnits / BASE_CUMULATIVE);
  return baseCost * Math.pow(1 - LEARNING_RATE, Math.max(0, doublings));
}

/* ─── DATA ─── */
const MATERIALS = [
  {id:"ndy",   name:"Neodymium/Dysprosium",short:"NdFeB",  cat:"rare_earth",  unit:"kt/yr",supply:240,  demandPer:0.8,  producers:[{c:"China",s:85},{c:"Australia",s:8},{c:"USA",s:4}],   refiners:[{c:"China",s:92},{c:"Estonia",s:3}],               geoRisk:9.1,desc:"Permanent magnets for motors & actuators"},
  {id:"cobalt",name:"Cobalt",              short:"Co",      cat:"battery",     unit:"kt/yr",supply:190,  demandPer:1.2,  producers:[{c:"DRC",s:70},{c:"Russia",s:5},{c:"Australia",s:4}],  refiners:[{c:"China",s:65},{c:"Finland",s:10},{c:"Belgium",s:8}],geoRisk:8.7,desc:"Battery cathodes, high-strength alloys"},
  {id:"lithium",name:"Lithium",            short:"Li",      cat:"battery",     unit:"kt/yr",supply:140,  demandPer:2.1,  producers:[{c:"Australia",s:47},{c:"Chile",s:30},{c:"China",s:14}],refiners:[{c:"China",s:58},{c:"Chile",s:18},{c:"Australia",s:12}],geoRisk:6.2,desc:"Onboard power & mobile robot batteries"},
  {id:"copper",name:"Copper",              short:"Cu",      cat:"base",        unit:"Mt/yr",supply:21,   demandPer:15,   producers:[{c:"Chile",s:28},{c:"Peru",s:11},{c:"China",s:9}],     refiners:[{c:"China",s:40},{c:"Chile",s:14},{c:"Japan",s:7}],   geoRisk:5.1,desc:"Wiring, motors, PCBs throughout robot"},
  {id:"silicon",name:"Polysilicon",        short:"Si",      cat:"semi",        unit:"kt/yr",supply:820,  demandPer:3.5,  producers:[{c:"China",s:79},{c:"Norway",s:7},{c:"USA",s:5}],      refiners:[{c:"China",s:79},{c:"Norway",s:7},{c:"Germany",s:4}], geoRisk:7.8,desc:"Semiconductors, sensors, power electronics"},
  {id:"gallium",name:"Gallium",            short:"Ga",      cat:"semi",        unit:"t/yr", supply:550,  demandPer:0.05, producers:[{c:"China",s:80},{c:"Russia",s:7},{c:"S.Korea",s:5}],  refiners:[{c:"China",s:80},{c:"Russia",s:7}],                   geoRisk:9.4,desc:"GaN power semiconductors, LEDs, sensors"},
  {id:"nickel",name:"Nickel",              short:"Ni",      cat:"battery",     unit:"kt/yr",supply:3300, demandPer:4.5,  producers:[{c:"Indonesia",s:37},{c:"Philippines",s:13},{c:"Russia",s:11}],refiners:[{c:"China",s:35},{c:"Russia",s:15},{c:"Japan",s:10}],geoRisk:6.8,desc:"Battery cathodes, corrosion-resistant parts"},
  {id:"steel",  name:"Specialty Steel",    short:"Steel",   cat:"structural",  unit:"Mt/yr",supply:1.8,  demandPer:45,   producers:[{c:"China",s:55},{c:"Japan",s:10},{c:"Germany",s:7}],  refiners:[{c:"China",s:55},{c:"Japan",s:10},{c:"Germany",s:7}],geoRisk:4.5,desc:"Structural frames, joints, housings"},
  {id:"tungsten",name:"Tungsten",          short:"W",       cat:"rare_metal",  unit:"kt/yr",supply:84,   demandPer:0.1,  producers:[{c:"China",s:83},{c:"Vietnam",s:7},{c:"Russia",s:3}],  refiners:[{c:"China",s:83},{c:"Russia",s:3}],                   geoRisk:9.0,desc:"Cutting tools, wear-resistant parts"},
  {id:"carbon_fiber",name:"Carbon Fibre",  short:"CF",      cat:"structural",  unit:"kt/yr",supply:120,  demandPer:0.5,  producers:[{c:"Japan",s:40},{c:"USA",s:25},{c:"Germany",s:15}],   refiners:[{c:"Japan",s:40},{c:"USA",s:25},{c:"Germany",s:15}],geoRisk:4.2,desc:"Lightweight high-strength arms & links"},
];

const COMPONENTS = [
  {id:"motors",   name:"Servo/BLDC Motors",    mats:["ndy","copper","steel"],  makers:[{co:"Fanuc",cn:"Japan"},{co:"Yaskawa",cn:"Japan"},{co:"Siemens",cn:"Germany"}],   cap:28, geoRisk:5.5,lead:14,cost:800,  volatility:0.08},
  {id:"gearboxes",name:"Precision Gearboxes",  mats:["steel","tungsten"],      makers:[{co:"Nabtesco",cn:"Japan"},{co:"Harmonic Drive",cn:"Japan"}],                     cap:22, geoRisk:5.0,lead:20,cost:1200, volatility:0.06},
  {id:"batteries",name:"Battery Packs",        mats:["lithium","cobalt","nickel"],makers:[{co:"CATL",cn:"China"},{co:"Panasonic",cn:"Japan"},{co:"LG Energy",cn:"S.Korea"}],cap:180,geoRisk:6.8,lead:8, cost:2500, volatility:0.18},
  {id:"semis",    name:"SoCs & AI Chips",       mats:["silicon","gallium"],     makers:[{co:"TSMC",cn:"Taiwan"},{co:"NVIDIA",cn:"USA"},{co:"Samsung",cn:"S.Korea"}],      cap:95, geoRisk:8.9,lead:26,cost:3500, volatility:0.22},
  {id:"sensors",  name:"LiDAR/Vision Sensors",  mats:["gallium","silicon"],     makers:[{co:"Ouster",cn:"USA"},{co:"Hesai",cn:"China"}],                                  cap:40, geoRisk:7.2,lead:18,cost:1500, volatility:0.14},
  {id:"actuators",name:"Linear Actuators",      mats:["ndy","copper","steel"],  makers:[{co:"Bosch Rexroth",cn:"Germany"},{co:"SKF",cn:"Sweden"}],                        cap:50, geoRisk:5.2,lead:12,cost:600,  volatility:0.07},
  {id:"pcbs",     name:"PCBs & Power Elec.",    mats:["copper","silicon"],      makers:[{co:"Foxconn",cn:"Taiwan"},{co:"Jabil",cn:"USA"}],                                cap:320,geoRisk:7.5,lead:10,cost:400,  volatility:0.10},
  {id:"structures",name:"Structural Frames",    mats:["steel","carbon_fiber"],  makers:[{co:"Arconic",cn:"USA"},{co:"Toray",cn:"Japan"}],                                 cap:200,geoRisk:4.0,lead:6, cost:1800, volatility:0.05},
];

// OEM list — expanded to cover ~90% of the 542K/yr installation market.
// cap24 = estimated 2024 annual shipments in thousands of units (sums to ~542K).
// Sources: IFR 2025, company reports, market share estimates.
const OEMS = [
  // Big-4 industrial (Japan/Germany) — ~45% of market
  {id:"fanuc",    name:"Fanuc",              country:"Japan",       type:"Industrial",   cap24:80,  maxGrowth:1.8, geoRisk:5.0},
  {id:"yaskawa",  name:"Yaskawa",            country:"Japan",       type:"Industrial",   cap24:60,  maxGrowth:1.7, geoRisk:5.0},
  {id:"kuka",     name:"KUKA / Midea",       country:"Germany/CN",  type:"Industrial",   cap24:45,  maxGrowth:2.0, geoRisk:5.5},
  {id:"abb",      name:"ABB Robotics",       country:"Switzerland", type:"Industrial",   cap24:55,  maxGrowth:1.9, geoRisk:4.8},
  // Japanese specialists — ~18%
  {id:"denso",    name:"Denso Robotics",     country:"Japan",       type:"Industrial",   cap24:35,  maxGrowth:1.6, geoRisk:5.0},
  {id:"kawasaki", name:"Kawasaki Robotics",  country:"Japan",       type:"Industrial",   cap24:25,  maxGrowth:1.8, geoRisk:5.2},
  {id:"nachi",    name:"Nachi-Fujikoshi",    country:"Japan",       type:"Industrial",   cap24:18,  maxGrowth:1.6, geoRisk:5.0},
  {id:"epson",    name:"Epson Robots",       country:"Japan",       type:"Industrial",   cap24:22,  maxGrowth:1.8, geoRisk:4.8},
  {id:"mitsubishi",name:"Mitsubishi Elec.",  country:"Japan",       type:"Industrial",   cap24:20,  maxGrowth:1.7, geoRisk:4.8},
  {id:"yamaha",   name:"Yamaha Robotics",    country:"Japan",       type:"Industrial",   cap24:10,  maxGrowth:1.5, geoRisk:4.8},
  // Chinese manufacturers — rising fast, ~25% of market
  {id:"siasun",   name:"Siasun",             country:"China",       type:"Industrial",   cap24:30,  maxGrowth:3.5, geoRisk:7.5},
  {id:"estun",    name:"Estun Automation",   country:"China",       type:"Industrial",   cap24:25,  maxGrowth:4.0, geoRisk:7.5},
  {id:"efort",    name:"Efort Intelligent",  country:"China",       type:"Industrial",   cap24:18,  maxGrowth:4.0, geoRisk:7.5},
  {id:"elite",    name:"Elite Robots",       country:"China",       type:"Collaborative",cap24:15,  maxGrowth:4.5, geoRisk:7.5},
  {id:"unitree",  name:"Unitree Robotics",   country:"China",       type:"Mobile",       cap24:20,  maxGrowth:6.0, geoRisk:7.8},
  // Cobots & collaborative — ~8%
  {id:"universal",name:"Universal Robots",   country:"Denmark",     type:"Collaborative",cap24:22,  maxGrowth:3.5, geoRisk:4.5},
  {id:"doosan",   name:"Doosan Robotics",    country:"S.Korea",     type:"Collaborative",cap24:8,   maxGrowth:4.0, geoRisk:5.8},
  {id:"hanwha",   name:"Hanwha Robotics",    country:"S.Korea",     type:"Collaborative",cap24:6,   maxGrowth:3.5, geoRisk:5.8},
  {id:"omron",    name:"Omron Adept",        country:"Japan/USA",   type:"Collaborative",cap24:8,   maxGrowth:2.5, geoRisk:4.8},
  // Humanoid & mobile — nascent but fast-growing
  {id:"boston",   name:"Boston Dynamics",    country:"USA",         type:"Mobile",       cap24:5,   maxGrowth:8.0, geoRisk:5.0},
  {id:"figure",   name:"Figure AI",          country:"USA",         type:"Humanoid",     cap24:0.5, maxGrowth:15.0,geoRisk:5.5},
  {id:"agility",  name:"Agility Robotics",   country:"USA",         type:"Humanoid",     cap24:1,   maxGrowth:10.0,geoRisk:5.0},
  {id:"staubli",  name:"Stäubli Robotics",   country:"Switzerland", type:"Industrial",   cap24:8,   maxGrowth:1.7, geoRisk:4.2},
  {id:"comau",    name:"Comau / Stellantis", country:"Italy",       type:"Industrial",   cap24:10,  maxGrowth:2.0, geoRisk:5.0},
];

// S-curve OEM growth: capacity(t) = cap24 * (1 + (maxGrowth-1) * t/16 / (1 + t/16))
// At t=16 (2040): approaches cap24 * maxGrowth asymptotically but never exceeds it
function oemCapAt(o, yrs, scenFactor) {
  const sCurve = yrs / (yrs + 8); // logistic-like, approaches 1 as yrs→∞
  return o.cap24 * (1 + (o.maxGrowth - 1) * sCurve) * Math.max(0.1, scenFactor);
}

const POLICY = [
  {year:2020,name:"Indonesia nickel export ban",  mat:"nickel", impact:-0.20,type:"restriction"},
  {year:2022,name:"US CHIPS Act",                 mat:"silicon",impact:+0.15,type:"subsidy"},
  {year:2022,name:"US IRA battery credits",       mat:"lithium",impact:+0.20,type:"subsidy"},
  {year:2023,name:"China gallium export controls",mat:"gallium",impact:-0.30,type:"restriction"},
  {year:2023,name:"DRC cobalt royalty increase",  mat:"cobalt", impact:-0.15,type:"restriction"},
  {year:2024,name:"EU Critical Minerals Act",     mat:"ndy",    impact:+0.10,type:"subsidy"},
];

const PRESETS = [
  {name:"Baseline 2030",  sc:{tw:0, rn:0, tr:0, dg:15,rs:0, rc:5, yr:2030}},
  {name:"Trade war",      sc:{tw:70,rn:40,tr:20,dg:15,rs:20,rc:5, yr:2030}},
  {name:"Taiwan crisis",  sc:{tw:50,rn:30,tr:85,dg:10,rs:30,rc:8, yr:2030}},
  {name:"Optimistic 2035",sc:{tw:0, rn:0, tr:0, dg:25,rs:60,rc:30,yr:2035}},
  {name:"Supply crisis",  sc:{tw:80,rn:75,tr:60,dg:20,rs:10,rc:5, yr:2030}},
];
const DEF = {tw:0,rn:0,tr:0,dg:15,rs:0,rc:5,yr:2030};

/* ─── SIMULATION ENGINE ─── */
function simYear(sc, yrs) {
  const {tw,rn,tr,rs,rc} = sc;

  // material supply factors
  const matB = MATERIALS.map(m => {
    let sf = 1.0
      - (tw/100)*0.35*(m.geoRisk/10)
      - (rn/100)*0.25*(m.producers[0].s/100)
      - (tr/100)*(m.cat==="semi"?0.55:0.05)
      + (rs/100)*0.15
      + (rc/100)*0.10;
    sf = Math.max(0.05, Math.min(2.0, sf));
    const mult = m.unit==="Mt/yr"?1e9:m.unit==="kt/yr"?1e6:1e3;
    const supplyKg = m.supply * sf * Math.pow(1.03, yrs) * mult; // 3%/yr supply growth
    const robotsFromMat = supplyKg / m.demandPer;
    return {...m, sf, robotsFromMat, bScore:1/Math.max(robotsFromMat,1)};
  }).sort((a,b)=>b.bScore-a.bScore);

  // component capacity
  const compB = COMPONENTS.map(c => {
    let cf = 1.0
      - (tw/100)*0.2*(c.geoRisk/10)
      - (tr/100)*(c.id==="semis"?0.60:0.10)
      + (rs/100)*0.20;
    cf = Math.max(0.05, Math.min(2.0, cf));
    const adjCap = c.cap * cf * Math.pow(1.07, yrs) * 1000; // 7%/yr capacity growth
    return {...c, cf, adjCap, bScore:1/Math.max(adjCap,1)};
  }).sort((a,b)=>b.bScore-a.bScore);

  // OEM — scenario factor for each OEM
  const oemList = OEMS.map(o => {
    const sf = Math.max(0.1, 1.0
      - (tw/100)*0.15*(o.geoRisk/10)
      - (tr/100)*0.20
      + (rs/100)*0.10);
    const projCap = oemCapAt(o, yrs, sf);
    return {...o, projCap};
  });
  const totalOEM = oemList.reduce((s,o)=>s+o.projCap,0)*1000;

  // ceilings
  const mfm = Math.round(matB[0].robotsFromMat);
  const mfc = Math.round(compB[0].adjCap);
  const mfo = Math.round(totalOEM);
  const maxR = Math.min(mfm, mfc, mfo);

  // learning curve cost — anchored to IFR 2024 base of ~8.5M cumulative units
  // Each year adds roughly ANNUAL_BASE_INSTALLS new units to cumulative total
  const baseCost = COMPONENTS.reduce((s,c)=>s+c.cost,0);
  const approxCumulative = BASE_CUMULATIVE + ANNUAL_BASE_INSTALLS * yrs;
  const learnedBase = learningCurveCost(baseCost, approxCumulative);
  // scenario stress pushes cost up
  const stressMult = 1 + (tw/100)*0.35 + (rn/100)*0.15 + (tr/100)*0.25 - (rs/100)*0.08 - (rc/100)*0.04;
  const costPerRobot = Math.round(learnedBase * Math.max(0.4, stressMult));

  // geo risk
  const geoRisk = Math.min(10, MATERIALS.reduce((s,m)=>
    s+(m.geoRisk*(m.refiners[0]?.s||0)/100),0)/MATERIALS.length
    *(1+tw/200+tr/200));

  return {matB, compB, oemList, mfm, mfc, mfo, maxR, geoRisk, costPerRobot, baseCost};
}

function sim(sc) {
  const yrs = Math.max(1, sc.yr-2024);
  const base = simYear(sc, yrs);
  const binding = base.maxR===base.mfm
    ? `Materials: ${base.matB[0].name}`
    : base.maxR===base.mfc
    ? `Components: ${base.compB[0].name}`
    : "OEM Assembly";

  // trajectory
  const traj = [];
  for (let y=2024; y<=sc.yr; y++) {
    const ky = Math.max(1, y-2024);
    const r = simYear(sc, ky);
    // per-component costs at this year
    const compCosts = COMPONENTS.map(c=>{
      const approxCum = BASE_CUMULATIVE + ANNUAL_BASE_INSTALLS * ky;
      const learned = learningCurveCost(c.cost, approxCum);
      const stress = 1+(sc.tw/100)*0.35*(c.geoRisk/10)+(sc.tr/100)*(c.id==="semis"?0.5:0.1)-(sc.rs/100)*0.08;
      // volatility: random-seeded by year+component for determinism
      const volSeed = Math.sin(y*17+c.cost)*0.5+0.5;
      const vol = 1 + (volSeed-0.5)*c.volatility*((sc.tw+sc.tr)/100+0.3);
      return {id:c.id, name:c.name, cost:Math.round(learned*Math.max(0.4,stress)*vol)};
    });
    traj.push({year:y, robots:Math.round(r.maxR), matCap:Math.round(r.mfm), compCap:Math.round(r.mfc), oemCap:Math.round(r.mfo), costPerRobot:r.costPerRobot, compCosts});
  }

  return {...base, binding, traj};
}

/* ─── DETERMINISTIC VALIDATOR ─── */
function validate(sc, result) {
  const issues = [];
  const yrs = Math.max(1,sc.yr-2024);

  // 1. min constraint
  const expectedMax = Math.min(result.mfm, result.mfc, result.mfo);
  if (result.maxR !== expectedMax)
    issues.push(`maxR=${result.maxR} but min(mfm,mfc,mfo)=${expectedMax}. Should be equal.`);

  // 2. geo risk bounds
  if (result.geoRisk<0||result.geoRisk>10)
    issues.push(`geoRisk=${result.geoRisk.toFixed(2)} outside [0,10].`);

  // 3. cost floor
  if (result.costPerRobot<=0)
    issues.push(`costPerRobot=${result.costPerRobot} must be >0.`);

  // 4. zero disruption — cost should be below baseline (learning curve active)
  if (sc.tw===0&&sc.rn===0&&sc.tr===0&&yrs>2) {
    if (result.costPerRobot >= result.baseCost)
      issues.push(`Cost $${result.costPerRobot} should be below base $${result.baseCost} due to learning curve at yr=${sc.yr}.`);
  }

  // 5. trade war should raise cost vs baseline
  if (sc.tw>50) {
    const baseline = simYear({...sc,tw:0},yrs);
    if (result.costPerRobot < baseline.costPerRobot)
      issues.push(`Trade war cost $${result.costPerRobot} should exceed baseline $${baseline.costPerRobot}.`);
  }

  // 6. OEM ceiling sanity: should not exceed OEMS total maxGrowth × cap24 × 1000
  const oemTheorMax = OEMS.reduce((s,o)=>s+o.cap24*o.maxGrowth,0)*1000;
  if (result.mfo > oemTheorMax*1.05)
    issues.push(`OEM ceiling ${fmt(result.mfo)} exceeds theoretical max ${fmt(oemTheorMax)} (all OEMs at max growth).`);

  // 7. supply factors in bounds
  result.matB.forEach(m=>{
    if(m.sf<0.05||m.sf>2.0)
      issues.push(`${m.name} supplyFactor=${m.sf.toFixed(3)} outside [0.05,2.0].`);
  });

  // 8. trajectory monotonicity check (cost should trend down in baseline)
  if (sc.tw===0&&sc.rn===0&&sc.tr===0&&result.traj.length>3) {
    const first=result.traj[0].costPerRobot, last=result.traj[result.traj.length-1].costPerRobot;
    if (last>=first)
      issues.push(`Baseline cost trajectory not declining: ${first}→${last}. Learning curve not effective.`);
  }

  return issues;
}

/* ─── UI PRIMITIVES ─── */
if (typeof window !== "undefined" && !window.Chart) {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
  document.head.appendChild(s);
}

const TABS = ["Overview","Scenarios","Trajectory","Flow Map","Materials","Components","OEMs","Cost","Methodology"];
const Card=({children,s={}})=><div style={{background:C.bg2,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1rem 1.25rem",...s}}>{children}</div>;
const SL=({children})=><div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:500,marginBottom:8}}>{children}</div>;
const Badge=({children,col=C.steel,bg=C.steelD})=><span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:bg,color:col,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
const Metric=({label,value,sub,accent=C.blue})=>(
  <div style={{background:C.bg1,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
    <div style={{fontSize:10,color:C.textMuted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</div>
    <div style={{fontSize:20,fontWeight:600,color:accent,marginBottom:2,letterSpacing:"-0.02em"}}>{value}</div>
    <div style={{fontSize:11,color:C.textSub}}>{sub}</div>
  </div>
);

/* ─── APP ─── */
export default function App() {
  const [tab,setTab]=useState("Overview");
  const [sc,setSc]=useState(DEF);
  const [saved,setSaved]=useState([]);
  const [valLog,setValLog]=useState([]);
  const setS=(k,v)=>setSc(p=>({...p,[k]:v}));
  const result=sim(sc);
  const validationIssues=validate(sc,result);

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
      {/* tabs — wrap not scroll */}
      <div style={{display:"flex",flexWrap:"wrap",gap:2,borderBottom:`0.5px solid ${C.border}`,marginBottom:"1.5rem"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 13px",fontSize:12,border:"none",borderBottom:tab===t?`2px solid ${C.blue}`:"2px solid transparent",background:"transparent",color:tab===t?C.blue:C.textSub,cursor:"pointer",fontWeight:tab===t?500:400,whiteSpace:"nowrap",marginBottom:-1}}>{t}</button>
        ))}
      </div>
      {tab==="Overview"    && <OverviewTab    result={result} sc={sc} setS={setS} valLog={valLog} setValLog={setValLog} validationIssues={validationIssues}/>}
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

/* ══ OVERVIEW ══ */
function OverviewTab({result,sc,setS,valLog,setValLog,validationIssues}){
  const maxV=Math.max(result.mfm,result.mfc,result.mfo,1);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      {/* preset strip */}
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

      {/* validation panel — deterministic */}
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

function GeoRiskLegend() {
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

/* ══ SCENARIOS ══ */
function ScenariosTab({sc,setS,result,saved,setSaved}){
  const sliders=[
    {k:"tw",l:"Trade war intensity",     desc:"US-China tariffs, export controls",      min:0, max:100,unit:"%",   col:C.red},
    {k:"rn",l:"Resource nationalism",    desc:"Export bans, royalty increases",          min:0, max:100,unit:"%",   col:C.amber},
    {k:"tr",l:"Taiwan strait risk",      desc:"Semiconductor supply disruption risk",    min:0, max:100,unit:"%",   col:C.red},
    {k:"dg",l:"Demand growth rate",      desc:"Annual growth in global robot demand",    min:0, max:50, unit:"%/yr",col:C.blue},
    {k:"rs",l:"Reshoring speed",         desc:"Manufacturing returning to home nations", min:0, max:100,unit:"%",   col:C.green},
    {k:"rc",l:"Recycling / substitution",desc:"Material recovery & alternatives",        min:0, max:40, unit:"%",   col:C.green},
    {k:"yr",l:"Target year",             desc:"Forecast horizon",                        min:2025,max:2040,unit:"",col:C.steel},
  ];
  const maxV=Math.max(result.mfm,result.mfc,result.mfo,1);
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",alignItems:"start"}}>
      <div style={{display:"grid",gap:"1.25rem"}}>
        <Card>
          <SL>Presets</SL>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {PRESETS.map(p=><button key={p.name} onClick={()=>Object.entries(p.sc).forEach(([k,v])=>setS(k,v))} style={{fontSize:12,padding:"5px 14px",borderRadius:20,border:`0.5px solid ${C.borderHi}`,background:C.bg3,color:C.textSub,cursor:"pointer"}}>{p.name}</button>)}
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
          <button onClick={()=>setSaved(p=>[...p,{...sc,label:`Scenario ${p.length+1}`,maxR:result.maxR,cost:result.costPerRobot,risk:result.geoRisk}])} style={{marginTop:4,fontSize:12,padding:"6px 0",borderRadius:20,border:`0.5px solid ${C.blue}66`,background:C.blueD,color:C.blue,cursor:"pointer",width:"100%"}}>Save scenario</button>
        </Card>
      </div>
      <div style={{display:"grid",gap:"1.25rem"}}>
        <Card>
          <SL>Output</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
            {[{l:"Max robots",v:fmt(result.maxR),a:C.blue},{l:"Cost/robot",v:"$"+Math.round(result.costPerRobot/1000)+"K",a:C.amber},{l:"Geo-risk",v:result.geoRisk.toFixed(1)+"/10",a:rCol(result.geoRisk)},{l:"Top bottleneck",v:result.matB[0].short,a:C.red}].map(x=>(
              <div key={x.l} style={{background:C.bg1,borderRadius:8,padding:"10px 12px",border:`0.5px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{x.l}</div>
                <div style={{fontSize:16,fontWeight:600,color:x.a}}>{x.v}</div>
              </div>
            ))}
          </div>
          {[{l:"Material supply",v:result.mfm,col:C.red},{l:"Component capacity",v:result.mfc,col:C.amber},{l:"OEM assembly",v:result.mfo,col:C.green}].map(b=>{
            const bind=b.v===Math.min(result.mfm,result.mfc,result.mfo);
            return <div key={b.l} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",marginBottom:3,borderRadius:7,background:bind?C.redD:C.bg1,border:bind?`0.5px solid ${C.red}44`:`0.5px solid ${C.border}`}}>
              <span style={{fontSize:12,color:bind?C.red:C.textSub}}>{b.l}{bind?" — binding":""}</span>
              <span style={{fontSize:12,fontWeight:500,color:bind?C.red:C.text}}>{fmt(b.v)}</span>
            </div>;
          })}
        </Card>
        <GeoRiskLegend/>
        {saved.length>0&&<Card>
          <SL>Saved scenarios</SL>
          {saved.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`0.5px solid ${C.border}`,fontSize:12}}>
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

/* ══ TRAJECTORY ══ */
function TrajectoryTab({result}){
  const c1=useRef<any>(null),c2=useRef<any>(null),ci1=useRef<any>(null),ci2=useRef<any>(null);
  useEffect(()=>{
    if(!c1.current||!window.Chart)return;
    if(ci1.current)ci1.current.destroy();
    const labels=result.traj.map(t=>t.year);
    ci1.current=new window.Chart(c1.current,{type:"line",data:{labels,datasets:[
      {label:"Binding ceiling",data:result.traj.map(t=>t.robots),borderColor:C.blue,backgroundColor:"rgba(74,158,255,0.06)",fill:true,borderWidth:2,pointRadius:2,tension:0.35},
      {label:"Material",data:result.traj.map(t=>t.matCap),borderColor:C.red,borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
      {label:"Components",data:result.traj.map(t=>t.compCap),borderColor:C.amber,borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
      {label:"OEM",data:result.traj.map(t=>t.oemCap),borderColor:C.green,borderWidth:1,borderDash:[5,4],pointRadius:0,tension:0.35,fill:false},
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:11}}},y:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:11},callback:v=>v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(0)+"K":v}}}}});
  },[result.traj]);
  useEffect(()=>{
    if(!c2.current||!window.Chart)return;
    if(ci2.current)ci2.current.destroy();
    const labels=result.traj.map(t=>t.year);
    ci2.current=new window.Chart(c2.current,{type:"line",data:{labels,datasets:[
      {label:"Cost/robot",data:result.traj.map(t=>t.costPerRobot),borderColor:C.amber,backgroundColor:"rgba(240,168,48,0.06)",fill:true,borderWidth:2,pointRadius:2,tension:0.35},
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:11}}},y:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:11},callback:v=>"$"+(v/1000).toFixed(0)+"K"}}}}});
    return()=>{if(ci1.current)ci1.current.destroy();if(ci2.current)ci2.current.destroy();};
  },[result.traj]);
  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card>
        <div style={{display:"flex",gap:16,marginBottom:10,flexWrap:"wrap"}}>
          {[{l:"Binding ceiling",c:C.blue,d:false},{l:"Material",c:C.red,d:true},{l:"Components",c:C.amber,d:true},{l:"OEM",c:C.green,d:true}].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub}}>
              <span style={{display:"inline-block",width:18,height:0,borderTop:`${x.d?"2px dashed":"2px solid"} ${x.c}`}}></span>{x.l}
            </span>
          ))}
        </div>
        <div style={{position:"relative",height:280}}><canvas ref={c1}></canvas></div>
      </Card>
      <Card>
        <div style={{fontSize:12,color:C.textSub,marginBottom:8}}>Cost per robot — Wright's Law learning curve drives cost down with cumulative production. Geopolitical stress pushes it back up.</div>
        <div style={{position:"relative",height:200}}><canvas ref={c2}></canvas></div>
      </Card>
      <Card>
        <SL>Policy events</SL>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
          {POLICY.map(e=>{const mat=MATERIALS.find(m=>m.id===e.mat);return(
            <div key={e.name} style={{padding:"9px 12px",border:`0.5px solid ${C.border}`,borderRadius:8,borderLeft:`2px solid ${e.type==="restriction"?C.red:C.green}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:C.textMuted}}>{e.year}</span><Badge col={e.type==="restriction"?C.red:C.green} bg={e.type==="restriction"?C.redD:C.greenD}>{e.type}</Badge></div>
              <div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:2}}>{e.name}</div>
              <div style={{fontSize:11,color:C.textSub}}>{mat?.name} · {e.impact>0?"+":""}{Math.round(e.impact*100)}%</div>
            </div>
          );})}
        </div>
      </Card>
    </div>
  );
}

/* ══ FLOW MAP ══ */
function FlowMapTab(){
  const ref=useRef<any>(null);
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    // Load D3 + topojson then draw
    const loadScript=(src,cb)=>{
      if(document.querySelector(`script[src="${src}"]`)){cb();return;}
      const s=document.createElement("script");s.src=src;s.onload=cb;document.head.appendChild(s);
    };
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js",()=>{
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js",()=>{
        drawMap(el);
      });
    });
  },[]);

  function drawMap(container){
    const d3=window.d3,topojson=window.topojson;
    if(!d3||!topojson)return;
    container.innerHTML="";
    const W=container.offsetWidth||700,H=360;
    const svg=d3.select(container).append("svg").attr("viewBox",`0 0 ${W} ${H}`).attr("width","100%").style("background",C.bg1).style("border-radius","8px");
    const proj=d3.geoNaturalEarth1().scale(W/6.2).translate([W/2,H/2]);
    const path=d3.geoPath(proj);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world=>{
      svg.append("g").selectAll("path")
        .data(topojson.feature(world,world.objects.countries).features)
        .join("path").attr("d",path)
        .attr("fill","#1a2030").attr("stroke","#2a3545").attr("stroke-width","0.4");

      // node data
      const extract=[
        {id:"cn_e", label:"China",       lon:104,lat:36, r:13,col:C.amber,  detail:"Rare earths, Si, Ga, W"},
        {id:"drc_e",label:"DRC",         lon:24, lat:-4, r:10,col:C.red,    detail:"Cobalt, Tantalum"},
        {id:"au_e", label:"Australia",   lon:134,lat:-25,r:9, col:C.steel,  detail:"Lithium, Nickel"},
        {id:"cl_e", label:"Chile",       lon:-71,lat:-23,r:9, col:C.steel,  detail:"Copper, Lithium"},
        {id:"id_e", label:"Indonesia",   lon:118,lat:-2, r:8, col:C.amber,  detail:"Nickel"},
        {id:"ru_e", label:"Russia",      lon:60, lat:60, r:8, col:C.steel,  detail:"Nickel, Gallium"},
      ];
      const refine=[
        {id:"cn_r", label:"China",       lon:112,lat:32, r:15,col:C.amber,  detail:"92% NdFeB · 80% Ga · 79% Si"},
        {id:"jp_r", label:"Japan",       lon:138,lat:36, r:8, col:C.blue,   detail:"Nickel, Copper"},
        {id:"eu_r", label:"Europe",      lon:9,  lat:50, r:8, col:C.steel,  detail:"Cobalt, Tantalum"},
        {id:"kr_r", label:"S. Korea",    lon:128,lat:37, r:7, col:C.purple, detail:"Indium, Silicon"},
      ];
      const comp=[
        {id:"tw_c", label:"Taiwan",      lon:121,lat:25, r:11,col:C.blue,   detail:"TSMC — 90%+ advanced chips"},
        {id:"jp_c", label:"Japan",       lon:141,lat:35, r:10,col:C.blue,   detail:"Motors, Gearboxes"},
        {id:"cn_c", label:"China",       lon:121,lat:29, r:10,col:C.amber,  detail:"Batteries, PCBs"},
        {id:"de_c", label:"Germany",     lon:10, lat:51, r:7, col:C.steel,  detail:"Actuators, Motors"},
        {id:"us_c", label:"USA",         lon:-100,lat:38,r:7, col:C.blue,   detail:"Sensors, AI chips"},
      ];
      const oem=[
        {id:"jp_o", label:"Japan OEMs",  lon:136,lat:34, r:9, col:C.blue,   detail:"Fanuc, Yaskawa, Kawasaki"},
        {id:"cn_o", label:"China OEMs",  lon:119,lat:31, r:9, col:C.amber,  detail:"Unitree, Elite, UBTECH"},
        {id:"us_o", label:"USA OEMs",    lon:-95,lat:38, r:8, col:C.blue,   detail:"Boston Dynamics, Figure, Agility"},
        {id:"eu_o", label:"EU OEMs",     lon:8,  lat:47, r:7, col:C.steel,  detail:"KUKA, ABB, Stäubli"},
      ];

      const all=[...extract,...refine,...comp,...oem];
      const byId=Object.fromEntries(all.map(n=>[n.id,n]));

      const edges=[
        // extraction → refining
        {f:"cn_e",t:"cn_r",col:"rgba(240,168,48,0.35)"},{f:"drc_e",t:"cn_r",col:"rgba(240,168,48,0.3)"},
        {f:"au_e",t:"cn_r",col:"rgba(240,168,48,0.25)"},{f:"cl_e",t:"cn_r",col:"rgba(240,168,48,0.2)"},
        {f:"id_e",t:"cn_r",col:"rgba(240,168,48,0.3)"},{f:"ru_e",t:"eu_r",col:"rgba(136,153,170,0.25)"},
        {f:"au_e",t:"jp_r",col:"rgba(74,158,255,0.2)"},{f:"drc_e",t:"eu_r",col:"rgba(136,153,170,0.2)"},
        // refining → components
        {f:"cn_r",t:"tw_c",col:"rgba(74,158,255,0.4)"},{f:"cn_r",t:"jp_c",col:"rgba(74,158,255,0.3)"},
        {f:"cn_r",t:"cn_c",col:"rgba(240,168,48,0.35)"},{f:"eu_r",t:"de_c",col:"rgba(136,153,170,0.3)"},
        {f:"jp_r",t:"jp_c",col:"rgba(74,158,255,0.25)"},{f:"kr_r",t:"tw_c",col:"rgba(155,127,232,0.3)"},
        // components → OEM
        {f:"tw_c",t:"jp_o",col:"rgba(74,158,255,0.35)"},{f:"jp_c",t:"jp_o",col:"rgba(74,158,255,0.3)"},
        {f:"cn_c",t:"cn_o",col:"rgba(240,168,48,0.35)"},{f:"de_c",t:"eu_o",col:"rgba(136,153,170,0.3)"},
        {f:"tw_c",t:"us_o",col:"rgba(74,158,255,0.3)"},{f:"us_c",t:"us_o",col:"rgba(74,158,255,0.25)"},
        {f:"jp_o",t:"us_o",col:"rgba(74,158,255,0.15)"},{f:"cn_o",t:"us_o",col:"rgba(240,168,48,0.12)"},
      ];

      // arrow marker
      svg.append("defs").append("marker").attr("id","arr").attr("markerWidth",6).attr("markerHeight",6)
        .attr("refX",5).attr("refY",3).attr("orient","auto")
        .append("path").attr("d","M0,0 L0,6 L6,3 z").attr("fill","rgba(136,153,170,0.5)");

      // edges
      edges.forEach(e=>{
        const fn=byId[e.f],tn=byId[e.t];
        if(!fn||!tn)return;
        const p1=proj([fn.lon,fn.lat]),p2=proj([tn.lon,tn.lat]);
        if(!p1||!p2)return;
        const mx=(p1[0]+p2[0])/2,my=(p1[1]+p2[1])/2-30;
        svg.append("path").attr("d",`M${p1[0]},${p1[1]} Q${mx},${my} ${p2[0]},${p2[1]}`)
          .attr("stroke",e.col).attr("stroke-width",1.5).attr("fill","none").attr("marker-end","url(#arr)");
      });

      // shape helpers
      const hexPts=(x,y,r)=>Array.from({length:6},(_,i)=>{const a=i*Math.PI/3-Math.PI/6;return`${x+r*Math.cos(a)},${y+r*Math.sin(a)}`;}).join(" ");
      const triPts=(x,y,r)=>`${x},${y-r} ${x+r*0.87},${y+r*0.5} ${x-r*0.87},${y+r*0.5}`;
      const sqPts=(x,y,r)=>`${x-r},${y-r} ${x+r},${y-r} ${x+r},${y+r} ${x-r},${y+r}`;

      // draw nodes
      const drawGroup=(nodes,shape)=>{
        nodes.forEach(n=>{
          const p=proj([n.lon,n.lat]);if(!p)return;
          const [x,y]=p,g=svg.append("g").style("cursor","default");
          g.append("title").text(`${n.label}: ${n.detail}`);
          if(shape==="circle") g.append("circle").attr("cx",x).attr("cy",y).attr("r",n.r).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          else if(shape==="square") g.append("polygon").attr("points",sqPts(x,y,n.r*0.8)).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          else if(shape==="hex") g.append("polygon").attr("points",hexPts(x,y,n.r)).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          else if(shape==="tri") g.append("polygon").attr("points",triPts(x,y,n.r)).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          g.append("text").attr("x",x).attr("y",y+n.r+11).attr("text-anchor","middle").attr("font-size","9").attr("fill",n.col).text(n.label);
        });
      };
      drawGroup(extract,"circle");
      drawGroup(refine,"square");
      drawGroup(comp,"hex");
      drawGroup(oem,"tri");
    }).catch(()=>{
      d3.select(container).append("div").style("padding","2rem").style("color",C.textMuted).style("text-align","center").text("Map data loading failed — check network.");
    });
  }

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card s={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${C.border}`,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
          {[{l:"Extraction",c:C.amber,sh:"●"},{l:"Refining",c:C.amber,sh:"■"},{l:"Components",c:C.blue,sh:"⬡"},{l:"OEM Assembly",c:C.steel,sh:"▲"}].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub}}>
              <span style={{color:x.c,fontSize:14}}>{x.sh}</span>{x.l}
            </span>
          ))}
          <span style={{fontSize:10,color:C.textMuted,marginLeft:"auto"}}>Hover nodes for detail</span>
        </div>
        <div ref={ref} style={{minHeight:360}}/>
      </Card>
      <Card>
        <SL>Critical flow concentrations</SL>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
          {[
            {node:"China refining",detail:"Processes 92% NdFeB, 80% gallium, 79% polysilicon globally",risk:9.2},
            {node:"Taiwan chips",detail:"TSMC fabricates 90%+ of leading-edge AI chips used in robots",risk:9.2},
            {node:"DRC cobalt",detail:"70% of global cobalt from a single politically unstable region",risk:8.7},
            {node:"Japan precision",detail:"Nabtesco & Harmonic Drive supply ~80% of precision gearboxes",risk:5.0},
            {node:"Indonesia nickel",detail:"37% of global nickel after 2020 export ban reshaped market",risk:6.8},
            {node:"EU reshoring",detail:"CRMA accelerating non-Chinese refining investment since 2024",risk:4.0},
          ].map(f=>(
            <div key={f.node} style={{padding:"9px 12px",border:`0.5px solid ${C.border}`,borderRadius:8,borderLeft:`2px solid ${rCol(f.risk)}`}}>
              <div style={{fontSize:12,fontWeight:500,color:C.text,marginBottom:3}}>{f.node}</div>
              <div style={{fontSize:11,color:C.textSub,lineHeight:1.5,marginBottom:5}}>{f.detail}</div>
              <Badge col={rCol(f.risk)} bg={rBg(f.risk)}>Risk {f.risk}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ══ MATERIALS ══ */
function MaterialsTab({result}){
  const [sel,setSel]=useState(null);
  const mat=sel?result.matB.find(m=>m.id===sel):null;
  const canRef=useRef<any>(null),cInst=useRef<any>(null);
  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    const top=result.matB.slice(0,8);
    cInst.current=new window.Chart(canRef.current,{type:"bar",data:{labels:top.map(m=>m.short),datasets:[{data:top.map(m=>m.geoRisk),backgroundColor:top.map(m=>rBg(m.geoRisk)),borderColor:top.map(m=>rCol(m.geoRisk)),borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:C.textMuted,font:{size:10}}},y:{min:0,max:10,grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:10}}}}}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[result.matB]);
  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card><SL>Geo-risk by material</SL><div style={{position:"relative",height:180}}><canvas ref={canRef}></canvas></div><GeoRiskLegend/></Card>
      <div style={{display:"grid",gridTemplateColumns:mat?"1fr 1fr":"1fr",gap:"1.25rem"}}>
        <Card>
          <SL>All materials — ranked by bottleneck severity</SL>
          {result.matB.map((m,i)=>(
            <div key={m.id} onClick={()=>setSel(sel===m.id?null:m.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,borderRadius:8,border:`0.5px solid ${sel===m.id?C.blue:C.border}`,background:sel===m.id?C.blueD:C.bg1,cursor:"pointer"}}>
              <span style={{fontSize:10,color:C.textMuted,width:14}}>#{i+1}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:C.text}}>{m.name}</div>
                <div style={{fontSize:10,color:C.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.desc}</div>
              </div>
              <Badge col={rCol(m.geoRisk)} bg={rBg(m.geoRisk)}>{m.geoRisk}/10</Badge>
            </div>
          ))}
        </Card>
        {mat&&<Card>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:3}}>{mat.name}</div>
          <div style={{fontSize:12,color:C.textSub,marginBottom:14}}>{mat.desc}</div>
          {[{title:"Top producers",data:mat.producers,col:C.blue},{title:"Refining",data:mat.refiners,col:C.amber}].map(s=>(
            <div key={s.title} style={{marginBottom:14}}>
              <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7}}>{s.title}</div>
              {s.data.map(p=>(
                <div key={p.c} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:11,color:C.textSub,width:80,flexShrink:0}}>{p.c}</span>
                  <div style={{flex:1,height:4,background:C.bg3,borderRadius:2}}><div style={{width:`${p.s}%`,height:4,background:s.col,borderRadius:2}}/></div>
                  <span style={{fontSize:11,color:s.col,width:26,textAlign:"right"}}>{p.s}%</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <div style={{background:C.bg1,borderRadius:8,padding:"9px 12px",border:`0.5px solid ${C.border}`}}><div style={{fontSize:10,color:C.textMuted}}>Global supply</div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{mat.supply} {mat.unit}</div></div>
            <div style={{background:C.bg1,borderRadius:8,padding:"9px 12px",border:`0.5px solid ${C.border}`}}><div style={{fontSize:10,color:C.textMuted}}>Geo-risk</div><div style={{fontSize:13,fontWeight:600,color:rCol(mat.geoRisk)}}>{mat.geoRisk}/10</div></div>
          </div>
        </Card>}
      </div>
    </div>
  );
}

/* ══ COMPONENTS ══ */
function ComponentsTab({result}){
  const [sel,setSel]=useState(null);
  const comp=sel?result.compB.find(c=>c.id===sel):null;
  const canRef=useRef<any>(null),cInst=useRef<any>(null);
  const canRef2=useRef<any>(null),cInst2=useRef<any>(null);

  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    cInst.current=new window.Chart(canRef.current,{type:"bar",data:{labels:result.compB.map(c=>c.name.split("/")[0].trim()),datasets:[{data:result.compB.map(c=>c.cost),backgroundColor:result.compB.map(c=>rBg(c.geoRisk)),borderColor:result.compB.map(c=>rCol(c.geoRisk)),borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:C.textMuted,font:{size:9},maxRotation:35}},y:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:10},callback:v=>"$"+(v/1000).toFixed(1)+"K"}}}}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[]);

  // Component price volatility over time for selected component
  useEffect(()=>{
    if(!canRef2.current||!window.Chart||!comp)return;
    if(cInst2.current)cInst2.current.destroy();
    const trajCosts=result.traj.map(t=>t.compCosts.find(c=>c.id===comp.id)?.cost||0);
    cInst2.current=new window.Chart(canRef2.current,{type:"line",data:{
      labels:result.traj.map(t=>t.year),
      datasets:[{label:"Cost trajectory",data:trajCosts,borderColor:C.amber,backgroundColor:"rgba(240,168,48,0.07)",fill:true,borderWidth:2,pointRadius:2,tension:0.3}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:10}}},y:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:10},callback:v=>"$"+(v/1000).toFixed(0)+"K"}}}}});
    return()=>{if(cInst2.current)cInst2.current.destroy();};
  },[comp,result.traj]);

  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card><SL>Component base costs (coloured by geo-risk)</SL><div style={{position:"relative",height:200}}><canvas ref={canRef}></canvas></div></Card>
      <div style={{display:"grid",gridTemplateColumns:comp?"1fr 1fr":"1fr",gap:"1.25rem"}}>
        <Card>
          <SL>Components — ranked by bottleneck severity</SL>
          {result.compB.map((c,i)=>(
            <div key={c.id} onClick={()=>setSel(sel===c.id?null:c.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,borderRadius:8,border:`0.5px solid ${sel===c.id?C.blue:C.border}`,background:sel===c.id?C.blueD:C.bg1,cursor:"pointer"}}>
              <span style={{fontSize:10,color:C.textMuted,width:14}}>#{i+1}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:C.text}}>{c.name}</div>
                <div style={{fontSize:10,color:C.textSub}}>Lead: {c.lead}wk · ${(c.cost/1000).toFixed(1)}K base · ±{Math.round(c.volatility*100)}% vol.</div>
              </div>
              <Badge col={rCol(c.geoRisk)} bg={rBg(c.geoRisk)}>{c.geoRisk}</Badge>
            </div>
          ))}
        </Card>
        {comp&&<Card>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:3}}>{comp.name}</div>
          <div style={{fontSize:11,color:C.textSub,marginBottom:10}}>Lead: {comp.lead}wk · Base cost: ${comp.cost.toLocaleString()} · Volatility: ±{Math.round(comp.volatility*100)}%</div>
          <SL>Price trajectory under current scenario</SL>
          <div style={{position:"relative",height:160,marginBottom:12}}><canvas ref={canRef2}></canvas></div>
          <SL>Key manufacturers</SL>
          {comp.makers.map(k=>(
            <div key={k.co} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:`0.5px solid ${C.border}`}}>
              <span style={{color:C.text}}>{k.co}</span><span style={{color:C.textSub}}>{k.cn}</span>
            </div>
          ))}
        </Card>}
      </div>
    </div>
  );
}

/* ══ OEMs ══ */
function OEMsTab({result}){
  const [filter,setFilter]=useState("All");
  const types=["All",...new Set(OEMS.map(o=>o.type))];
  const sorted=[...result.oemList].sort((a,b)=>b.projCap-a.projCap);
  const filtered=filter==="All"?sorted:sorted.filter(o=>o.type===filter);
  const maxCap=sorted[0]?.projCap||1;
  const canRef=useRef<any>(null),cInst=useRef<any>(null);
  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    const top10=sorted.slice(0,10);
    cInst.current=new window.Chart(canRef.current,{type:"bar",indexAxis:"y",data:{
      labels:top10.map(o=>o.name),
      datasets:[
        {label:"2024 cap.",data:top10.map(o=>o.cap24),backgroundColor:"rgba(136,153,170,0.25)",borderColor:C.steel,borderWidth:1},
        {label:"Projected",data:top10.map(o=>Math.round(o.projCap)),backgroundColor:"rgba(74,158,255,0.25)",borderColor:C.blue,borderWidth:1},
      ]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:10}}},y:{grid:{display:false},ticks:{color:C.textSub,font:{size:10}}}}}});
    return()=>{if(cInst.current)cInst.current.destroy();};
  },[result.oemList]);
  return(
    <div style={{display:"grid",gap:"1.25rem"}}>
      <Card>
        <div style={{display:"flex",gap:12,marginBottom:8}}>
          {[{l:"2024 capacity",c:C.steel},{l:"Scenario projected",c:C.blue}].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub}}>
              <span style={{width:10,height:10,borderRadius:2,background:x.c+"44",border:`1px solid ${x.c}`,display:"inline-block"}}></span>{x.l}
            </span>
          ))}
        </div>
        <div style={{position:"relative",height:320}}><canvas ref={canRef}></canvas></div>
        <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>OEM growth modelled via S-curve (logistic) capped at each manufacturer's stated maximum capacity multiple. No unbounded exponential extrapolation.</div>
      </Card>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {types.map(t=><button key={t} onClick={()=>setFilter(t)} style={{fontSize:11,padding:"4px 12px",borderRadius:20,border:`0.5px solid ${filter===t?C.blue:C.border}`,background:filter===t?C.blueD:"transparent",color:filter===t?C.blue:C.textSub,cursor:"pointer"}}>{t}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
        {filtered.map(o=>(
          <div key={o.id} style={{padding:"12px 14px",border:`0.5px solid ${C.border}`,borderRadius:9,background:C.bg1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div><div style={{fontSize:12,fontWeight:500,color:C.text}}>{o.name}</div><div style={{fontSize:10,color:C.textSub}}>{o.country}</div></div>
              <Badge col={C.steel} bg={C.steelD}>{o.type}</Badge>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
              <div><div style={{fontSize:9,color:C.textMuted}}>2024</div><div style={{fontSize:12,fontWeight:500,color:C.steel}}>{o.cap24}K</div></div>
              <div><div style={{fontSize:9,color:C.textMuted}}>Projected</div><div style={{fontSize:12,fontWeight:500,color:C.blue}}>{Math.round(o.projCap)}K</div></div>
            </div>
            <div style={{height:3,background:C.bg3,borderRadius:2}}><div style={{height:3,background:C.blue,borderRadius:2,width:`${Math.round((o.projCap/maxCap)*100)}%`}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ COST ══ */
function CostTab({result}){
  const totalBase=COMPONENTS.reduce((s,c)=>s+c.cost,0);
  const canRef=useRef<any>(null),cInst=useRef<any>(null);
  useEffect(()=>{
    if(!canRef.current||!window.Chart)return;
    if(cInst.current)cInst.current.destroy();
    const sorted=[...COMPONENTS].sort((a,b)=>b.cost-a.cost);
    cInst.current=new window.Chart(canRef.current,{type:"bar",data:{labels:sorted.map(c=>c.name.split("/")[0].trim()),datasets:[{data:sorted.map(c=>c.cost),backgroundColor:sorted.map(c=>rBg(c.geoRisk)),borderColor:sorted.map(c=>rCol(c.geoRisk)),borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:C.textMuted,font:{size:9},maxRotation:35}},y:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:C.textMuted,font:{size:10},callback:v=>"$"+(v/1000).toFixed(1)+"K"}}}}});
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
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`0.5px solid ${C.border}`}}>
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

/* ══ METHODOLOGY ══ */
function MethodologyTab(){
  const sections=[
    {title:"Binding constraint (min-of-three)",body:"maxRobots = min(materialCeiling, componentCeiling, OEMCeiling)\n\nThis is the fundamental bottleneck identity — the weakest link in the supply chain determines maximum throughput. All three ceilings are computed independently each year; the minimum is the binding constraint."},
    {title:"Material supply ceiling",body:"supplyFactor = 1 − (tradeWar×0.35×geoRisk) − (nationalism×0.25×producerConc) − (taiwanRisk×sectorMult) + reshoring×0.15 + recycling×0.10\nClamped: [0.05, 2.0]\n\nadjustedSupply = globalSupply × supplyFactor × 1.03^years  (3%/yr organic growth)\nsupplyKg = adjustedSupply × unitConversion\nrobotCeiling = supplyKg / demandPerRobot (kg)"},
    {title:"Component capacity ceiling",body:"capFactor = 1 − (tradeWar×0.2×geoRisk) − (taiwanRisk×sectorMult) + reshoring×0.2\nClamped: [0.05, 2.0]\n\nadjustedCap = baseCap × capFactor × 1.07^years  (7%/yr organic capacity growth)\nBinding = min(adjCap) across all component types"},
    {title:"OEM ceiling — S-curve model",body:"OEM growth follows a logistic S-curve, not unbounded exponential:\n\nsCurve(t) = t / (t + 8)   — approaches 1 asymptotically\nprojectedCap = cap2024 × (1 + (maxGrowth − 1) × sCurve(yrs)) × scenarioFactor\n\nThis prevents trillion-robot projections: a humanoid OEM with maxGrowth=15× reaches only ~9× by 2040 (t=16)."},
    {title:"Learning curve (Wright's Law)",body:"Cost falls as cumulative production doubles. Parameter: 15% cost reduction per doubling (observed in comparable hardware industries).\n\nlearnedCost = baseCost × (1 − 0.15)^log₂(cumulativeUnits / 3,000,000)\n\nEstimated 2024 base: ~3M cumulative robots. Geopolitical stress pushes cost back up via stressMult."},
    {title:"Component price volatility",body:"Each component has an empirically-estimated volatility coefficient (±5% for mature steel structures; ±22% for AI chips). Volatility is seeded deterministically by year + component ID (using sin function) to produce repeatable but scenario-sensitive price paths.\n\ncomponentCost(y) = learnedCost × stressMult × volatilityFactor(y, scenario)"},
    {title:"Geo-risk scoring",body:"Geo-risk (1–10) encodes: (1) producer concentration — HHI-like metric on top producers; (2) political stability of dominant producer; (3) refining dependency on single nation.\n\nAggregated score = mean(materialRisk × topRefinerShare) × (1 + tradeWar/200 + taiwanRisk/200), clamped [0,10]"},
    {title:"Data sources & caveats",body:"Material supply: USGS Mineral Commodity Summaries 2023–24. Component capacities: Wood Mackenzie, IDTechEx, BloombergNEF analyst estimates. OEM capacities: IFR World Robotics 2023 + company disclosures. All figures are estimates for scenario modelling, not forecasts. Client-side only — no data leaves the browser."},
  ];
  return(
    <div style={{display:"grid",gap:"0.75rem"}}>
      {sections.map(s=>(
        <Card key={s.title}>
          <div style={{fontSize:13,fontWeight:600,color:C.blue,marginBottom:7}}>{s.title}</div>
          <div style={{fontSize:12,color:C.textSub,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"var(--font-mono)"}}>{s.body}</div>
        </Card>
      ))}
    </div>
  );
}
