import { MATERIALS, COMPONENTS, OEMS, LEARNING_RATE, BASE_CUMULATIVE, ANNUAL_BASE_INSTALLS } from "./data.js";
import { fmt } from "./colors.js";

export function learningCurveCost(baseCost, cumulativeUnits) {
  const doublings = Math.log2(cumulativeUnits / BASE_CUMULATIVE);
  return baseCost * Math.pow(1 - LEARNING_RATE, Math.max(0, doublings));
}

export function oemCapAt(o, yrs, scenFactor) {
  const sCurve = yrs / (yrs + 8);
  return o.cap24 * (1 + (o.maxGrowth - 1) * sCurve) * Math.max(0.1, scenFactor);
}

export function simYear(sc, yrs) {
  const {tw,rn,tr,rs,rc,dg=15} = sc;

  const matB = MATERIALS.map(m => {
    let sf = 1.0
      - (tw/100)*0.35*(m.geoRisk/10)
      - (rn/100)*0.25*(m.producers[0].s/100)
      - (tr/100)*(m.cat==="semi"?0.55:0.05)
      + (rs/100)*0.15
      + (rc/100)*0.10;
    sf = Math.max(0.05, Math.min(2.0, sf));
    const mult = m.unit==="Mt/yr"?1e9:m.unit==="kt/yr"?1e6:1e3;
    const supplyKg = m.supply * sf * Math.pow(1.03, yrs) * mult;
    const robotsFromMat = supplyKg / m.demandPer;
    return {...m, sf, robotsFromMat, bScore:1/Math.max(robotsFromMat,1)};
  }).sort((a,b)=>b.bScore-a.bScore);

  const compB = COMPONENTS.map(c => {
    let cf = 1.0
      - (tw/100)*0.2*(c.geoRisk/10)
      - (tr/100)*(c.id==="semis"?0.60:0.10)
      + (rs/100)*0.20;
    cf = Math.max(0.05, Math.min(2.0, cf));
    const adjCap = c.cap * cf * Math.pow(1.07, yrs) * 1000;
    return {...c, cf, adjCap, bScore:1/Math.max(adjCap,1)};
  }).sort((a,b)=>b.bScore-a.bScore);

  const oemList = OEMS.map(o => {
    const sf = Math.max(0.1, 1.0
      - (tw/100)*0.15*(o.geoRisk/10)
      - (tr/100)*0.20
      + (rs/100)*0.10);
    const projCap = oemCapAt(o, yrs, sf);
    return {...o, projCap};
  });
  const totalOEM = oemList.reduce((s,o)=>s+o.projCap,0)*1000;

  const mfm = Math.round(matB[0].robotsFromMat);
  const mfc = Math.round(compB[0].adjCap);
  const mfo = Math.round(totalOEM);
  // Demand ceiling: dg drives how fast the market can absorb robots.
  // At low dg demand can become binding; also accelerates learning curve.
  const mdd = Math.round(ANNUAL_BASE_INSTALLS * Math.pow(1 + dg/100, yrs));
  const maxR = Math.min(mfm, mfc, mfo, mdd);

  const baseCost = COMPONENTS.reduce((s,c)=>s+c.cost,0);
  // dg accelerates cumulative production → faster Wright's Law cost decline.
  // Midpoint approximation: average annual units over the period grow at dg/2.
  const cumFactor = Math.pow(1 + dg/100, yrs/2);
  const approxCumulative = BASE_CUMULATIVE + ANNUAL_BASE_INSTALLS * yrs * cumFactor;
  const learnedBase = learningCurveCost(baseCost, approxCumulative);
  const stressMult = 1 + (tw/100)*0.35 + (rn/100)*0.15 + (tr/100)*0.25 - (rs/100)*0.08 - (rc/100)*0.04;
  const costPerRobot = Math.round(learnedBase * Math.max(0.4, stressMult));

  const geoRisk = Math.min(10, MATERIALS.reduce((s,m)=>
    s+(m.geoRisk*(m.refiners[0]?.s||0)/100),0)/MATERIALS.length
    *(1+tw/200+tr/200));

  return {matB, compB, oemList, mfm, mfc, mfo, mdd, maxR, geoRisk, costPerRobot, baseCost};
}

