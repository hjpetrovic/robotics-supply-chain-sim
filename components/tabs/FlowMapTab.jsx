"use client";

import { useEffect, useRef } from "react";
import { C, rCol, rBg } from "../../lib/colors.js";
import { Card, SL, Badge } from "../ui/primitives.jsx";

export function FlowMapTab() {
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
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

  function drawMap(container) {
    const d3=window.d3,topojson=window.topojson;
    if(!d3||!topojson)return;
    container.innerHTML="";
    const W=container.offsetWidth||700,H=360;

    const svg=d3.select(container).append("svg")
      .attr("viewBox",`0 0 ${W} ${H}`)
      .attr("width","100%")
      .style("background",C.bg1)
      .style("border-radius","8px")
      .style("display","block");

    // Tooltip
    const tip=d3.select(container).append("div")
      .style("position","absolute")
      .style("background","rgba(14,19,48,0.97)")
      .style("border","1px solid rgba(117,113,228,0.3)")
      .style("border-radius","8px")
      .style("padding","8px 12px")
      .style("font-size","11px")
      .style("color",C.text)
      .style("pointer-events","none")
      .style("opacity","0")
      .style("max-width","200px")
      .style("line-height","1.6")
      .style("z-index","10")
      .style("transition","opacity 0.1s")
      .style("top","0").style("left","0");

    const proj=d3.geoNaturalEarth1().scale(W/6.2).translate([W/2,H/2]);
    const path=d3.geoPath(proj);

    // Single group — everything zooms together.
    // Node groups are counter-scaled on zoom so icons stay visually constant size.
    const g=svg.append("g");

    const zoom=d3.zoom()
      .scaleExtent([1,6])
      .translateExtent([[0,0],[W,H]])
      .on("zoom",(ev)=>{
        const k=ev.transform.k;
        g.attr("transform",ev.transform);
        // Counter-scale each node group: translate stays at projected coords,
        // but internal shapes/labels scale by 1/k so visual size is unchanged.
        g.selectAll(".node-gr").attr("transform",function(d){
          const p=proj([d.lon,d.lat]);
          if(!p)return "";
          return `translate(${p[0]},${p[1]}) scale(${1/k})`;
        });
      });
    svg.call(zoom);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world=>{
      g.append("g").selectAll("path")
        .data(topojson.feature(world,world.objects.countries).features)
        .join("path").attr("d",path)
        .attr("fill",C.bg0).attr("stroke",C.bg3).attr("stroke-width","0.4");

      const extract=[
        {id:"cn_e",label:"China",     lon:104,lat:36, r:13,col:C.amber,detail:"Rare earths, Si, Ga, W"},
        {id:"drc_e",label:"DRC",      lon:24, lat:-4, r:10,col:C.red,  detail:"Cobalt, Tantalum"},
        {id:"au_e", label:"Australia",lon:134,lat:-25,r:9, col:C.steel,detail:"Lithium, Nickel"},
        {id:"cl_e", label:"Chile",    lon:-71,lat:-23,r:9, col:C.steel,detail:"Copper, Lithium"},
        {id:"id_e", label:"Indonesia",lon:118,lat:-2, r:8, col:C.amber,detail:"Nickel"},
        {id:"ru_e", label:"Russia",   lon:60, lat:60, r:8, col:C.steel,detail:"Nickel, Gallium"},
      ];
      const refine=[
        {id:"cn_r",label:"China",    lon:112,lat:32, r:15,col:C.amber, detail:"92% NdFeB · 80% Ga · 79% Si"},
        {id:"jp_r",label:"Japan",    lon:138,lat:36, r:8, col:C.blue,  detail:"Nickel, Copper"},
        {id:"eu_r",label:"Europe",   lon:9,  lat:50, r:8, col:C.steel, detail:"Cobalt, Tantalum"},
        {id:"kr_r",label:"S. Korea", lon:128,lat:37, r:7, col:C.purple,detail:"Indium, Silicon"},
      ];
      const comp=[
        {id:"tw_c",label:"Taiwan", lon:121,lat:25,  r:11,col:C.blue, detail:"TSMC — 90%+ advanced chips"},
        {id:"jp_c",label:"Japan",  lon:141,lat:35,  r:10,col:C.blue, detail:"Motors, Gearboxes"},
        {id:"cn_c",label:"China",  lon:121,lat:29,  r:10,col:C.amber,detail:"Batteries, PCBs"},
        {id:"de_c",label:"Germany",lon:10, lat:51,  r:7, col:C.steel,detail:"Actuators, Motors"},
        {id:"us_c",label:"USA",    lon:-100,lat:38, r:7, col:C.blue, detail:"Sensors, AI chips"},
      ];
      const oem=[
        {id:"jp_o",label:"Japan OEMs",lon:136,lat:34,r:9,col:C.blue, detail:"Fanuc, Yaskawa, Kawasaki"},
        {id:"cn_o",label:"China OEMs",lon:119,lat:31,r:9,col:C.amber,detail:"Unitree, Elite, UBTECH"},
        {id:"us_o",label:"USA OEMs",  lon:-95,lat:38,r:8,col:C.blue, detail:"Boston Dynamics, Figure, Agility"},
        {id:"eu_o",label:"EU OEMs",   lon:8,  lat:47,r:7,col:C.steel,detail:"KUKA, ABB, Stäubli"},
      ];

      const all=[...extract,...refine,...comp,...oem];
      const byId=Object.fromEntries(all.map(n=>[n.id,n]));

      const edges=[
        {f:"cn_e",t:"cn_r",col:"rgba(240,168,48,0.35)"},{f:"drc_e",t:"cn_r",col:"rgba(240,168,48,0.3)"},
        {f:"au_e",t:"cn_r",col:"rgba(240,168,48,0.25)"},{f:"cl_e",t:"cn_r",col:"rgba(240,168,48,0.2)"},
        {f:"id_e",t:"cn_r",col:"rgba(240,168,48,0.3)"},{f:"ru_e",t:"eu_r",col:"rgba(136,153,170,0.25)"},
        {f:"au_e",t:"jp_r",col:"rgba(74,158,255,0.2)"},{f:"drc_e",t:"eu_r",col:"rgba(136,153,170,0.2)"},
        {f:"cn_r",t:"tw_c",col:"rgba(74,158,255,0.4)"},{f:"cn_r",t:"jp_c",col:"rgba(74,158,255,0.3)"},
        {f:"cn_r",t:"cn_c",col:"rgba(240,168,48,0.35)"},{f:"eu_r",t:"de_c",col:"rgba(136,153,170,0.3)"},
        {f:"jp_r",t:"jp_c",col:"rgba(74,158,255,0.25)"},{f:"kr_r",t:"tw_c",col:"rgba(155,127,232,0.3)"},
        {f:"tw_c",t:"jp_o",col:"rgba(74,158,255,0.35)"},{f:"jp_c",t:"jp_o",col:"rgba(74,158,255,0.3)"},
        {f:"cn_c",t:"cn_o",col:"rgba(240,168,48,0.35)"},{f:"de_c",t:"eu_o",col:"rgba(136,153,170,0.3)"},
        {f:"tw_c",t:"us_o",col:"rgba(74,158,255,0.3)"},{f:"us_c",t:"us_o",col:"rgba(74,158,255,0.25)"},
        {f:"jp_o",t:"us_o",col:"rgba(74,158,255,0.15)"},{f:"cn_o",t:"us_o",col:"rgba(240,168,48,0.12)"},
      ];

      g.append("defs").append("marker").attr("id","arr").attr("markerWidth",6).attr("markerHeight",6)
        .attr("refX",5).attr("refY",3).attr("orient","auto")
        .append("path").attr("d","M0,0 L0,6 L6,3 z").attr("fill","rgba(136,153,170,0.5)");

      edges.forEach(e=>{
        const fn=byId[e.f],tn=byId[e.t];
        if(!fn||!tn)return;
        const p1=proj([fn.lon,fn.lat]),p2=proj([tn.lon,tn.lat]);
        if(!p1||!p2)return;
        const mx=(p1[0]+p2[0])/2,my=(p1[1]+p2[1])/2-30;
        g.append("path").attr("d",`M${p1[0]},${p1[1]} Q${mx},${my} ${p2[0]},${p2[1]}`)
          .attr("stroke",e.col).attr("stroke-width",1.5).attr("fill","none").attr("marker-end","url(#arr)");
      });

      const hexPts=(r)=>Array.from({length:6},(_,i)=>{const a=i*Math.PI/3-Math.PI/6;return`${r*Math.cos(a)},${r*Math.sin(a)}`;}).join(" ");
      const triPts=(r)=>`0,${-r} ${r*0.87},${r*0.5} ${-r*0.87},${r*0.5}`;
      const sqPts=(r)=>`${-r},${-r} ${r},${-r} ${r},${r} ${-r},${r}`;

      const showTip=(n,ev)=>{
        const rect=container.getBoundingClientRect();
        tip.style("opacity","1")
          .style("left",(ev.clientX-rect.left+14)+"px")
          .style("top",(ev.clientY-rect.top-8)+"px")
          .html(`<span style="font-weight:600;color:${n.col}">${n.label}</span><br><span style="color:${C.textSub}">${n.detail}</span>`);
      };
      const moveTip=(ev)=>{
        const rect=container.getBoundingClientRect();
        tip.style("left",(ev.clientX-rect.left+14)+"px").style("top",(ev.clientY-rect.top-8)+"px");
      };
      const hideTip=()=>tip.style("opacity","0");

      // drawGroup: shapes centered at (0,0), group translated to projected position.
      // On zoom, groups are counter-scaled via scale(1/k) keeping visual size constant.
      const drawGroup=(nodes,shape)=>{
        nodes.forEach(n=>{
          const p=proj([n.lon,n.lat]);if(!p)return;
          const gr=g.append("g")
            .datum(n)  // lon/lat bound for zoom counter-scaling
            .attr("class","node-gr")
            .attr("transform",`translate(${p[0]},${p[1]})`)
            .style("cursor","pointer");
          if(shape==="circle")  gr.append("circle").attr("cx",0).attr("cy",0).attr("r",n.r).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          else if(shape==="square") gr.append("polygon").attr("points",sqPts(n.r*0.8)).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          else if(shape==="hex") gr.append("polygon").attr("points",hexPts(n.r)).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          else if(shape==="tri") gr.append("polygon").attr("points",triPts(n.r)).attr("fill",n.col+"28").attr("stroke",n.col).attr("stroke-width",1.5);
          gr.append("text").attr("x",0).attr("y",n.r+11).attr("text-anchor","middle").attr("font-size","9").attr("fill",n.col).text(n.label);
          gr.on("mouseenter",(ev)=>showTip(n,ev))
            .on("mousemove",moveTip)
            .on("mouseleave",hideTip);
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
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
          {[{l:"Extraction",c:C.amber,sh:"●"},{l:"Refining",c:C.amber,sh:"■"},{l:"Components",c:C.blue,sh:"⬡"},{l:"OEM Assembly",c:C.steel,sh:"▲"}].map(x=>(
            <span key={x.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub}}>
              <span style={{color:x.c,fontSize:14}}>{x.sh}</span>{x.l}
            </span>
          ))}
          <span style={{fontSize:10,color:C.textMuted,marginLeft:"auto"}}>Scroll to zoom · hover nodes for detail</span>
        </div>
        <div ref={ref} style={{minHeight:360,position:"relative"}}/>
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
            <div key={f.node} style={{padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:8,borderLeft:`2px solid ${rCol(f.risk)}`}}>
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
