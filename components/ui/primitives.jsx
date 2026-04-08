import { C } from "../../lib/colors.js";

export const Card = ({children, s={}}) => (
  <div style={{background:C.bg2,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"1rem 1.25rem",...s}}>
    {children}
  </div>
);

export const SL = ({children}) => (
  <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:500,marginBottom:8}}>
    {children}
  </div>
);

export const Badge = ({children, col=C.steel, bg=C.steelD}) => (
  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:bg,color:col,fontWeight:500,whiteSpace:"nowrap"}}>
    {children}
  </span>
);

export const Metric = ({label, value, sub, accent=C.blue}) => (
  <div style={{background:C.bg1,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
    <div style={{fontSize:10,color:C.textMuted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</div>
    <div style={{fontSize:20,fontWeight:600,color:accent,marginBottom:2,letterSpacing:"-0.02em"}}>{value}</div>
    <div style={{fontSize:11,color:C.textSub}}>{sub}</div>
  </div>
);