export function sim(sc) {
  const yrs = Math.max(1, sc.yr-2024);
  const base = simYear(sc, yrs);
  const binding = base.maxR===base.mfm
    ? `Materials: ${base.matB[0].name}`
    : base.maxR===base.mfc
    ? `Components: ${base.compB[0].name}`
    : base.maxR===base.mfo
    ? "OEM Assembly"
    : `Demand: ${sc.dg}%/yr ceiling`;

  const traj = [];
  for (let y=2024; y<=sc.yr; y++) {
    const ky = Math.max(1, y-2024);
    const r = simYear(sc, ky);
    const compCosts = COMPONENTS.map(c=>{
      const cumF = Math.pow(1 + (sc.dg||15)/100, ky/2);
      const approxCum = BASE_CUMULATIVE + ANNUAL_BASE_INSTALLS * ky * cumF;
      const learned = learningCurveCost(c.cost, approxCum);
      const stress = 1+(sc.tw/100)*0.35*(c.geoRisk/10)+(sc.tr/100)*(c.id==="semis"?0.5:0.1)-(sc.rs/100)*0.08;
      const volSeed = Math.sin(y*17+c.cost)*0.5+0.5;
      const vol = 1 + (volSeed-0.5)*c.volatility*((sc.tw+sc.tr)/100+0.3);
      return {id:c.id, name:c.name, cost:Math.round(learned*Math.max(0.4,stress)*vol)};
    });
    // Robot type breakdown derived from OEM capacity mix each year
    const typeMap = {};
    r.oemList.forEach(o=>{ typeMap[o.type]=(typeMap[o.type]||0)+o.projCap; });
    const totalCap = r.oemList.reduce((s,o)=>s+o.projCap,0)||1;
    const typeRobots = Object.fromEntries(
      Object.entries(typeMap).map(([t,v])=>[t, Math.round((v/totalCap)*r.maxR)])
    );
    traj.push({year:y, robots:Math.round(r.maxR), matCap:Math.round(r.mfm), compCap:Math.round(r.mfc), oemCap:Math.round(r.mfo), demandCap:r.mdd, costPerRobot:r.costPerRobot, compCosts, typeRobots});
  }

  return {...base, binding, traj};
}

export function validate(sc, result) {
  const issues = [];
  const yrs = Math.max(1,sc.yr-2024);

  const expectedMax = Math.min(result.mfm, result.mfc, result.mfo, result.mdd);
  if (result.maxR !== expectedMax)
    issues.push(`maxR=${result.maxR} but min(mfm,mfc,mfo,mdd)=${expectedMax}. Should be equal.`);

  if (result.geoRisk<0||result.geoRisk>10)
    issues.push(`geoRisk=${result.geoRisk.toFixed(2)} outside [0,10].`);

  if (result.costPerRobot<=0)
    issues.push(`costPerRobot=${result.costPerRobot} must be >0.`);

  if (sc.tw===0&&sc.rn===0&&sc.tr===0&&yrs>2) {
    if (result.costPerRobot >= result.baseCost)
      issues.push(`Cost $${result.costPerRobot} should be below base $${result.baseCost} due to learning curve at yr=${sc.yr}.`);
  }

  if (sc.tw>50) {
    const baseline = simYear({...sc,tw:0},yrs);
    if (result.costPerRobot < baseline.costPerRobot)
      issues.push(`Trade war cost $${result.costPerRobot} should exceed baseline $${baseline.costPerRobot}.`);
  }

  const oemTheorMax = OEMS.reduce((s,o)=>s+o.cap24*o.maxGrowth,0)*1000;
  if (result.mfo > oemTheorMax*1.05)
    issues.push(`OEM ceiling ${fmt(result.mfo)} exceeds theoretical max ${fmt(oemTheorMax)} (all OEMs at max growth).`);

  result.matB.forEach(m=>{
    if(m.sf<0.05||m.sf>2.0)
      issues.push(`${m.name} supplyFactor=${m.sf.toFixed(3)} outside [0.05,2.0].`);
  });

  if (sc.tw===0&&sc.rn===0&&sc.tr===0&&result.traj.length>3) {
    const first=result.traj[0].costPerRobot, last=result.traj[result.traj.length-1].costPerRobot;
    if (last>=first)
      issues.push(`Baseline cost trajectory not declining: ${first}→${last}. Learning curve not effective.`);
  }

  return issues;
}
