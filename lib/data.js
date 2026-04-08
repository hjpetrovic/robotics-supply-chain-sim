/* ─── LEARNING CURVE ─── */
export const LEARNING_RATE = 0.15;
export const BASE_CUMULATIVE = 8500000;
export const ANNUAL_BASE_INSTALLS = 542000;

/* ─── MATERIALS ─── */
export const MATERIALS = [
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

/* ─── COMPONENTS ─── */
export const COMPONENTS = [
  {id:"motors",   name:"Servo/BLDC Motors",    mats:["ndy","copper","steel"],  makers:[{co:"Fanuc",cn:"Japan"},{co:"Yaskawa",cn:"Japan"},{co:"Siemens",cn:"Germany"}],   cap:28, geoRisk:5.5,lead:14,cost:800,  volatility:0.08},
  {id:"gearboxes",name:"Precision Gearboxes",  mats:["steel","tungsten"],      makers:[{co:"Nabtesco",cn:"Japan"},{co:"Harmonic Drive",cn:"Japan"}],                     cap:22, geoRisk:5.0,lead:20,cost:1200, volatility:0.06},
  {id:"batteries",name:"Battery Packs",        mats:["lithium","cobalt","nickel"],makers:[{co:"CATL",cn:"China"},{co:"Panasonic",cn:"Japan"},{co:"LG Energy",cn:"S.Korea"}],cap:180,geoRisk:6.8,lead:8, cost:2500, volatility:0.18},
  {id:"semis",    name:"SoCs & AI Chips",       mats:["silicon","gallium"],     makers:[{co:"TSMC",cn:"Taiwan"},{co:"NVIDIA",cn:"USA"},{co:"Samsung",cn:"S.Korea"}],      cap:95, geoRisk:8.9,lead:26,cost:3500, volatility:0.22},
  {id:"sensors",  name:"LiDAR/Vision Sensors",  mats:["gallium","silicon"],     makers:[{co:"Ouster",cn:"USA"},{co:"Hesai",cn:"China"}],                                  cap:40, geoRisk:7.2,lead:18,cost:1500, volatility:0.14},
  {id:"actuators",name:"Linear Actuators",      mats:["ndy","copper","steel"],  makers:[{co:"Bosch Rexroth",cn:"Germany"},{co:"SKF",cn:"Sweden"}],                        cap:50, geoRisk:5.2,lead:12,cost:600,  volatility:0.07},
  {id:"pcbs",     name:"PCBs & Power Elec.",    mats:["copper","silicon"],      makers:[{co:"Foxconn",cn:"Taiwan"},{co:"Jabil",cn:"USA"}],                                cap:320,geoRisk:7.5,lead:10,cost:400,  volatility:0.10},
  {id:"structures",name:"Structural Frames",    mats:["steel","carbon_fiber"],  makers:[{co:"Arconic",cn:"USA"},{co:"Toray",cn:"Japan"}],                                 cap:200,geoRisk:4.0,lead:6, cost:1800, volatility:0.05},
];

/* ─── OEMs ─── */
export const OEMS = [
  {id:"fanuc",    name:"Fanuc",              country:"Japan",       type:"Industrial",   cap24:80,  maxGrowth:1.8, geoRisk:5.0},
  {id:"yaskawa",  name:"Yaskawa",            country:"Japan",       type:"Industrial",   cap24:60,  maxGrowth:1.7, geoRisk:5.0},
  {id:"kuka",     name:"KUKA / Midea",       country:"Germany/CN",  type:"Industrial",   cap24:45,  maxGrowth:2.0, geoRisk:5.5},
  {id:"abb",      name:"ABB Robotics",       country:"Switzerland", type:"Industrial",   cap24:55,  maxGrowth:1.9, geoRisk:4.8},
  {id:"denso",    name:"Denso Robotics",     country:"Japan",       type:"Industrial",   cap24:35,  maxGrowth:1.6, geoRisk:5.0},
  {id:"kawasaki", name:"Kawasaki Robotics",  country:"Japan",       type:"Industrial",   cap24:25,  maxGrowth:1.8, geoRisk:5.2},
  {id:"nachi",    name:"Nachi-Fujikoshi",    country:"Japan",       type:"Industrial",   cap24:18,  maxGrowth:1.6, geoRisk:5.0},
  {id:"epson",    name:"Epson Robots",       country:"Japan",       type:"Industrial",   cap24:22,  maxGrowth:1.8, geoRisk:4.8},
  {id:"mitsubishi",name:"Mitsubishi Elec.",  country:"Japan",       type:"Industrial",   cap24:20,  maxGrowth:1.7, geoRisk:4.8},
  {id:"yamaha",   name:"Yamaha Robotics",    country:"Japan",       type:"Industrial",   cap24:10,  maxGrowth:1.5, geoRisk:4.8},
  {id:"siasun",   name:"Siasun",             country:"China",       type:"Industrial",   cap24:30,  maxGrowth:3.5, geoRisk:7.5},
  {id:"estun",    name:"Estun Automation",   country:"China",       type:"Industrial",   cap24:25,  maxGrowth:4.0, geoRisk:7.5},
  {id:"efort",    name:"Efort Intelligent",  country:"China",       type:"Industrial",   cap24:18,  maxGrowth:4.0, geoRisk:7.5},
  {id:"elite",    name:"Elite Robots",       country:"China",       type:"Collaborative",cap24:15,  maxGrowth:4.5, geoRisk:7.5},
  {id:"unitree",  name:"Unitree Robotics",   country:"China",       type:"Mobile",       cap24:20,  maxGrowth:6.0, geoRisk:7.8},
  {id:"universal",name:"Universal Robots",   country:"Denmark",     type:"Collaborative",cap24:22,  maxGrowth:3.5, geoRisk:4.5},
  {id:"doosan",   name:"Doosan Robotics",    country:"S.Korea",     type:"Collaborative",cap24:8,   maxGrowth:4.0, geoRisk:5.8},
  {id:"hanwha",   name:"Hanwha Robotics",    country:"S.Korea",     type:"Collaborative",cap24:6,   maxGrowth:3.5, geoRisk:5.8},
  {id:"omron",    name:"Omron Adept",        country:"Japan/USA",   type:"Collaborative",cap24:8,   maxGrowth:2.5, geoRisk:4.8},
  {id:"boston",   name:"Boston Dynamics",    country:"USA",         type:"Mobile",       cap24:5,   maxGrowth:8.0, geoRisk:5.0},
  {id:"figure",   name:"Figure AI",          country:"USA",         type:"Humanoid",     cap24:0.5, maxGrowth:15.0,geoRisk:5.5},
  {id:"agility",  name:"Agility Robotics",   country:"USA",         type:"Humanoid",     cap24:1,   maxGrowth:10.0,geoRisk:5.0},
  {id:"staubli",  name:"Stäubli Robotics",   country:"Switzerland", type:"Industrial",   cap24:8,   maxGrowth:1.7, geoRisk:4.2},
  {id:"comau",    name:"Comau / Stellantis", country:"Italy",       type:"Industrial",   cap24:10,  maxGrowth:2.0, geoRisk:5.0},
];

/* ─── POLICY ─── */
export const POLICY = [
  {year:2020,name:"Indonesia nickel export ban",  mat:"nickel", impact:-0.20,type:"restriction"},
  {year:2022,name:"US CHIPS Act",                 mat:"silicon",impact:+0.15,type:"subsidy"},
  {year:2022,name:"US IRA battery credits",       mat:"lithium",impact:+0.20,type:"subsidy"},
  {year:2023,name:"China gallium export controls",mat:"gallium",impact:-0.30,type:"restriction"},
  {year:2023,name:"DRC cobalt royalty increase",  mat:"cobalt", impact:-0.15,type:"restriction"},
  {year:2024,name:"EU Critical Minerals Act",     mat:"ndy",    impact:+0.10,type:"subsidy"},
];

/* ─── SCENARIOS ─── */
export const PRESETS = [
  {name:"Baseline 2030",  sc:{tw:0, rn:0, tr:0, dg:15,rs:0, rc:5, yr:2030}},
  {name:"Trade war",      sc:{tw:70,rn:40,tr:20,dg:15,rs:20,rc:5, yr:2030}},
  {name:"Taiwan crisis",  sc:{tw:50,rn:30,tr:85,dg:10,rs:30,rc:8, yr:2030}},
  {name:"Optimistic 2035",sc:{tw:0, rn:0, tr:0, dg:25,rs:60,rc:30,yr:2035}},
  {name:"Supply crisis",  sc:{tw:80,rn:75,tr:60,dg:20,rs:10,rc:5, yr:2030}},
];

export const DEF = {tw:0,rn:0,tr:0,dg:15,rs:0,rc:5,yr:2030};

export const TABS = ["Overview","Scenarios","Trajectory","Flow Map","Materials","Components","OEMs","Cost","Methodology"];
