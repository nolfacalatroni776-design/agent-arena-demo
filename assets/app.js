/* Agent Arena Demo — SPA
   Hash-based router with multiple views, mock data, and interactive flows.
*/

// ---------- Mock data ----------
const DB = {
  user: {
    name: "陈思颖", handle: "@cici.ai", role: "高级标注专家 · 数据科学家",
    balance: 12480, // bounty CNY
    rank: "S 级 · TOP 3%",
    avatar: "CC",
    teams: 235, posts: 80, followers: "2.3k",
    orgs: ["org-rwai","org-personal","org-antfin"],
    currentOrg: "org-rwai"
  },
  orgs: [
    {id:"org-rwai", name:"清华 RWAI Lab", short:"RW", plan:"Team Pro", seats:24, used:18,
     role:"Org Admin", domain:"rwai.tsinghua.edu", billing:"年度 ¥360,000",
     features:["共享 Agents","共享数据集","SSO / SAML","审计日志","沙盒配额池 200h/月","私有评测"],
     members:[
       {name:"陈思颖", role:"Org Admin", a:"CC", on:true},
       {name:"Roger Korsgaard", role:"Maintainer", a:"RK", on:true},
       {name:"Terry Lipschultz", role:"Member", a:"TL", on:false},
       {name:"Angel Bergson", role:"Member", a:"AB", on:true},
       {name:"Zain Culhane", role:"Member · 评审", a:"ZC", on:true},
     ]},
    {id:"org-personal", name:"个人空间", short:"个人", plan:"Free", seats:1, used:1,
     role:"Owner", domain:"-", billing:"按次计费",
     features:["公开竞技场","受限沙盒 5h/月","公共数据集"], members:[{name:"陈思颖",role:"Owner",a:"CC",on:true}]},
    {id:"org-antfin", name:"蚂蚁 AntFin · 风控组", short:"AF", plan:"Enterprise", seats:120, used:87,
     role:"Member · 评审", domain:"antgroup.com", billing:"企业合同",
     features:["专属沙盒集群","数据加密驻留","审计与合规导出","私有方案市场","专属客户经理"],
     members:[{name:"Angel Bergson",role:"Org Admin",a:"AB",on:true},{name:"陈思颖",role:"Member",a:"CC",on:true}]},
  ],
  scenarios: [
    {id:"customer", name:"智能客服 & 工单", icon:"customer", color:"g1"},
    {id:"riskctrl", name:"金融风控", icon:"riskctrl", color:"g2"},
    {id:"research", name:"研报 / 行研", icon:"research", color:"g3"},
    {id:"medical",  name:"医疗影像解读", icon:"medical", color:"g4"},
    {id:"code",     name:"代码 Agent", icon:"code", color:"g5"},
    {id:"ops",      name:"运维 SRE", icon:"ops", color:"g6"},
    {id:"marketing",name:"营销文案 & 海报", icon:"marketing", color:"g3"},
    {id:"legal",    name:"合规法务", icon:"legal", color:"g2"},
    {id:"embodied", name:"具身智能 / 仿真", icon:"embodied", color:"g5"},
  ],
  arenas: [
    {id:"arena-001", scenario:"customer", title:"航旅退改签复杂工单 PK", bounty:60000, teams:42, deadline:"6月18日",
     desc:"基于真实航旅客服记录构建，含 200+ 条多轮难例工单（含越权请求、跨币种退款、签证联运异常等）", live:true, status:"报名中"},
    {id:"arena-002", scenario:"riskctrl", title:"反欺诈交易识别 v3", bounty:120000, teams:67, deadline:"6月22日",
     desc:"覆盖伪冒申请、套现、团伙欺诈三大类共 5000 条难例样本，需控制误杀率 < 0.3%", live:true, status:"对决中"},
    {id:"arena-003", scenario:"research", title:"上市公司年报研读 & 估值建模", bounty:88000, teams:31, deadline:"7月1日",
     desc:"54 份港股/A 股年报，需输出估值模型、敏感性分析与 3 段执行摘要", status:"报名中"},
    {id:"arena-004", scenario:"medical", title:"胸片病灶定位 (10 类长尾)", bounty:150000, teams:24, deadline:"7月8日",
     desc:"含 12k 张影像，长尾类别占比 18%。需输出 mask + 报告 + 不确定性区间", status:"评测中"},
    {id:"arena-005", scenario:"code", title:"真实仓库 Bug 修复 (SWE-Bench-Pro)", bounty:200000, teams:91, deadline:"6月30日",
     desc:"480 个企业内网真实 Bug，涉及多语言、跨包依赖。允许调用沙盒终端", live:true, status:"对决中"},
    {id:"arena-006", scenario:"ops", title:"K8s 集群异常根因定位", bounty:55000, teams:18, deadline:"7月12日",
     desc:"50 个真实 incident，输入指标/日志/链路，输出根因 + 修复脚本", status:"报名中"},
    {id:"arena-007", scenario:"embodied", title:"家庭服务机器人 · 长程任务 PK (Habitat 3.0)", bounty:260000, teams:14, deadline:"7月20日",
     desc:"100 个家庭长程任务（找物-取物-递送-整理），Habitat 3.0 + Isaac Sim 双引擎复跑，评测含成功率/碰撞/能耗/人机交接", live:true, status:"对决中"},
    {id:"arena-008", scenario:"embodied", title:"工厂双臂分拣 · ManiSkill3 真机迁移", bounty:180000, teams:9, deadline:"7月26日",
     desc:"50 种工件 × 6 种料箱，仿真训练后零样本迁移到真机，记录 sim2real 差距与节拍", status:"报名中"},
  ],
  agents: [
    {id:"agt-1001", name:"Aurora-RC v3.2", owner:"我", base:"Claude Opus 4.7 + RAG", scenario:"customer", score:87.4, runs:412, status:"running", winRate:0.62, costPerTask:0.18},
    {id:"agt-1002", name:"FraudHawk", owner:"我", base:"GPT-5 + 自研规则引擎", scenario:"riskctrl", score:91.2, runs:980, status:"idle", winRate:0.71, costPerTask:0.32},
    {id:"agt-1003", name:"ResearchPilot", owner:"我", base:"Qwen3-Max + 内部知识库", scenario:"research", score:78.5, runs:120, status:"sandbox", winRate:0.48, costPerTask:1.10},
  ],
  leaderboard: [
    {rank:1, agent:"OmniSolver-Pro", org:"清华 RWAI", score:94.6, delta:"+1.2", winRate:0.78, p95:"2.4s"},
    {rank:2, agent:"FraudHawk", org:"我", score:91.2, delta:"+0.4", winRate:0.71, p95:"1.9s"},
    {rank:3, agent:"DeepSentry", org:"DeepSeek Labs", score:90.8, delta:"-0.3", winRate:0.69, p95:"3.1s"},
    {rank:4, agent:"GuardLLM-7B", org:"蚂蚁 AntFin", score:88.5, delta:"+0.8", winRate:0.66, p95:"1.4s"},
    {rank:5, agent:"Aurora-RC v3.2", org:"我", score:87.4, delta:"+2.1", winRate:0.62, p95:"2.7s"},
    {rank:6, agent:"BaseLine-GPT5", org:"Appen", score:84.0, delta:"—", winRate:0.55, p95:"2.2s"},
  ],
  tasks: [ /* hard cases marketplace */
    {id:"hc-9001", title:"跨币种退款 + 越权签证申请的复合工单", scenario:"customer", reward:380, status:"已上架", submittedBy:"李航", solved:0.21, difficulty:"S"},
    {id:"hc-9002", title:"团伙欺诈：13 个关联账号 6 小时内套现", scenario:"riskctrl", reward:560, status:"审核中", submittedBy:"王澈", solved:0.08, difficulty:"S+"},
    {id:"hc-9003", title:"年报附注里的或有负债识别", scenario:"research", reward:240, status:"已上架", submittedBy:"赵子涵", solved:0.34, difficulty:"A"},
    {id:"hc-9004", title:"长尾肺结节：磨玻璃 < 4mm", scenario:"medical", reward:680, status:"已上架", submittedBy:"周医生", solved:0.12, difficulty:"S+"},
    {id:"hc-9005", title:"跨仓库循环依赖修复（npm + pip 混合）", scenario:"code", reward:420, status:"已上架", submittedBy:"Linus C.", solved:0.18, difficulty:"S"},
    {id:"hc-9006", title:"K8s OOMKilled 真因不在被杀容器", scenario:"ops", reward:300, status:"已上架", submittedBy:"运维老吴", solved:0.27, difficulty:"A"},
  ],
  datasets: [
    {id:"ds-1", name:"航旅客服难例集 v4", scenario:"customer", size:"24,500 条", price:"¥68,000", license:"商用", growth:"+12%", coverage:["越权","退款","联运","签证"]},
    {id:"ds-2", name:"反欺诈交易精标 (大陆/港澳)", scenario:"riskctrl", size:"180,000 条", price:"¥220,000", license:"商用", growth:"+8%", coverage:["团伙","套现","伪冒"]},
    {id:"ds-3", name:"中文研报 + 估值模型对", scenario:"research", size:"6,400 对", price:"¥120,000", license:"商用", growth:"+25%", coverage:["A股","港股","美股"]},
    {id:"ds-4", name:"胸片长尾病灶标注", scenario:"medical", size:"34,800 张", price:"¥350,000", license:"医疗合规", growth:"+5%", coverage:["10 类长尾"]},
    {id:"ds-5", name:"SWE-Bench-Pro 中文版", scenario:"code", size:"3,200 例", price:"¥98,000", license:"商用", growth:"+30%", coverage:["前端","后端","算法"]},
  ],
  events: [
    {d:"05", m:"JUN", t:"航旅客服 PK 复赛", s:"今天 14:00 直播"},
    {d:"08", m:"JUN", t:"反欺诈 v3 决赛", s:"奖金池升至 ¥120k"},
    {d:"12", m:"JUN", t:"Appen × 清华 RWAI 联合发布", s:"线上闭门会"},
    {d:"18", m:"JUN", t:"专家任务集众包活动", s:"提交难例最高 ¥800/条"},
  ],
  messages: [
    {who:"Roger Korsgaard", w:"评测报告已生成", t:"2 分钟前", a:"RK"},
    {who:"Terry Torff", w:"邀请你加入「医疗影像」赛季", t:"12 分钟前", a:"TT"},
    {who:"Angel Bergson", w:"FraudHawk 已晋级复赛", t:"1 小时前", a:"AB"},
    {who:"Emerson Gouse", w:"难例审核已通过 ¥380", t:"3 小时前", a:"EG"},
    {who:"Corey Baptista", w:"分享了《RWAI 评测白皮书》", t:"昨天", a:"CB"},
    {who:"Zain Culhane", w:"@你 检查 Aurora-RC 沙盒日志", t:"昨天", a:"ZC"},
    {who:"Randy Lipshutz", w:"接力一个 K8s 难例", t:"2 天前", a:"RL"},
    {who:"Craig Botosh", w:"奖金 ¥1,240 已入账", t:"3 天前", a:"CB"},
  ],
  recommended: [
    {scenario:"customer", best:"OmniSolver-Pro", price:"¥18/千次", score:94.6, badge:"SOTA"},
    {scenario:"riskctrl", best:"FraudHawk", price:"¥32/千次", score:91.2, badge:"高性价比"},
    {scenario:"code", best:"OmniSolver-Pro", price:"¥48/千次", score:89.0, badge:"SOTA"},
    {scenario:"medical", best:"MedVision-X", price:"按例计费 ¥3.2", score:92.7, badge:"医疗合规"},
  ],

  // ---- Agent Studio: tools / skills / MCP marketplace ----
  tools: [
    {id:"tl-web",   name:"Web Browser", icon:"research", cat:"信息检索", desc:"无头浏览器 + 反爬代理，支持 DOM/视觉两种 grounding。", installs:"12.4k", price:"按次 ¥0.002", verified:true},
    {id:"tl-py",    name:"Python Sandbox", icon:"code", cat:"执行", desc:"隔离 CPU/GPU 沙盒，预装 numpy/pandas/torch。", installs:"34.1k", price:"按算力", verified:true},
    {id:"tl-sql",   name:"SQL Runner",   icon:"datasets", cat:"数据", desc:"只读连接客户数仓，自动权限映射 + 审计。", installs:"8.7k",  price:"包月 ¥1,200", verified:true},
    {id:"tl-vec",   name:"Vector RAG",   icon:"skills", cat:"检索增强", desc:"多向量库聚合，支持混合检索 + rerank。", installs:"21.2k", price:"按 token", verified:true},
    {id:"tl-pdf",   name:"PDF Reader",   icon:"tasks", cat:"文档", desc:"高保真表格/公式抽取，输出结构化 JSON。", installs:"15.0k", price:"按页 ¥0.01", verified:true},
    {id:"tl-img",   name:"Vision Tools", icon:"report", cat:"多模态", desc:"OCR、目标检测、图表解析、医学影像分割。", installs:"9.6k",  price:"按调用", verified:true},
    {id:"tl-sim",   name:"Habitat 3.0",  icon:"embodied", cat:"具身仿真", desc:"家庭长程任务仿真，支持双人协作。", installs:"1.2k",  price:"按 GPU 小时", verified:true},
    {id:"tl-isaac", name:"Isaac Sim",    icon:"embodied", cat:"具身仿真", desc:"NVIDIA 高保真物理仿真 + 多臂操作。", installs:"980",   price:"按 GPU 小时", verified:true},
    {id:"tl-mani",  name:"ManiSkill3",   icon:"embodied", cat:"具身仿真", desc:"操作技能基准，提供 30+ 评测任务。", installs:"760",   price:"按 GPU 小时", verified:true},
    {id:"tl-pay",   name:"Stripe Pay",   icon:"marketplace", cat:"业务", desc:"沙盒支付链路，含退款/对账/争议。", installs:"3.4k",  price:"按交易", verified:false},
  ],
  skills: [
    {id:"sk-refund",   name:"航旅退改签处置", scenario:"customer", desc:"覆盖 12 类常见+ 5 类越权退改签策略，含跨币种、签证联运。", uses:"2.1k", author:"Appen 工单 SOP 组", rating:4.8},
    {id:"sk-aml",      name:"反洗钱团伙识别", scenario:"riskctrl", desc:"图谱扩散 + 时序滚动 + 行为基线，误杀 < 0.3%。", uses:"1.4k", author:"AntFin 风控开放团队", rating:4.7},
    {id:"sk-10k",      name:"年报研读 SOP",    scenario:"research", desc:"按章节 chunk + 估值表抽取 + 风险因子归类。", uses:"980",  author:"清华 RWAI", rating:4.6},
    {id:"sk-swe",      name:"SWE-Bench 修复链", scenario:"code",   desc:"克隆→定位→最小修复→单测→回归。", uses:"3.2k", author:"OpenDevOps", rating:4.9},
    {id:"sk-grasp",    name:"双臂抓取-放置",   scenario:"embodied", desc:"含视觉伺服 + 力控阈值 + 失败重试。", uses:"410",  author:"上海 AI Lab", rating:4.6},
    {id:"sk-nav",      name:"长程导航 & 物体检索", scenario:"embodied", desc:"语义地图 + LLM 任务规划 + 失败自恢复。", uses:"380",  author:"清华 RWAI", rating:4.5},
  ],
  mcps: [
    {id:"mcp-fs",    name:"Filesystem MCP", vendor:"官方", desc:"文件读写、变更监听，沙盒内默认开启。", risk:"低",  verified:true},
    {id:"mcp-gh",    name:"GitHub MCP",     vendor:"GitHub", desc:"读取仓库、issue、PR、Action 日志。", risk:"中",  verified:true},
    {id:"mcp-jira",  name:"Jira MCP",       vendor:"Atlassian", desc:"工单读写、流转、SLA。", risk:"中", verified:true},
    {id:"mcp-snow",  name:"ServiceNow MCP", vendor:"ServiceNow", desc:"ITSM 工单 + 资产 + 变更管理。", risk:"中", verified:true},
    {id:"mcp-ehr",   name:"医疗 EHR MCP",   vendor:"Appen × 合规医联", desc:"脱敏后病历访问，受 HIPAA/合规审计。", risk:"高", verified:true},
    {id:"mcp-ros2",  name:"ROS2 Bridge MCP", vendor:"Open Robotics", desc:"将 ROS2 话题/服务暴露给 Agent。", risk:"高", verified:true},
    {id:"mcp-cdp",   name:"CDP Browser MCP", vendor:"社区", desc:"Chrome DevTools Protocol，全功能浏览器控制。", risk:"中", verified:false},
  ],

  // ---- Embodied AI sim arena ----
  simEnvs: [
    {id:"sim-hab",   name:"Habitat 3.0",  vendor:"Meta FAIR", domain:"家庭/室内", tasks:120, agents:84,
      sensors:["RGB-D","深度","触觉","本体感"], physics:"刚体 + 软体", real2sim:"中"},
    {id:"sim-isaac", name:"Isaac Lab",    vendor:"NVIDIA",     domain:"工业/操作", tasks:96,  agents:62,
      sensors:["RGB-D","6D 力","点云"], physics:"PhysX 高保真", real2sim:"高"},
    {id:"sim-mani",  name:"ManiSkill3",   vendor:"UCSD",       domain:"操作技能", tasks:78,  agents:41,
      sensors:["RGB-D","本体感"], physics:"SAPIEN", real2sim:"中"},
    {id:"sim-carla", name:"CARLA 0.10",   vendor:"CVC",        domain:"自动驾驶", tasks:54,  agents:38,
      sensors:["RGB","LiDAR","Radar","GNSS"], physics:"车辆动力学", real2sim:"高"},
    {id:"sim-drone", name:"AirSim-Pro",   vendor:"Appen × 微软", domain:"无人机", tasks:30,  agents:22,
      sensors:["RGB","深度","IMU","GPS"], physics:"飞行动力学", real2sim:"中"},
  ],
  simTasks: [
    {id:"st-1", env:"sim-hab",   title:"长程家务：找眼镜→送到主卧床头", horizon:"≤ 8min", steps:"~120 actions", success:0.32, kpis:["成功率","碰撞次数","路径效率","能耗"]},
    {id:"st-2", env:"sim-hab",   title:"双人协作：陪同老人取药并提醒服用", horizon:"≤ 12min", steps:"~180 actions", success:0.21, kpis:["成功率","人机交接","安全事件"]},
    {id:"st-3", env:"sim-isaac", title:"双臂柔性装配：USB-C 插接 + 螺丝紧固", horizon:"≤ 90s", steps:"~40 actions", success:0.46, kpis:["成功率","装配力","循环节拍"]},
    {id:"st-4", env:"sim-mani",  title:"工件分拣：50 SKU 混合料箱", horizon:"≤ 60s", steps:"~25 actions", success:0.58, kpis:["成功率","抓取力","错放率"]},
    {id:"st-5", env:"sim-carla", title:"无保护左转 + 雨夜 + 校车交互", horizon:"≤ 3min", steps:"连续控制", success:0.49, kpis:["完成率","违规","碰撞 TTC"]},
    {id:"st-6", env:"sim-drone", title:"电力巡检：5km 长走廊 + 阵风 12m/s", horizon:"≤ 15min", steps:"连续控制", success:0.36, kpis:["覆盖率","姿态稳定","返航余量"]},
  ],
};

// agent problem report
const REPORT = {
  agent:"Aurora-RC v3.2",
  overall:{score:74.2, vs:"-12.4 vs SOTA"},
  radar:[
    {k:"指令遵循", v:82, sota:91},
    {k:"长上下文", v:65, sota:88},
    {k:"工具调用", v:71, sota:90},
    {k:"事实正确", v:69, sota:92},
    {k:"边界 / 拒答", v:58, sota:86},
    {k:"成本控制", v:88, sota:80},
  ],
  failures:[
    {type:"幻觉 / 虚构事实", rate:0.21, examples:32, fix:"补充 RAG + 一致性自校验"},
    {type:"越权 / 安全策略未触发", rate:0.14, examples:18, fix:"采购 Appen 「合规越权样本集」"},
    {type:"多轮上下文丢失", rate:0.18, examples:24, fix:"长上下文蒸馏 + 摘要压缩"},
    {type:"金额 / 单位错误", rate:0.09, examples:11, fix:"工具调用强约束 + 单位标准化"},
    {type:"工具误用 (call wrong API)", rate:0.12, examples:15, fix:"采购 「工具调用决策对齐集」"},
  ],
  recommend:["ds-1","ds-2"]
};

// ---------- Utilities ----------
const $ = (sel,el=document)=>el.querySelector(sel);
const $$ = (sel,el=document)=>Array.from(el.querySelectorAll(sel));
const el = (tag, attrs={}, ...kids)=>{
  const n = document.createElement(tag);
  for(const k in attrs){
    if(k==="class") n.className = attrs[k];
    else if(k==="html") n.innerHTML = attrs[k];
    else if(k.startsWith("on")) n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  for(const k of kids.flat()){
    if(k==null) continue;
    n.appendChild(k instanceof Node?k:document.createTextNode(String(k)));
  }
  return n;
};
const ICON_PATHS = {
  dashboard:`<path d="M4.5 11.5 12 5l7.5 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M10 19v-5h4v5"/>`,
  arenas:`<path d="M8 5h8v4.5a4 4 0 0 1-8 0V5Z"/><path d="M8 7H5.5a2.5 2.5 0 0 0 2.5 4"/><path d="M16 7h2.5a2.5 2.5 0 0 1-2.5 4"/><path d="M12 13.5V17"/><path d="M9 19h6"/>`,
  embodied:`<path d="M6 18h11"/><path d="M8 18v-4.5l4-3.5 3 3"/><circle cx="8" cy="13.5" r="1.7"/><circle cx="12" cy="10" r="1.7"/><circle cx="15" cy="13" r="1.7"/><path d="M16.5 12 19 9.5"/><path d="M18 8.5h2v2"/>`,
  agents:`<rect x="6" y="7" width="12" height="10" rx="3"/><path d="M12 7V4.5"/><circle cx="9.5" cy="12" r=".8"/><circle cx="14.5" cy="12" r=".8"/><path d="M10 15h4"/>`,
  studio:`<path d="m5 19 9.5-9.5"/><path d="m12.5 7.5 4 4"/><path d="M17 4.5v3"/><path d="M18.5 6h-3"/><path d="M7 5.5v2"/><path d="M8 6.5H6"/>`,
  tasks:`<path d="M8 5h8v14H6.5A1.5 1.5 0 0 1 5 17.5v-11A1.5 1.5 0 0 1 6.5 5H8Z"/><path d="M8 5v4h8"/><path d="M8.5 13h7"/><path d="M8.5 16h5"/>`,
  pk:`<path d="m5 19 5.5-5.5"/><path d="m13.5 10.5 4-4L19 5l-1.5 5-4 4"/><path d="m19 19-5.5-5.5"/><path d="M10.5 10.5 6.5 6.5 5 5l1.5 5 4 4"/>`,
  report:`<path d="M5 19V5"/><path d="M5 19h14"/><path d="m8 15 3-3 2 2 4-6"/><path d="M16 8h2v2"/>`,
  tools:`<path d="M14.5 5.5a4 4 0 0 0 4 5L11 18a2.2 2.2 0 1 1-3-3l7.5-7.5a4 4 0 0 0-1-2Z"/>`,
  skills:`<path d="m12 5 7 4-7 4-7-4 7-4Z"/><path d="m5 13 7 4 7-4"/><path d="m5 17 7 4 7-4"/>`,
  mcp:`<circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="7" r="2.2"/><circle cx="12" cy="17" r="2.2"/><path d="M8.7 8.4 11 15"/><path d="M15.3 8.4 13 15"/><path d="M9.2 7h5.6"/>`,
  datasets:`<ellipse cx="12" cy="6" rx="6" ry="2.5"/><path d="M6 6v8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6"/><path d="M6 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5"/>`,
  marketplace:`<path d="M7 9h10l-1 10H8L7 9Z"/><path d="M9 9a3 3 0 0 1 6 0"/><path d="M8 12h8"/>`,
  org:`<path d="M4.5 19V8h6v11"/><path d="M13.5 19V5h6v14"/><path d="M7 11h1"/><path d="M7 14h1"/><path d="M16 8h1"/><path d="M16 11h1"/><path d="M3 19h18"/>`,
  profile:`<circle cx="12" cy="8" r="3"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/>`,
  customer:`<path d="M5.5 7.5A5.5 5.5 0 0 1 11 5h2a5.5 5.5 0 0 1 2.8 10.2L18 19l-4.8-2H11a5.5 5.5 0 0 1-5.5-5.5v-4Z"/><path d="M9 10h6"/><path d="M9 13h3.5"/>`,
  riskctrl:`<path d="M12 4.5 18 7v4.5c0 3.4-2.1 6.1-6 8-3.9-1.9-6-4.6-6-8V7l6-2.5Z"/><path d="m9 12 2 2 4-4"/>`,
  research:`<path d="M5 18h14"/><path d="M7 15v-4"/><path d="M12 15V7"/><path d="M17 15v-6"/><path d="M6 6h12"/>`,
  medical:`<path d="M8 5v5a4 4 0 0 0 8 0V5"/><path d="M8 5H6.5"/><path d="M16 5h1.5"/><path d="M12 14v1.5a3.5 3.5 0 0 0 7 0V14"/><circle cx="19" cy="14" r="1.4"/>`,
  code:`<path d="m9 9-3 3 3 3"/><path d="m15 9 3 3-3 3"/><path d="m13 7-2 10"/>`,
  ops:`<circle cx="12" cy="12" r="3"/><path d="M12 4v2"/><path d="M12 18v2"/><path d="M4 12h2"/><path d="M18 12h2"/><path d="m6.3 6.3 1.4 1.4"/><path d="m16.3 16.3 1.4 1.4"/><path d="m17.7 6.3-1.4 1.4"/><path d="m7.7 16.3-1.4 1.4"/>`,
  marketing:`<path d="M5 13h3l8-5v10l-8-5H5Z"/><path d="M8 13v4"/><path d="M18 10.5c1 .6 1.5 1.5 1.5 2.5s-.5 1.9-1.5 2.5"/>`,
  legal:`<path d="M12 5v14"/><path d="M6 8h12"/><path d="M8 8l-3 6h6L8 8Z"/><path d="M16 8l-3 6h6l-3-6Z"/><path d="M9 19h6"/>`,
  search:`<circle cx="11" cy="11" r="5.5"/><path d="m16 16 3.5 3.5"/>`,
  bell:`<path d="M6.5 17h11"/><path d="M8 17v-6a4 4 0 0 1 8 0v6"/><path d="M10 19a2 2 0 0 0 4 0"/>`,
  bookmark:`<path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V20l-5-3.2L7 20V5.5Z"/>`,
  image:`<rect x="5" y="6" width="14" height="12" rx="2"/><circle cx="9" cy="10" r="1.4"/><path d="m7 16 3.2-3.2 2.3 2.3 1.8-1.8L17 16"/>`,
  upload:`<path d="M12 16V6"/><path d="m8.5 9.5 3.5-3.5 3.5 3.5"/><path d="M5.5 17.5v1A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5v-1"/>`,
  live:`<circle cx="12" cy="12" r="3"/><path d="M7 8a7 7 0 0 0 0 8"/><path d="M17 8a7 7 0 0 1 0 8"/><path d="M4.5 5.5a11 11 0 0 0 0 13"/><path d="M19.5 5.5a11 11 0 0 1 0 13"/>`,
  docker:`<path d="M5 13h14v2.5A3.5 3.5 0 0 1 15.5 19h-5A5.5 5.5 0 0 1 5 13Z"/><path d="M8 13V9h4v4"/><path d="M12 13V7h4v6"/><path d="M16 13V10h3"/>`,
  fallback:`<path d="M12 5 19 19H5L12 5Z"/>`
};
const Icon = (name, cls="ui-icon")=>{
  const wrap = el("span",{class:cls,"aria-hidden":"true"});
  wrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ICON_PATHS.fallback}</svg>`;
  return wrap;
};
const itemIconKey = (item, kind)=>({
  "tl-web":"research", "tl-py":"code", "tl-sql":"datasets", "tl-vec":"skills", "tl-pdf":"tasks",
  "tl-img":"report", "tl-sim":"embodied", "tl-isaac":"embodied", "tl-mani":"embodied", "tl-pay":"marketplace"
}[item.id] || item.scenario || (kind==="mcp"?"mcp":kind==="skill"?"skills":"tools"));
const toast = (m)=>{
  let t = $("#toast");
  if(!t){ t = el("div",{id:"toast",class:"toast"}); document.body.appendChild(t); }
  t.textContent = m; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"),1800);
};
const openModal = (titleHTML, bodyNode, footerNode)=>{
  let mask = $("#modal-mask");
  if(!mask){ mask = el("div",{id:"modal-mask",class:"modal-mask"}); document.body.appendChild(mask); }
  mask.innerHTML = "";
  const modal = el("div",{class:"modal"});
  modal.appendChild(el("div",{class:"flex ai-center ji-between mb-12"},
    el("h3",{html:titleHTML}),
    el("button",{class:"icon-btn",onclick:()=>mask.classList.remove("show")},"✕")
  ));
  modal.appendChild(bodyNode);
  if(footerNode){ modal.appendChild(el("div",{class:"flex gap-8 ji-end mt-18"}, footerNode)); }
  mask.appendChild(modal);
  mask.classList.add("show");
  mask.onclick = (e)=>{ if(e.target===mask) mask.classList.remove("show"); };
};

const fmtMoney = (n)=>"¥"+n.toLocaleString();
const scenarioMeta = (id)=>DB.scenarios.find(s=>s.id===id) || {name:id,icon:"fallback",color:"g1"};
const avatarSeed = (seed)=>{
  const palette=[["#c4b5fd","#8b7cf6"],["#f8c8dc","#d982b5"],["#ddeaff","#6ea7f7"],["#f7dce3","#ee8aa8"],["#f5d79a","#dba653"],["#d9d2ff","#7c5cff"]];
  let s=0; for(const c of seed) s+=c.charCodeAt(0);
  const p = palette[s%palette.length];
  return `linear-gradient(135deg,${p[0]},${p[1]})`;
};
const Avatar = (label, cls="avatar")=>{
  const a = el("span",{class:cls},label.slice(0,2));
  a.style.background = avatarSeed(label);
  return a;
};

const STATE = {cart:0, deployed:false, loadingTimer:null};
const flashRouteLoader = ()=>{
  if(!document.body.classList.contains("app-ready")) return;
  document.body.classList.add("route-loading");
  clearTimeout(STATE.loadingTimer);
  STATE.loadingTimer = setTimeout(()=>document.body.classList.remove("route-loading"),460);
};
const closeModal = ()=>$("#modal-mask")?.classList.remove("show");
const setActiveSibling = (node)=>{
  const parent = node?.parentElement;
  if(!parent) return;
  $$(".pill,.radio-card,.t", parent).forEach(x=>x.classList.remove("active","sel"));
  node.classList.add(node.classList.contains("radio-card")?"sel":"active");
};
const infoModal = (title, content, actions=[])=>{
  const body = el("div",{});
  content.flat().forEach(item=>{
    if(item==null) return;
    if(item instanceof Node) body.appendChild(item);
    else body.appendChild(el("p",{class:"muted"},String(item)));
  });
  openModal(title, body, actions.length?actions:[el("button",{class:"btn primary",onclick:closeModal},"我知道了")]);
};
const protocolSummary = ()=>el("div",{},
  el("p",{class:"muted"},"本评测协议是平台用户可见的参赛规则摘要，不包含内部产品设计文档。"),
  el("ul",{},
    el("li",{},"同一难例集、同一沙盒规格、同一评审版本下执行。"),
    el("li",{},"评分 = 0.55×正确性 + 0.20×安全合规 + 0.15×工具调用 + 0.10×成本效率。"),
    el("li",{},"系统保留推理日志用于赛后复盘，私评模式下不公开排名。"),
    el("li",{},"客户可对抽检样本提出复议，平台在 2 个工作日内完成复核。")
  )
);
const openProtocolModal = ()=>infoModal("评测协议摘要", [protocolSummary()], [
  el("button",{class:"btn",onclick:closeModal},"关闭"),
  el("button",{class:"btn primary",onclick:()=>toast("协议摘要已加入下载队列")},"下载摘要")
]);
const openSandboxSpecModal = ()=>infoModal("沙盒环境规范", [
  "默认隔离命名空间，禁止跨账号网络访问；所有外网请求通过平台代理审计。",
  "单任务默认限制：CPU 4c、RAM 8G、Wall time 120s、输出 8k tokens。",
  "允许的 MCP 工具由 Arena 规则定义，超出白名单的调用会被拒绝并记录。"
]);
const openMessageModal = (m)=>infoModal("消息详情", [
  el("div",{class:"list-row",style:"border-bottom:none"}, Avatar(m.a), el("div",{},el("div",{class:"name"},m.who),el("div",{class:"sub"},m.t))),
  m.w,
  "你可以在对应页面继续处理这条消息，Demo 中已连接到相关工作流。"
], [
  el("button",{class:"btn",onclick:closeModal},"稍后处理"),
  el("button",{class:"btn primary",onclick:()=>{closeModal();nav(m.w.includes("报告")?"/report":m.w.includes("难例")?"/tasks":"/arenas");}},"去处理")
]);
const openEventModal = (e)=>infoModal(e.t, [
  `${e.d} ${e.m} · ${e.s}`,
  "可加入日程提醒，或直接进入相关竞技场查看报名与直播信息。"
], [
  el("button",{class:"btn",onclick:()=>toast("已加入日程提醒")},"加入日程"),
  el("button",{class:"btn primary",onclick:()=>{closeModal();nav("/arenas");}},"查看竞技场")
]);
const openScheduleModal = ()=>infoModal("全部近期赛事", [el("div",{},...DB.events.map(e=>el("div",{class:"event",onclick:()=>openEventModal(e),style:"cursor:pointer"},
  el("div",{class:"when"},el("b",{},e.d),el("span",{},e.m)),
  el("div",{class:"what"},el("b",{},e.t),el("span",{},e.s))
)))], [el("button",{class:"btn primary",onclick:closeModal},"关闭")]);
const openSandboxLogs = (agentName="Aurora-RC v3.2")=>infoModal("沙盒日志 · "+agentName, [el("pre",{style:"background:#0F172A;color:#E2E8F0;padding:12px;border-radius:10px;overflow:auto"},
`[10:31:02] sandbox ns-7842a started
[10:31:04] health check GET /health 200
[10:31:08] smoke case HC-9001 passed
[10:31:11] policy proxy: 0 denied, 4 allowed
[10:31:15] trace persisted to arena-run-7cc9`)], [el("button",{class:"btn primary",onclick:closeModal},"关闭")]);
const addToCart = (item)=>{ STATE.cart += 1; toast(`${item} 已加入采购车（${STATE.cart}）`); };

// ---------- Sidebar / Topbar / Right rail ----------
function Sidebar(active){
  const items = [
    {sec:"主导航"},
    {k:"dashboard", icon:"dashboard", label:"总览 Feed"},
    {k:"arenas",    icon:"arenas", label:"竞技场"},
    {k:"embodied",  icon:"embodied", label:"具身仿真场", badge:"NEW"},
    {k:"agents",    icon:"agents", label:"我的 Agents"},
    {k:"studio",    icon:"studio", label:"Agent Studio", badge:"NEW"},
    {k:"tasks",     icon:"tasks", label:"难例任务", badge:"4"},
    {sec:"评估"},
    {k:"pk",        icon:"pk", label:"PK 回放"},
    {k:"report",    icon:"report", label:"问题分析"},
    {sec:"生态"},
    {k:"tools",     icon:"tools", label:"工具市场"},
    {k:"skills",    icon:"skills", label:"技能市场"},
    {k:"mcp",       icon:"mcp", label:"MCP 接入"},
    {sec:"商业"},
    {k:"datasets",  icon:"datasets", label:"训练数据"},
    {k:"marketplace",icon:"marketplace", label:"方案市场", badge:"7"},
    {k:"org",       icon:"org", label:"组织 & 团队"},
    {k:"profile",   icon:"profile", label:"我的账户"},
  ];
  const sb = el("aside",{class:"sidebar"});
  sb.appendChild(el("div",{class:"logo"},
    el("div",{class:"logo-mark elite-logo"}, el("span",{class:"logo-e"},"E"), el("span",{class:"logo-ai"},"AI")),
    el("div",{class:"logo-text"},"Elite AI", el("small",{},"Arena Platform"))
  ));
  const pc = el("div",{class:"profile-card"});
  pc.appendChild(Avatar(DB.user.avatar,"avatar lg"));
  pc.appendChild(el("div",{class:"flex col"},
    el("div",{class:"name"},DB.user.name),
    el("div",{class:"meta"},DB.user.handle)
  ));
  sb.appendChild(pc);
  const stats = el("div",{class:"stats"});
  [["2.3k","战队"],["235","参赛"],["80","难例"]].forEach(([v,l])=>stats.appendChild(
    el("div",{class:"stat"}, el("b",{},v), el("span",{},l))
  ));
  pc.appendChild(stats);

  const nav = el("nav",{class:"nav"});
  items.forEach(it=>{
    if(it.sec){ nav.appendChild(el("div",{class:"nav-section"},it.sec)); return; }
    const a = el("a",{href:`#/${it.k}`, class: active===it.k?"active":""},
      el("span",{class:"icon"},Icon(it.icon,"nav-svg")),
      el("span",{},it.label),
      it.badge?el("span",{class:"badge"},it.badge):null
    );
    nav.appendChild(a);
  });
  sb.appendChild(nav);
  sb.appendChild(el("div",{class:"side-foot"},
    el("div",{html:"隐私政策 · 服务条款 · Cookies"}),
    el("div",{class:"mt-4"},"Elite AI Arena Platform © 2026")
  ));
  return sb;
}

function Topbar(){
  const tb = el("div",{class:"topbar"});
  tb.appendChild(el("div",{class:"search"},
    Icon("search","action-svg"),
    el("input",{placeholder:"搜索竞技场、Agent、难例任务、数据集…",onkeydown:(e)=>{
      if(e.key!=="Enter" || !e.target.value.trim()) return;
      const q = e.target.value.trim();
      infoModal("搜索结果", [
        `已为「${q}」匹配到 3 类结果：竞技场、难例任务、训练数据。`,
        el("div",{class:"grid grid-3"},
          el("button",{class:"btn primary",onclick:()=>{closeModal();nav("/arenas");}},"看竞技场"),
          el("button",{class:"btn",onclick:()=>{closeModal();nav("/tasks");}},"看难例"),
          el("button",{class:"btn",onclick:()=>{closeModal();nav("/datasets");}},"看数据集")
        )
      ]);
    }})
  ));
  const a = el("div",{class:"topbar-actions"});
  // org switcher
  const curOrg = DB.orgs.find(o=>o.id===DB.user.currentOrg) || DB.orgs[0];
  const orgChip = el("button",{class:"org-chip",title:"切换组织",onclick:()=>openOrgSwitcher()},
    el("span",{class:"org-mark"},curOrg.short),
    el("span",{class:"col",style:"text-align:left;line-height:1.15"},
      el("b",{},curOrg.name),
      el("small",{class:"muted"},curOrg.plan+" · "+curOrg.role)
    ),
    el("span",{class:"caret"},"▾")
  );
  a.appendChild(orgChip);
  a.appendChild(el("button",{class:"icon-btn",title:"通知",onclick:()=>toast("3 条新通知")},Icon("bell","action-svg")));
  a.appendChild(el("button",{class:"icon-btn",title:"收藏",onclick:()=>toast("已收藏")},Icon("bookmark","action-svg")));
  const chip = el("div",{class:"user-chip",style:"cursor:pointer",onclick:()=>infoModal("账户快捷菜单",[
    el("div",{class:"grid grid-2"},
      el("button",{class:"btn primary",onclick:()=>{closeModal();nav("/profile");}},"我的账户"),
      el("button",{class:"btn",onclick:()=>{closeModal();nav("/agents");}},"管理 Agents"),
      el("button",{class:"btn",onclick:()=>{closeModal();nav("/tasks");}},"我的难例"),
      el("button",{class:"btn",onclick:()=>toast("已切换为私评模式")},"私评模式")
    )
  ])});
  chip.appendChild(Avatar(DB.user.avatar));
  chip.appendChild(el("span",{},DB.user.name));
  chip.appendChild(el("span",{class:"caret"},"▾"));
  a.appendChild(chip);
  tb.appendChild(a);
  return tb;
}

function RightRail(){
  const rail = el("aside",{class:"right-rail"});

  // messages
  const msg = el("div",{class:"rail-card"});
  msg.appendChild(el("div",{class:"flex ai-center ji-between"},
    el("h3",{style:"margin:0;font-size:15px"},"消息中心"),
    el("button",{class:"icon-btn",title:"新建",onclick:()=>infoModal("新建站内消息",[
      el("div",{class:"field"},el("label",{},"收件人"),el("input",{type:"text",value:"Appen Arena 运营"})),
      el("div",{class:"field"},el("label",{},"内容"),el("textarea",{placeholder:"输入消息内容…"}))
    ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("消息已发送")}},"发送")])},"✎")
  ));
  msg.appendChild(el("div",{class:"search mt-8"},
    Icon("search","action-svg"), el("input",{placeholder:"搜索消息"})));
  const tabs = el("div",{class:"tabs"});
  ["主页","通用",["请求", "4"]].forEach((x,i)=>{
    const isArr = Array.isArray(x);
    const t = el("div",{class:"t"+(i===0?" active":""),onclick:(e)=>{setActiveSibling(e.currentTarget);toast(`已切换到${isArr?x[0]:x}消息`);}}, isArr?x[0]:x);
    if(isArr) t.appendChild(el("span",{class:"num"},`(${x[1]})`));
    tabs.appendChild(t);
  });
  msg.appendChild(tabs);
  DB.messages.forEach(m=>{
    const row = el("div",{class:"list-row",style:"cursor:pointer",onclick:()=>openMessageModal(m)});
    row.appendChild(Avatar(m.a));
    row.appendChild(el("div",{},
      el("div",{class:"name"},m.who),
      el("div",{class:"sub"},m.w)
    ));
    row.appendChild(el("div",{class:"right"},m.t));
    msg.appendChild(row);
  });
  msg.appendChild(el("div",{class:"text-center mt-8"},
    el("a",{href:"#/inbox",style:"color:var(--brand);font-weight:600;font-size:12.5px"},"查看全部 →")));
  rail.appendChild(msg);

  // events
  const ev = el("div",{class:"rail-card"});
  ev.appendChild(el("div",{class:"flex ai-center ji-between mb-8"},
    el("h3",{style:"margin:0;font-size:15px"},"近期赛事"),
    el("button",{class:"icon-btn",onclick:openScheduleModal},"⋯")
  ));
  DB.events.forEach(e=>{
    ev.appendChild(el("div",{class:"event",style:"cursor:pointer",onclick:()=>openEventModal(e)},
      el("div",{class:"when"},el("b",{},e.d),el("span",{},e.m)),
      el("div",{class:"what"},el("b",{},e.t),el("span",{},e.s))
    ));
  });
  rail.appendChild(ev);
  return rail;
}

// ---------- Views ----------
function ViewDashboard(){
  const root = el("div",{class:"flex col gap-18"});

  // Stories — 热门竞技场
  const stories = el("div",{class:"card"});
  stories.appendChild(el("div",{class:"stories"},
    DB.arenas.slice(0,8).map(a=>{
      const meta = scenarioMeta(a.scenario);
      const s = el("div",{class:"story",onclick:()=>nav(`/arena/${a.id}`)});
      const ring = el("div",{class:"ring"});
      ring.appendChild(el("span",{class:"story-icon"},Icon(meta.id || a.scenario,"story-svg"))); s.appendChild(ring);
      s.appendChild(el("div",{class:"name"},a.title.length>6?a.title.slice(0,6)+"…":a.title));
      return s;
    })
  ));
  root.appendChild(stories);

  // Composer
  const composer = el("div",{class:"card"});
  composer.appendChild(el("div",{class:"composer"},
    el("div",{class:"row1"},
      Avatar(DB.user.avatar),
      el("input",{placeholder:"分享一个 Agent 见闻，或发布难例任务…",
        onkeydown:(e)=>{if(e.key==="Enter"&&e.target.value){toast("已发布"); e.target.value="";}}}),
      el("button",{class:"btn primary",onclick:()=>nav("/tasks/new")},"发布难例")
    ),
    el("div",{class:"row2"},
      el("span",{class:"chip",onclick:()=>infoModal("上传截图证据",["Demo 中已模拟附件上传。正式版会进入脱敏与版权校验流程。"], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("截图证据已添加")}},"选择文件")])},Icon("image","chip-svg"),"截图证据"),
      el("span",{class:"chip",onclick:()=>infoModal("上传日志",["支持 .log / .jsonl / trace.zip。上传后会自动抽取 tool-call 与失败片段。"], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("日志已加入待上传列表")}},"选择日志")])},Icon("upload","chip-svg"),"上传日志"),
      el("span",{class:"chip",onclick:()=>nav("/pk")},Icon("live","chip-svg"),"直播 PK"),
      el("span",{class:"chip",onclick:()=>toast("已打开场景标签选择器")},"# 场景标签"),
      el("span",{class:"chip",onclick:()=>toast("已打开专家提及面板")},"@ 提及专家"),
      el("span",{class:"chip",style:"margin-left:auto",onclick:()=>infoModal("可见范围",[el("div",{class:"radio-group"},
        el("div",{class:"radio-card sel",onclick:(e)=>setActiveSibling(e.currentTarget)},el("b",{},"公开"),el("span",{},"所有平台用户可见")),
        el("div",{class:"radio-card",onclick:(e)=>setActiveSibling(e.currentTarget)},el("b",{},"仅团队"),el("span",{},"只对我的组织可见")),
        el("div",{class:"radio-card",onclick:(e)=>setActiveSibling(e.currentTarget)},el("b",{},"私密"),el("span",{},"仅本人可见"))
      )])},"公开 ▾")
    )
  ));
  root.appendChild(composer);

  // KPI strip
  const kpis = el("div",{class:"card"});
  kpis.appendChild(el("div",{class:"grid grid-4"},
    [
      ["进行中竞技场","23","+5","up"],
      ["我的 Agent","3","+1","up"],
      ["本季奖金池","¥780,000","+12.4%","up"],
      ["待审核难例","12","-3","dn"],
    ].map(([l,v,d,dir])=>el("div",{class:"kpi"},
      el("div",{class:"lab"},l),
      el("div",{class:"val"},v),
      el("div",{class:"delta "+dir},dir==="up"?"▲ ":"▼ ",d)
    ))
  ));
  root.appendChild(kpis);

  // Sort row + feed
  const sortRow = el("div",{class:"flex ai-center ji-between"},
    el("div",{class:"flex gap-8 ai-center"},
      el("span",{class:"muted"},"排序："),
      ...["关注中","热门","高奖金","即将截止"].map((label,i)=>el("span",{class:"pill"+(i===0?" active":""),onclick:(e)=>{setActiveSibling(e.currentTarget);toast(`Feed 已按「${label}」刷新`);}},label))
    ),
    el("a",{href:"#/arenas",class:"muted tiny"},"查看全部 →")
  );
  root.appendChild(sortRow);

  // Highlighted arena feed (mimic the reference look)
  const a = DB.arenas[0];
  const featured = el("div",{class:"feed-item"});
  featured.appendChild(el("div",{class:"feed-head"},
    Avatar("CW"),
    el("div",{},
      el("div",{class:"name"},"Cameron Williamson · 出题专家"),
      el("div",{class:"when"},"14 Aug at 4:21 PM · 客服场景")
    ),
    el("button",{class:"icon-btn more",onclick:()=>infoModal("动态操作",[el("div",{class:"grid grid-2"},
      el("button",{class:"btn",onclick:()=>toast("已收藏该赛事动态")},"收藏"),
      el("button",{class:"btn",onclick:()=>toast("已关注出题专家")},"关注专家"),
      el("button",{class:"btn",onclick:()=>toast("已复制分享链接")},"复制链接"),
      el("button",{class:"btn",onclick:()=>toast("已标记稍后看")},"稍后看")
    )])},"⋯")
  ));
  featured.appendChild(el("div",{class:"mb-12"},
    el("h3",{style:"margin:0 0 6px"},a.title),
    el("div",{class:"muted"},a.desc)
  ));
  featured.appendChild(el("div",{class:"media-grid two mb-12"},
    el("div",{class:"media",style:"background:linear-gradient(135deg,#a78bfa,#f0abfc)"}),
    el("div",{class:"media",style:"background:linear-gradient(135deg,#7dd3fc,#a5f3fc)"})
  ));
  featured.appendChild(el("div",{class:"flex ai-center gap-12"},
    el("span",{class:"tag blue"},"奖金 "+fmtMoney(a.bounty)),
    el("span",{class:"tag green"},"42 战队"),
    el("span",{class:"tag amber"},"截止 "+a.deadline),
    el("button",{class:"btn primary sm",style:"margin-left:auto",onclick:()=>nav(`/arena/${a.id}`)},"进入竞技场")
  ));
  featured.appendChild(el("div",{class:"feed-actions"},
    el("span",{onclick:(e)=>{e.currentTarget.textContent="♥ 31 Like";toast("已点赞")}},"♡ 30 Like"),
    el("span",{onclick:()=>infoModal("评论",[el("div",{class:"field"},el("label",{},"写下你的观点"),el("textarea",{placeholder:"例如：这个场景非常适合验证越权防护…"}))], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("评论已发布")}},"发布")])},"评论 12"),
    el("span",{onclick:()=>toast("已复制分享链接")},"↗ 5 Share"),
    el("span",{style:"margin-left:auto",onclick:()=>toast("已收藏到关注列表")},"🔖")
  ));
  root.appendChild(featured);

  // Second feed: secondary arena
  const a2 = DB.arenas[4];
  const f2 = el("div",{class:"feed-item"});
  f2.appendChild(el("div",{class:"feed-head"},
    Avatar("TL"),
    el("div",{},
      el("div",{class:"name"},"Terry Lipschultz · Appen 数据科学家"),
      el("div",{class:"when"},"14 Aug at 4:21 PM · 代码场景")
    ),
    el("button",{class:"icon-btn more",onclick:()=>infoModal("动态操作",["可收藏、分享或直接进入直播 PK。"],[el("button",{class:"btn",onclick:closeModal},"关闭"),el("button",{class:"btn primary",onclick:()=>{closeModal();nav("/pk");}},"进入直播")])},"⋯")
  ));
  f2.appendChild(el("div",{class:"mb-12"},
    el("h3",{style:"margin:0 0 6px"},a2.title),
    el("div",{class:"muted"},a2.desc)
  ));
  f2.appendChild(el("div",{class:"media",
    style:"height:160px;background:linear-gradient(135deg,#fbcfe8,#fde68a,#a5f3fc)"}));
  f2.appendChild(el("div",{class:"flex ai-center gap-12 mt-12"},
    el("span",{class:"tag blue"},"奖金 "+fmtMoney(a2.bounty)),
    el("span",{class:"tag red"},el("span",{class:"dot live"})," 直播对决"),
    el("button",{class:"btn primary sm",style:"margin-left:auto",onclick:()=>nav(`/arena/${a2.id}`)},"围观 PK")
  ));
  root.appendChild(f2);

  return root;
}

function ViewArenas(){
  const root = el("div",{class:"flex col gap-18"});
  const grid = el("div",{class:"grid grid-3"});
  const renderCards = (scenario="all")=>{
    grid.innerHTML = "";
    const covers = ["","g2","g3","g4","g5","g6"];
    DB.arenas.filter(a=>scenario==="all" || a.scenario===scenario).forEach((a,i)=>{
      const meta = scenarioMeta(a.scenario);
      const card = el("div",{class:"arena-card",onclick:()=>nav(`/arena/${a.id}`)});
      const cover = el("div",{class:"arena-cover "+(covers[i%6])});
      cover.appendChild(el("div",{class:"scenario"},Icon(meta.id || a.scenario,"cover-svg"),el("span",{},meta.name)));
      cover.appendChild(el("h4",{},a.title));
      cover.appendChild(el("div",{class:"bounty"},fmtMoney(a.bounty)));
      if(a.live) cover.appendChild(el("div",{style:"position:absolute;top:12px;right:12px"},
        el("span",{class:"tag",style:"background:rgba(255,255,255,.25);color:#fff"},
          el("span",{class:"dot live"})," LIVE")));
      card.appendChild(cover);
      const body = el("div",{class:"arena-body"});
      body.appendChild(el("div",{class:"tiny muted"},a.desc));
      body.appendChild(el("div",{class:"stats-row"},
        el("span",{},`${a.teams} 战队`),
        el("span",{},"⏱ 截止 "+a.deadline),
        el("span",{class:"tag blue"},a.status)
      ));
      card.appendChild(body);
      grid.appendChild(card);
    });
    if(!grid.children.length) grid.appendChild(el("div",{class:"empty-state"},"当前筛选下暂无竞技场"));
  };
  const filterPills = el("div",{class:"flex gap-8 mt-12",style:"flex-wrap:wrap"});
  filterPills.appendChild(el("span",{class:"pill active",onclick:(e)=>{setActiveSibling(e.currentTarget);renderCards("all");}},"全部"));
  DB.scenarios.forEach(s=>filterPills.appendChild(el("span",{class:"pill",onclick:(e)=>{setActiveSibling(e.currentTarget);renderCards(s.id);}},s.name)));
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},
        el("h3",{style:"margin:0"},"全部竞技场"),
        el("div",{class:"muted tiny"},"按真实业务场景组织。 每个 Arena 都是一个 SOTA 评测+悬赏赛。")),
      el("div",{class:"flex gap-8"},
        el("button",{class:"btn",onclick:()=>infoModal("高级筛选",[
          el("div",{class:"field"},el("label",{},"状态"),el("select",{},el("option",{},"全部状态"),el("option",{},"报名中"),el("option",{},"对决中"),el("option",{},"评测中"))),
          el("div",{class:"field"},el("label",{},"奖金下限"),el("input",{type:"number",value:"50000"}))
        ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("筛选条件已应用")}},"应用筛选")])},"筛选 ▾"),
        el("button",{class:"btn primary",onclick:()=>infoModal("申请承办新场景",[
          el("div",{class:"field"},el("label",{},"场景名称"),el("input",{type:"text",placeholder:"例如：保险理赔 Agent 专项赛"})),
          el("div",{class:"field"},el("label",{},"预计难例数量"),el("input",{type:"number",value:"200"})),
          el("div",{class:"field"},el("label",{},"业务说明"),el("textarea",{placeholder:"说明场景价值、样本来源、评测目标…"}))
        ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("承办申请已提交，运营将在 1 个工作日内联系你")}},"提交申请")])},"申请承办新场景"))
    ),
    filterPills
  ));
  renderCards();
  root.appendChild(grid);
  return root;
}

function ViewArena(id){
  const a = DB.arenas.find(x=>x.id===id) || DB.arenas[0];
  const meta = scenarioMeta(a.scenario);
  const root = el("div",{class:"flex col gap-18"});

  // header
  const head = el("div",{class:"card"});
  head.appendChild(el("div",{class:"flex ai-center gap-12"},
    el("div",{class:"scenario-badge"},Icon(meta.id || a.scenario,"badge-svg")),
    el("div",{class:"flex col gap-6",style:"flex:1"},
      el("div",{class:"flex gap-8 ai-center"},
        el("span",{class:"tag blue"},meta.name),
        el("span",{class:"tag amber"},a.status),
        a.live?el("span",{class:"tag red"},el("span",{class:"dot live"})," 直播对决"):null
      ),
      el("h2",{style:"margin:6px 0 0;font-size:22px"},a.title),
      el("div",{class:"muted"},a.desc),
    ),
    el("div",{class:"flex col gap-8",style:"text-align:right"},
      el("div",{},el("b",{style:"font-size:24px;color:var(--brand)"},fmtMoney(a.bounty)),el("span",{class:"muted tiny"}," 奖金池")),
      el("div",{class:"flex gap-8 ji-end"},
        el("button",{class:"btn",onclick:()=>toast("已加入观战提醒，开赛前 10 分钟通知你")},"加入观战"),
        el("button",{class:"btn primary",onclick:()=>openEnrollModal(a)},"报名参赛")
      )
    )
  ));
  root.appendChild(head);

  // KPI strip
  const k = el("div",{class:"card"});
  k.appendChild(el("div",{class:"grid grid-4"},
    [["参赛战队",a.teams+""],["难例数量","240 条"],["平均通过率","31%"],["截止时间",a.deadline]].map(([l,v])=>
      el("div",{class:"kpi"},el("div",{class:"lab"},l),el("div",{class:"val"},v))
    )
  ));
  root.appendChild(k);

  // Two columns: rules + leaderboard
  const two = el("div",{class:"grid grid-2"});

  const rules = el("div",{class:"card"});
  rules.appendChild(el("div",{class:"card-h"},el("h3",{},"赛制与评测协议")));
  rules.appendChild(el("div",{},
    el("p",{},"• 报名后接入 Agent (镜像 / API / 在线 IDE)，平台在沙盒中按相同难例顺序执行。"),
    el("p",{},"• 评分 = 0.55 × 正确性 + 0.20 × 安全合规 + 0.15 × 工具调用质量 + 0.10 × 成本效率"),
    el("p",{},"• 双盲评测：3 名出题专家 + 自动断言 + Cross-LLM 评审 (Qwen/GPT/Claude)"),
    el("p",{},"• 同分以 P95 延迟、单 token 成本作为 tiebreaker。"),
  ));
  rules.appendChild(el("div",{class:"flex gap-8 mt-12"},
    el("button",{class:"btn ghost",onclick:openProtocolModal},"下载评测协议 (PDF)"),
    el("button",{class:"btn ghost",onclick:openSandboxSpecModal},"沙盒环境规范"),
  ));
  two.appendChild(rules);

  const lb = el("div",{class:"card"});
  lb.appendChild(el("div",{class:"card-h"},
    el("h3",{},"实时排行榜"),
    el("span",{class:"tag green"},"每 30s 刷新")));
  const table = el("table",{class:"lb"});
  table.appendChild(el("thead",{},
    el("tr",{},...["#","Agent","战队","得分","趋势","胜率"].map(h=>el("th",{},h)))));
  const tb = el("tbody",{});
  DB.leaderboard.forEach(r=>{
    tb.appendChild(el("tr",{},
      el("td",{},el("div",{class:`rank r${r.rank<=3?r.rank:""}`},r.rank)),
      el("td",{},el("b",{},r.agent)),
      el("td",{},el("span",{class:"muted"},r.org)),
      el("td",{},el("b",{},r.score)),
      el("td",{},el("span",{class:r.delta.startsWith("+")?"":"muted",style:r.delta.startsWith("+")?"color:var(--ok);font-weight:600":"color:var(--bad);font-weight:600"},r.delta)),
      el("td",{},Math.round(r.winRate*100)+"%")
    ));
  });
  table.appendChild(tb);
  lb.appendChild(table);
  two.appendChild(lb);
  root.appendChild(two);

  // hot battles
  const live = el("div",{class:"card"});
  live.appendChild(el("div",{class:"card-h"},
    el("h3",{},"正在进行的对决"),
    el("a",{href:"#/pk",class:"muted tiny"},"查看回放 →")));
  live.appendChild(el("div",{class:"grid grid-3"},
    [
      {a:"OmniSolver-Pro",b:"Aurora-RC v3.2",p:62},
      {a:"FraudHawk",b:"GuardLLM-7B",p:48},
      {a:"DeepSentry",b:"BaseLine-GPT5",p:71},
    ].map(p=>el("div",{class:"card",style:"background:var(--canvas);box-shadow:none;cursor:pointer",onclick:()=>nav("/pk")},
      el("div",{class:"flex ai-center ji-between mb-8"},
        el("b",{},p.a), el("span",{class:"muted"},"vs"), el("b",{},p.b)),
      el("div",{class:"progress"},el("span",{style:`width:${p.p}%`})),
      el("div",{class:"flex ai-center ji-between mt-8 tiny muted"},
        el("span",{},`通过 ${p.p}% / 38`),el("span",{},el("span",{class:"dot live"})," LIVE")
      )
    ))
  ));
  root.appendChild(live);

  return root;
}

function openEnrollModal(arena){
  const body = el("div",{});
  body.appendChild(el("div",{class:"muted mb-12"},`即将报名 ${arena.title}。请选择接入方式：`));
  body.appendChild(el("div",{class:"radio-group"},
    el("div",{class:"radio-card sel",onclick:(e)=>setActiveSibling(e.currentTarget)},
      el("b",{},"上传 Docker 镜像"),
      el("span",{},"私有部署 / 沙盒拉起 / 自动启动")),
    el("div",{class:"radio-card",onclick:(e)=>setActiveSibling(e.currentTarget)},
      el("b",{},"接入 HTTP / OpenAI API"),
      el("span",{},"配置 endpoint + token，平台代理调用")),
    el("div",{class:"radio-card",onclick:(e)=>setActiveSibling(e.currentTarget)},
      el("b",{},"在线 IDE 构建"),
      el("span",{},"基于平台模板创建轻量 Agent"))
  ));
  const f = el("div",{class:"field mt-12"},
    el("label",{},"参赛 Agent 名称"),
    el("input",{type:"text",value:"Aurora-RC v3.2"})
  );
  body.appendChild(f);
  body.appendChild(el("div",{class:"flex gap-8 ai-center mb-12"},
    el("input",{type:"checkbox",checked:""}),
    el("span",{class:"tiny"},"我已阅读 ", el("button",{class:"btn ghost sm",style:"padding:2px 4px",onclick:openProtocolModal},"评测协议"),
    " 并同意推理日志用于赛后分析")));
  const ok = el("button",{class:"btn primary",onclick:()=>{
    $("#modal-mask").classList.remove("show");
    toast("✅ 报名成功，已为你的 Agent 创建沙盒实例");
    setTimeout(()=>nav("/agents"),900);
  }},"确认报名");
  openModal("报名参赛", body, [el("button",{class:"btn",onclick:()=>$("#modal-mask").classList.remove("show")},"取消"), ok]);
}

function ViewAgents(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},
        el("h3",{style:"margin:0"},"我的 Agents"),
        el("div",{class:"muted tiny"},"管理你部署在平台上的全部 Agent。 支持镜像、API、IDE 三种接入方式。")),
      el("button",{class:"btn primary",onclick:()=>nav("/agents/new")},"+ 部署 / 构建新 Agent"))
  ));
  const grid = el("div",{class:"grid grid-2"});
  DB.agents.forEach(a=>{
    const meta = scenarioMeta(a.scenario);
    const card = el("div",{class:"card"});
    card.appendChild(el("div",{class:"flex ai-center gap-12 mb-12"},
      el("div",{class:"scenario-badge compact"},Icon("agents","badge-svg")),
      el("div",{class:"flex col",style:"flex:1"},
        el("div",{class:"flex ai-center gap-8"},
          el("b",{style:"font-size:15px"},a.name),
          el("span",{class:`tag ${a.status==='running'?'green':a.status==='sandbox'?'amber':''}`},
            a.status==="running"?"运行中":a.status==="sandbox"?"沙盒构建中":"空闲"),
        ),
        el("div",{class:"muted tiny"},`${meta.name} · 底座: ${a.base}`)
      ),
      el("button",{class:"btn sm",onclick:()=>infoModal("Agent 操作 · "+a.name,[el("div",{class:"grid grid-2"},
        el("button",{class:"btn",onclick:()=>{closeModal();openSandboxLogs(a.name);}},"查看沙盒日志"),
        el("button",{class:"btn",onclick:()=>{closeModal();nav("/report");}},"问题分析"),
        el("button",{class:"btn",onclick:()=>toast("已复制 API 调用地址")},"复制 Endpoint"),
        el("button",{class:"btn danger",onclick:()=>toast("已进入下线审批流")},"下线申请")
      )])},"⋯"),
    ));
    card.appendChild(el("div",{class:"grid grid-4 mt-8"},
      el("div",{class:"kpi"},el("div",{class:"lab"},"综合得分"),el("div",{class:"val"},a.score)),
      el("div",{class:"kpi"},el("div",{class:"lab"},"运行次数"),el("div",{class:"val"},a.runs)),
      el("div",{class:"kpi"},el("div",{class:"lab"},"胜率"),el("div",{class:"val"},Math.round(a.winRate*100)+"%")),
      el("div",{class:"kpi"},el("div",{class:"lab"},"单任务成本"),el("div",{class:"val"},"$"+a.costPerTask)),
    ));
    card.appendChild(el("div",{class:"flex gap-8 mt-12"},
      el("button",{class:"btn primary sm",onclick:()=>nav("/pk")},"投入对决"),
      el("button",{class:"btn sm",onclick:()=>nav("/report")},"查看问题报告"),
      el("button",{class:"btn sm",onclick:(e)=>{e.currentTarget.textContent="已暂停";toast("已暂停 "+a.name)}},"暂停"),
      el("button",{class:"btn sm",onclick:()=>openSandboxLogs(a.name)},"沙盒日志"),
    ));
    grid.appendChild(card);
  });
  root.appendChild(grid);
  return root;
}

function ViewAgentNew(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("h3",{style:"margin:0 0 4px"},"部署 / 构建新 Agent"),
    el("div",{class:"muted"},"三种接入方式，任选其一。所有 Agent 都将在隔离沙盒中运行，输入输出全程审计。")));

  let step = 1;
  const stepBar = el("div",{class:"flex gap-8"});
  ["选择接入方式","配置 Agent","沙盒预检","完成"].forEach((t,i)=>{
    stepBar.appendChild(el("div",{class:"pill"+(i===0?" active":""),onclick:()=>renderStep(i+1)},`${i+1}. ${t}`));
  });

  const body = el("div",{class:"card"});
  body.appendChild(stepBar);

  const stepHost = el("div",{class:"mt-18"});

  const renderStep = (n)=>{
    stepHost.innerHTML = "";
    $$(".pill",stepBar).forEach((p,idx)=>p.classList.toggle("active", idx<=n-1));
    if(n===1){
      stepHost.appendChild(el("div",{class:"radio-group"},
        el("div",{class:"radio-card sel",onclick:(e)=>setActiveSibling(e.currentTarget)}, el("b",{},Icon("docker","chip-svg"),"上传 Docker 镜像"), el("span",{},"私有部署 / 自动拉起容器，平台维护沙盒生命周期")),
        el("div",{class:"radio-card",onclick:(e)=>setActiveSibling(e.currentTarget)}, el("b",{},"接入 HTTP / OpenAI API"), el("span",{},"无需上传，平台仅代理调用并审计请求")),
        el("div",{class:"radio-card",onclick:(e)=>setActiveSibling(e.currentTarget)}, el("b",{},"在线 IDE 构建"), el("span",{},"基于 Appen 模板 + MCP 工具，5 分钟拼出一个 Agent"))
      ));
      stepHost.appendChild(el("div",{class:"text-right mt-18"},
        el("button",{class:"btn primary",onclick:()=>renderStep(2)},"下一步 →")
      ));
    } else if(n===2){
      stepHost.appendChild(el("div",{class:"grid grid-2"},
        el("div",{class:"field"},el("label",{},"Agent 名称"),el("input",{type:"text",value:"Aurora-RC v3.3"})),
        el("div",{class:"field"},el("label",{},"目标场景"),
          el("select",{}, ...DB.scenarios.map(s=>el("option",{},s.name)))),
        el("div",{class:"field"},el("label",{},"底层模型 / 框架"),
          el("select",{},el("option",{},"Claude Opus 4.7"),el("option",{},"GPT-5"),el("option",{},"Qwen3-Max"),el("option",{},"DeepSeek V3.5"))),
        el("div",{class:"field"},el("label",{},"镜像地址"),el("input",{type:"text",value:"registry.appen.cn/me/aurora:v3.3"})),
        el("div",{class:"field"},el("label",{},"启动命令"),el("input",{type:"text",value:"python -m aurora.serve --port 8080"})),
        el("div",{class:"field"},el("label",{},"资源规格"),
          el("select",{},el("option",{},"CPU 4c / RAM 8G"),el("option",{},"CPU 8c / RAM 16G + GPU A10"),el("option",{},"CPU 16c / RAM 32G + GPU A100"))),
      ));
      stepHost.appendChild(el("div",{class:"field"},el("label",{},"工具/MCP"),
        el("div",{class:"flex gap-8",style:"flex-wrap:wrap"},
          ["📂 file","🔎 search","🌐 browser","🛠 shell","🧮 python","🗃 RAG","📡 internal-api"].map(t=>el("span",{class:"tag blue",style:"cursor:pointer",onclick:(e)=>{e.currentTarget.classList.toggle("blue");e.currentTarget.classList.toggle("purple");}},t)))));
      stepHost.appendChild(el("div",{class:"flex ji-between mt-18"},
        el("button",{class:"btn",onclick:()=>renderStep(1)},"← 上一步"),
        el("button",{class:"btn primary",onclick:()=>renderStep(3)},"开始预检 →")
      ));
    } else if(n===3){
      const log = el("div",{class:"trace"});
      stepHost.appendChild(log);
      const lines = [
        ["✓ 拉取镜像 registry.appen.cn/me/aurora:v3.3 (842MB)","t-out"],
        ["✓ 创建沙盒命名空间 ns-7842a","t-out"],
        ["✓ 启动容器, 健康检查 GET /health","t-out"],
        ["→ 跑 3 条 smoke test 难例…","t-think"],
        ["• [smoke 1/3] 跨币种退款 → 通过 ✅ (1.2s, $0.011)","t-out"],
        ["• [smoke 2/3] 多轮越权请求 → 通过 ✅ (2.1s, $0.018)","t-out"],
        ["• [smoke 3/3] 联运签证异常 → 通过 ✅ (1.7s, $0.014)","t-out"],
        ["✓ 沙盒预检完成。Agent 可参赛。","t-out"],
      ];
      let i=0;
      const tick = ()=>{
        if(i>=lines.length){ renderStep(4); return; }
        const [t,cls] = lines[i++];
        log.appendChild(el("div",{class:cls},t));
        log.scrollTop = log.scrollHeight;
        setTimeout(tick, 480);
      };
      setTimeout(tick, 280);
    } else if(n===4){
      if(!STATE.deployed){
        STATE.deployed = true;
        DB.agents.unshift({id:"agt-1004", name:"Aurora-RC v3.3", owner:"我", base:"Claude Opus 4.7 + MCP", scenario:"customer", score:0, runs:0, status:"sandbox", winRate:0, costPerTask:0.00});
      }
      stepHost.appendChild(el("div",{class:"text-center",style:"padding:24px"},
        el("div",{style:"font-size:48px"},"🎉"),
        el("h3",{},"部署成功"),
        el("p",{class:"muted"},"Aurora-RC v3.3 已加入你的 Agent 列表，可投入任意竞技场。"),
        el("div",{class:"flex gap-8 ji-center mt-12",style:"justify-content:center"},
          el("button",{class:"btn",onclick:()=>nav("/agents")},"返回 Agent 列表"),
          el("button",{class:"btn primary",onclick:()=>nav("/arenas")},"立即报名竞技场")
        )));
    }
  };

  body.appendChild(stepHost);
  root.appendChild(body);
  renderStep(1);
  return root;
}

function ViewTasks(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},
        el("h3",{style:"margin:0"},"难例任务市场"),
        el("div",{class:"muted tiny"},"专家用户上传真实业务难例，平台审核后入库并发放悬赏。被竞技场采纳后额外奖励 20%。")),
      el("button",{class:"btn primary",onclick:()=>nav("/tasks/new")},"+ 提交难例任务"))
  ));
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex gap-8",style:"flex-wrap:wrap"},
      el("span",{class:"pill active",onclick:(e)=>{setActiveSibling(e.currentTarget);toast("已显示全部难例")}},"全部"),
      ...DB.scenarios.slice(0,6).map(s=>el("span",{class:"pill",onclick:(e)=>{setActiveSibling(e.currentTarget);toast(`已筛选 ${s.name} 难例`) }},s.name)),
      el("span",{class:"pill",style:"margin-left:auto",onclick:(e)=>{setActiveSibling(e.currentTarget);toast("已按奖励从高到低排序")}},"奖励 ↓"))
  ));
  const grid = el("div",{class:"grid grid-2"});
  DB.tasks.forEach(t=>{
    const meta = scenarioMeta(t.scenario);
    const card = el("div",{class:"card",style:"cursor:pointer",onclick:()=>openTaskDetail(t)});
    card.appendChild(el("div",{class:"flex ai-center gap-12 mb-8"},
      el("span",{class:"tag blue"},meta.name),
      el("span",{class:`tag ${t.difficulty==='S+'?'red':t.difficulty==='S'?'amber':'green'}`},"难度 "+t.difficulty),
      el("span",{class:"tag",style:"margin-left:auto"},t.status)
    ));
    card.appendChild(el("h4",{style:"margin:0 0 6px"},t.title));
    card.appendChild(el("div",{class:"muted tiny mb-8"},"#"+t.id+" · 由 "+t.submittedBy+" 提交"));
    card.appendChild(el("div",{class:"bar-mini mb-8"},
      el("span",{class:"tiny muted"},"全平台通过率"),
      el("div",{class:"progress"},el("span",{style:`width:${Math.round(t.solved*100)}%`})),
      el("span",{class:"v"},Math.round(t.solved*100)+"%")
    ));
    card.appendChild(el("div",{class:"flex ai-center ji-between mt-8"},
      el("b",{style:"color:var(--brand)"},"悬赏 ¥"+t.reward),
      el("button",{class:"btn sm primary",onclick:(e)=>{e.stopPropagation();toast("已接取，进入沙盒…");setTimeout(()=>nav("/pk"),600)}},"接取并 PK")
    ));
    grid.appendChild(card);
  });
  root.appendChild(grid);
  return root;
}
function openTaskDetail(t){
  const body = el("div",{});
  body.appendChild(el("div",{class:"muted"},"#"+t.id+" · 提交人 "+t.submittedBy));
  body.appendChild(el("h3",{},t.title));
  body.appendChild(el("p",{class:"muted"},
    "任务输入: 多轮工单对话 + 附件证据 + 客户档案；任务输出: 处置建议 (JSON) + 自然语言回复；评测: 处置正确性、合规性、客户满意度模拟分。"));
  body.appendChild(el("div",{class:"flex gap-8 mb-12"},
    el("span",{class:"tag blue"},"难度 "+t.difficulty),
    el("span",{class:"tag green"},"悬赏 ¥"+t.reward),
    el("span",{class:"tag amber"},"已被 17 个 Agent 挑战")
  ));
  body.appendChild(el("pre",{style:"background:#0F172A;color:#E2E8F0;padding:12px;border-radius:10px;font-size:12px;overflow:auto"},
`> 客户: 帮我把昨天那张联运票全退了，我老婆护照过期签不了证。
> 系统: 该票为非自愿改签条款...
> 客户: 我直接转告你们经理！还有，把我朋友那张一起退！
> 系统: 检测到越权请求 + 跨账号操作 + 跨币种(HKD→CNY)退款...`));
  openModal("难例任务详情", body, [
    el("button",{class:"btn",onclick:()=>$("#modal-mask").classList.remove("show")},"取消"),
    el("button",{class:"btn primary",onclick:()=>{$("#modal-mask").classList.remove("show");toast("已接取，进入 PK 沙盒…");setTimeout(()=>nav("/pk"),600)}},"投入 Agent 挑战")
  ]);
}

function ViewTaskNew(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("h3",{style:"margin:0 0 4px"},"提交难例任务"),
    el("div",{class:"muted"},"难例越具代表性 / 越能体现真实业务复杂度，奖励越高。被采纳后还会进入下一季竞技场。")));
  const form = el("div",{class:"card"});
  form.appendChild(el("div",{class:"grid grid-2"},
    el("div",{class:"field"},el("label",{},"任务标题"),el("input",{type:"text",placeholder:"例如：跨币种退款 + 越权请求"})),
    el("div",{class:"field"},el("label",{},"业务场景"),
      el("select",{},...DB.scenarios.map(s=>el("option",{},s.name)))),
    el("div",{class:"field"},el("label",{},"难度自评"),
      el("select",{},el("option",{},"A"),el("option",{selected:""},"S"),el("option",{},"S+"))),
    el("div",{class:"field"},el("label",{},"期望悬赏 (元)"),el("input",{type:"number",value:"380"})),
  ));
  form.appendChild(el("div",{class:"field"},el("label",{},"任务描述"),
    el("textarea",{placeholder:"业务背景 / 输入数据 / 预期输出 / 边界条件 …"})));
  form.appendChild(el("div",{class:"field"},el("label",{},"评测标准 (Rubric)"),
    el("textarea",{placeholder:"明确该 Agent 应满足的若干判定条件，每条 0/1，平台会自动转 Rubric。"})));
  form.appendChild(el("div",{class:"field"},el("label",{},"附件 (Demo 数据 / 真实脱敏样本)"),
    el("div",{style:"border:2px dashed var(--line);padding:18px;border-radius:12px;text-align:center;color:var(--ink-3)"},
      "拖拽文件到此或", el("button",{class:"btn ghost",onclick:()=>toast("已选择 demo-sample-redacted.jsonl")},"点击上传"))));
  form.appendChild(el("div",{class:"flex gap-8 ji-end"},
    el("button",{class:"btn",onclick:()=>nav("/tasks")},"取消"),
    el("button",{class:"btn primary",onclick:()=>{toast("✅ 已提交，等待专家评审 (约 24h)");setTimeout(()=>nav("/tasks"),900)}},"提交评审")));
  root.appendChild(form);
  return root;
}

function ViewPK(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},
        el("h3",{style:"margin:0"},"PK 实时回放"),
        el("div",{class:"muted tiny"},"双 Agent 在同一难例上的推理过程、工具调用、最终答案、得分。")),
      el("div",{class:"flex gap-8"},
        el("span",{class:"tag red"},el("span",{class:"dot live"})," LIVE"),
        el("button",{class:"btn",onclick:()=>infoModal("切换难例",[
          el("div",{class:"grid grid-2"},...DB.tasks.slice(0,4).map(t=>el("button",{class:"btn",onclick:()=>{closeModal();toast(`已切换到 ${t.id}`);render();}},`${t.id} · ${t.title.slice(0,12)}…`)))
        ])},"切换难例"),
        el("button",{class:"btn primary",onclick:()=>{toast("正在重新播放推理轨迹");render();}},"开始重放")))
  ));
  const card = el("div",{class:"card"});
  card.appendChild(el("h4",{style:"margin:0 0 6px"},"难例 #HC-9001 · 跨币种退款 + 越权签证申请的复合工单"));
  card.appendChild(el("div",{class:"muted mb-12"},"输入: 6 轮对话 + 客户档案 + 票务附件"));

  const left = el("div",{class:"pk-side"});
  left.appendChild(el("h4",{}, Avatar("AR"), "Aurora-RC v3.2 ", el("span",{class:"tag green"},"我方")));
  const tL = el("div",{class:"trace"});
  left.appendChild(tL);
  left.appendChild(el("div",{class:"flex ai-center ji-between mt-8"},
    el("span",{class:"muted tiny"},"用时 2.7s · $0.018"),
    el("span",{class:"tag amber"},"得分 76 / 100")));

  const right = el("div",{class:"pk-side"});
  right.appendChild(el("h4",{}, Avatar("OS"), "OmniSolver-Pro ", el("span",{class:"tag blue"},"SOTA")));
  const tR = el("div",{class:"trace"});
  right.appendChild(tR);
  right.appendChild(el("div",{class:"flex ai-center ji-between mt-8"},
    el("span",{class:"muted tiny"},"用时 2.4s · $0.022"),
    el("span",{class:"tag green"},"得分 92 / 100")));

  card.appendChild(el("div",{class:"pk"}, left, el("div",{class:"pk-vs"},"VS"), right));
  root.appendChild(card);

  // animate streams
  const trL = [
    ["[think] 读取工单 + 客户档案…","t-think"],
    ["[tool ] search_kb(\"联运退票条款\")","t-tool"],
    ["[think] 命中条款 RT-088 → 非自愿改签 ✔","t-think"],
    ["[tool ] currency.convert(HKD→CNY)","t-tool"],
    ["[out  ] 给出退款金额与处置步骤","t-out"],
    ["[err  ] 未识别『跨账号操作』为越权 ❌","t-err"],
    ["[out  ] 回复客户 → 漏拦截朋友账号退款","t-out"],
  ];
  const trR = [
    ["[think] 解析对话 + 检测意图 (含越权信号)","t-think"],
    ["[tool ] policy.check(cross_account=true)","t-tool"],
    ["[think] 命中安全策略 SC-12 → 拒绝跨账号","t-think"],
    ["[tool ] search_kb(\"联运退票条款\")","t-tool"],
    ["[tool ] currency.convert(HKD→CNY)","t-tool"],
    ["[think] 二次复核 (cross-LLM) → 通过","t-think"],
    ["[out  ] 输出处置 JSON + 合规回复 ✅","t-out"],
  ];
  const stream = (arr, host, gap=420)=>{
    let i=0;
    const t = ()=>{
      if(i>=arr.length) return;
      const [text,cls] = arr[i++];
      host.appendChild(el("div",{class:cls},text));
      host.scrollTop = host.scrollHeight;
      setTimeout(t, gap);
    };
    setTimeout(t, 200);
  };
  stream(trL, tL, 520);
  stream(trR, tR, 460);

  // verdict
  const verdict = el("div",{class:"card"});
  verdict.appendChild(el("div",{class:"card-h"},el("h3",{},"裁判结论"),el("span",{class:"tag green"},"OmniSolver-Pro 胜")));
  verdict.appendChild(el("div",{class:"grid grid-3"},
    el("div",{class:"kpi"},el("div",{class:"lab"},"正确性"),el("div",{class:"val"},"76 vs 96")),
    el("div",{class:"kpi"},el("div",{class:"lab"},"安全合规"),el("div",{class:"val"},"58 vs 92")),
    el("div",{class:"kpi"},el("div",{class:"lab"},"成本效率"),el("div",{class:"val"},"$0.018 vs $0.022")),
  ));
  verdict.appendChild(el("div",{class:"mt-12"},
    el("b",{},"主要差距："),
    el("ul",{},
      el("li",{},"Aurora-RC 未识别『跨账号操作』为越权请求 (安全策略缺失)"),
      el("li",{},"复合意图解析阶段未做 cross-LLM 复核 → 漏拦截 1 项")
    ),
    el("div",{class:"flex gap-8 mt-12"},
      el("button",{class:"btn primary",onclick:()=>nav("/report")},"查看 Agent 完整问题报告"),
      el("button",{class:"btn",onclick:()=>infoModal("导出 PK 详情",["已生成包含双方推理轨迹、工具调用、评分依据的 PDF 预览。"],[el("button",{class:"btn",onclick:closeModal},"关闭"),el("button",{class:"btn primary",onclick:()=>toast("PDF 已加入下载队列")},"下载 PDF")])},"导出 PK 详情 (PDF)"),
    )));
  root.appendChild(verdict);

  return root;
}

function ViewReport(){
  const r = REPORT;
  const root = el("div",{class:"flex col gap-18"});

  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center gap-12"},
      el("div",{class:"scenario-badge report-badge"},Icon("report","badge-svg")),
      el("div",{class:"flex col",style:"flex:1"},
        el("h3",{style:"margin:0"}, `Agent 问题分析报告 — ${r.agent}`),
        el("div",{class:"muted tiny"},"覆盖 12 个竞技场 · 1,820 条难例 · 生成于 2026-05-26")),
      el("div",{class:"flex col",style:"text-align:right"},
        el("div",{},el("b",{style:"font-size:30px;color:var(--brand)"},r.overall.score)),
        el("div",{class:"tag red"},r.overall.vs))
    )));

  // radar (SVG)
  const radar = el("div",{class:"card"});
  radar.appendChild(el("div",{class:"card-h"},el("h3",{},"能力维度雷达 (vs SOTA)")));
  const rwrap = el("div",{class:"radar-wrap"});
  rwrap.appendChild(buildRadar(r.radar));
  const list = el("div",{class:"flex col gap-10"});
  r.radar.forEach(x=>{
    list.appendChild(el("div",{},
      el("div",{class:"flex ai-center ji-between mb-4"},
        el("b",{},x.k),
        el("span",{class:"muted tiny"},`${x.v} / ${x.sota}`)),
      el("div",{class:"progress"},el("span",{style:`width:${x.v}%`})),
    ));
  });
  rwrap.appendChild(list);
  radar.appendChild(rwrap);
  root.appendChild(radar);

  // failures
  const fails = el("div",{class:"card"});
  fails.appendChild(el("div",{class:"card-h"},el("h3",{},"错误归因 · TOP 5"),el("span",{class:"muted tiny"},"按失败样本数排序")));
  const table = el("table",{class:"lb"});
  table.appendChild(el("thead",{},
    el("tr",{},...["错误类型","失败率","样本数","建议方案","行动"].map(h=>el("th",{},h)))));
  const tb = el("tbody",{});
  r.failures.forEach(f=>{
    tb.appendChild(el("tr",{},
      el("td",{},el("b",{},f.type)),
      el("td",{},el("span",{class:"tag red"},(f.rate*100).toFixed(1)+"%")),
      el("td",{},f.examples),
      el("td",{class:"muted"},f.fix),
      el("td",{},el("button",{class:"btn sm primary",onclick:()=>nav("/datasets")},"查看对应数据集 →"))
    ));
  });
  table.appendChild(tb);
  fails.appendChild(table);
  root.appendChild(fails);

  // recommend datasets
  const recCard = el("div",{class:"card"});
  recCard.appendChild(el("div",{class:"card-h"},
    el("h3",{},"推荐采购：针对本 Agent 的训练数据集"),
    el("span",{class:"tag blue"},"由 Appen 出品")));
  const recGrid = el("div",{class:"grid grid-2"});
  REPORT.recommend.forEach(id=>{
    const d = DB.datasets.find(x=>x.id===id); if(!d) return;
    recGrid.appendChild(el("div",{class:"card",style:"background:var(--canvas);box-shadow:none"},
      el("div",{class:"flex ai-center ji-between mb-8"},
        el("b",{},d.name),
        el("span",{class:"tag green"},d.license)),
      el("div",{class:"muted tiny mb-8"},`${d.size} · 月增 ${d.growth}`),
      el("div",{class:"flex gap-6 mb-12",style:"flex-wrap:wrap"},
        ...d.coverage.map(c=>el("span",{class:"tag"},c))),
      el("div",{class:"flex ai-center ji-between"},
        el("b",{style:"color:var(--brand)"},d.price),
        el("button",{class:"btn primary sm",onclick:()=>{addToCart(d.name);setTimeout(()=>nav("/datasets"),600)}},"加入采购"))
    ));
  });
  recCard.appendChild(recGrid);
  recCard.appendChild(el("blockquote",{class:"mt-12"},
    "根据 Appen 历史项目数据：采购 + 微调上述 2 个训练集后，同类错误平均降低 47%，预计综合得分提升至 86-89。"));
  root.appendChild(recCard);

  // solution
  const sol = el("div",{class:"card"});
  sol.appendChild(el("div",{class:"card-h"},el("h3",{},"💡 综合解决方案建议")));
  sol.appendChild(el("ol",{},
    el("li",{},"短期 (1 周): 接入安全策略 MCP，补齐越权 / 跨账号识别；引入 cross-LLM 复核。"),
    el("li",{},"中期 (2-4 周): 采购 ds-1 + ds-2，做 LoRA 微调；用 8% holdout 评估幻觉率。"),
    el("li",{},"长期 (季度): 报名「合规越权」专项竞技场，用真实赛事数据持续滚动训练。"),
  ));
  sol.appendChild(el("div",{class:"flex gap-8 mt-8"},
    el("button",{class:"btn primary",onclick:()=>nav("/datasets")},"立即采购推荐数据集"),
    el("button",{class:"btn",onclick:()=>infoModal("导出报告",["报告可导出为 PDF、Notion 页面或飞书文档。Demo 中已模拟生成完成。"],[el("button",{class:"btn",onclick:closeModal},"关闭"),el("button",{class:"btn primary",onclick:()=>toast("报告已加入下载队列")},"下载 PDF")])},"导出报告 (PDF / Notion)"),
    el("button",{class:"btn ghost",onclick:()=>infoModal("预约 Appen 咨询",[
      el("div",{class:"field"},el("label",{},"咨询主题"),el("input",{type:"text",value:"Aurora-RC 问题修复与数据采购"})),
      el("div",{class:"field"},el("label",{},"期望时间"),el("select",{},el("option",{},"本周内"),el("option",{},"下周"),el("option",{},"只需邮件回复")))
    ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("咨询预约已提交")}},"提交预约")])},"预约 Appen 咨询")));
  root.appendChild(sol);

  return root;
}

function buildRadar(data){
  // simple SVG radar
  const PAD = 70; // room for axis labels
  const size=240, cx=size/2+PAD, cy=size/2+PAD, R=92, N=data.length;
  const vb = size + PAD*2;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox",`0 0 ${vb} ${vb}`);
  svg.setAttribute("width","100%");
  svg.setAttribute("style","max-width:360px;height:auto;display:block;margin:0 auto");
  svg.setAttribute("preserveAspectRatio","xMidYMid meet");
  // grid rings
  [0.25,0.5,0.75,1].forEach(t=>{
    const poly = document.createElementNS(ns,"polygon");
    const pts = data.map((_,i)=>{
      const ang = -Math.PI/2 + i*2*Math.PI/N;
      return (cx+Math.cos(ang)*R*t)+","+(cy+Math.sin(ang)*R*t);
    }).join(" ");
    poly.setAttribute("points",pts);
    poly.setAttribute("fill","none");
    poly.setAttribute("stroke","#E5E7EF");
    svg.appendChild(poly);
  });
  // axes + labels
  data.forEach((d,i)=>{
    const ang = -Math.PI/2 + i*2*Math.PI/N;
    const x = cx+Math.cos(ang)*R, y = cy+Math.sin(ang)*R;
    const l = document.createElementNS(ns,"line");
    l.setAttribute("x1",cx); l.setAttribute("y1",cy); l.setAttribute("x2",x); l.setAttribute("y2",y);
    l.setAttribute("stroke","#E5E7EF");
    svg.appendChild(l);
    const lab = document.createElementNS(ns,"text");
    lab.setAttribute("x", cx+Math.cos(ang)*(R+14));
    lab.setAttribute("y", cy+Math.sin(ang)*(R+14)+4);
    lab.setAttribute("text-anchor", Math.abs(Math.cos(ang))<.3?"middle":(Math.cos(ang)>0?"start":"end"));
    lab.setAttribute("font-size","11");
    lab.setAttribute("fill","#64748B");
    lab.textContent = d.k;
    svg.appendChild(lab);
  });
  // SOTA polygon
  const sotaPts = data.map((d,i)=>{
    const ang = -Math.PI/2 + i*2*Math.PI/N;
    const r = R*(d.sota/100);
    return (cx+Math.cos(ang)*r)+","+(cy+Math.sin(ang)*r);
  }).join(" ");
  const sota = document.createElementNS(ns,"polygon");
  sota.setAttribute("points",sotaPts);
  sota.setAttribute("fill","rgba(139,92,246,0.15)");
  sota.setAttribute("stroke","rgba(139,92,246,0.9)");
  sota.setAttribute("stroke-width","1.5");
  svg.appendChild(sota);
  // current
  const curPts = data.map((d,i)=>{
    const ang = -Math.PI/2 + i*2*Math.PI/N;
    const r = R*(d.v/100);
    return (cx+Math.cos(ang)*r)+","+(cy+Math.sin(ang)*r);
  }).join(" ");
  const cur = document.createElementNS(ns,"polygon");
  cur.setAttribute("points",curPts);
  cur.setAttribute("fill","rgba(51,97,255,0.22)");
  cur.setAttribute("stroke","rgba(51,97,255,1)");
  cur.setAttribute("stroke-width","2");
  svg.appendChild(cur);

  const wrap = el("div",{class:"text-center"});
  wrap.appendChild(svg);
  wrap.appendChild(el("div",{class:"flex gap-12 ji-center tiny",style:"justify-content:center;color:var(--ink-3)"},
    el("span",{},"■ 当前 Agent"),
    el("span",{style:"color:#8B5CF6"},"■ SOTA")));
  return wrap;
}

function ViewDatasets(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},
        el("h3",{style:"margin:0"},"训练数据集商城"),
        el("div",{class:"muted tiny"},"基于平台真实难例 + 专家标注，覆盖 8 大场景。所有数据集均通过 Appen 合规审查。")),
      el("button",{class:"btn primary",onclick:()=>infoModal("咨询定制采集",[
        el("div",{class:"field"},el("label",{},"目标场景"),el("input",{type:"text",placeholder:"例如：跨境电商客服退款"})),
        el("div",{class:"field"},el("label",{},"预计样本量"),el("select",{},el("option",{},"1k-5k"),el("option",{},"5k-20k"),el("option",{},"20k+"))),
        el("div",{class:"field"},el("label",{},"补充说明"),el("textarea",{placeholder:"业务约束、合规要求、交付周期…"}))
      ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("定制采集咨询已提交")}},"提交咨询")])},"咨询定制采集"))
  ));
  const grid = el("div",{class:"grid grid-2"});
  DB.datasets.forEach(d=>{
    const meta = scenarioMeta(d.scenario);
    const card = el("div",{class:"card"});
    card.appendChild(el("div",{class:"flex ai-center gap-10 mb-8"},
      el("span",{class:"tag blue"},meta.name),
      el("span",{class:"tag green"},d.license),
      el("span",{class:"tag",style:"margin-left:auto"},"月增 "+d.growth)));
    card.appendChild(el("h4",{style:"margin:0 0 6px"},d.name));
    card.appendChild(el("div",{class:"muted tiny mb-8"},d.size+" 条精标样本 · 含错误归因 / 难度分层"));
    card.appendChild(el("div",{class:"flex gap-6 mb-12",style:"flex-wrap:wrap"},
      ...d.coverage.map(c=>el("span",{class:"tag"},c))));
    card.appendChild(el("div",{class:"flex ai-center ji-between"},
      el("b",{style:"color:var(--brand);font-size:18px"},d.price),
      el("div",{class:"flex gap-8"},
        el("button",{class:"btn sm",onclick:()=>infoModal("样本预览 · "+d.name,[
          el("pre",{style:"background:#0F172A;color:#E2E8F0;padding:12px;border-radius:10px;overflow:auto"},`{\n  "scenario": "${meta.name}",\n  "input": "脱敏后的真实业务难例片段…",\n  "rubric": ["事实正确", "安全合规", "工具调用"],\n  "label_quality": "双人标注 + 仲裁"\n}`)
        ])},"样本预览"),
        el("button",{class:"btn sm primary",onclick:()=>addToCart(d.name)},"加入采购")
      )));
    grid.appendChild(card);
  });
  root.appendChild(grid);
  return root;
}

function ViewMarketplace(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},
        el("h3",{style:"margin:0"},"Agent 方案市场"),
        el("div",{class:"muted tiny"},"基于竞技场战绩推荐各场景下表现最好的 Agent，可直接订阅 API 或部署到私有云。")),
      el("button",{class:"btn",onclick:()=>infoModal("我要上架 Agent",[
        el("div",{class:"field"},el("label",{},"Agent 名称"),el("input",{type:"text",placeholder:"填写你要上架的 Agent"})),
        el("div",{class:"field"},el("label",{},"目标场景"),el("select",{},...DB.scenarios.map(s=>el("option",{},s.name)))),
        "上架前需通过对应 Arena 的公开或私评验证，并签署商业授权协议。"
      ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("上架申请已提交")}},"提交申请")])},"我要上架"))
  ));
  const grid = el("div",{class:"grid grid-2"});
  DB.recommended.forEach(r=>{
    const meta = scenarioMeta(r.scenario);
    grid.appendChild(el("div",{class:"card"},
      el("div",{class:"flex ai-center gap-10 mb-8"},
        el("span",{class:"tag blue"},meta.name),
        el("span",{class:"tag amber"},r.badge),
      ),
      el("h4",{style:"margin:0 0 6px"},r.best),
      el("div",{class:"flex ai-center ji-between mt-8"},
        el("div",{},
          el("div",{class:"muted tiny"},"竞技场综合分"),
          el("b",{style:"font-size:22px;color:var(--brand)"},r.score)),
        el("div",{class:"text-right"},
          el("div",{class:"muted tiny"},"调用价"),
          el("b",{style:"font-size:16px"},r.price))),
      el("div",{class:"flex gap-8 mt-12"},
        el("button",{class:"btn sm primary",onclick:()=>infoModal("订阅 API · "+r.best,[`调用价：${r.price}`,"订阅后会生成 API Key、QPS 配额与账单视图。"],[el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("已订阅，5 分钟内开通")}},"确认订阅")])},"订阅 API"),
        el("button",{class:"btn sm",onclick:()=>infoModal("私有部署询价",[
          el("div",{class:"field"},el("label",{},"部署环境"),el("select",{},el("option",{},"客户私有云"),el("option",{},"Appen 托管 VPC"),el("option",{},"本地机房"))),
          el("div",{class:"field"},el("label",{},"预计日调用量"),el("input",{type:"number",value:"100000"}))
        ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("私有部署询价已提交")}},"提交询价")])},"私有部署询价"),
        el("button",{class:"btn sm ghost",onclick:()=>nav("/pk")},"查看战绩"))
    ));
  });
  root.appendChild(grid);
  return root;
}

function ViewProfile(){
  const root = el("div",{class:"flex col gap-18"});
  const card = el("div",{class:"card"});
  card.appendChild(el("div",{class:"flex ai-center gap-14"},
    Avatar(DB.user.avatar,"avatar xl"),
    el("div",{class:"flex col gap-4",style:"flex-1"},
      el("h2",{style:"margin:0;font-size:22px"},DB.user.name),
      el("div",{class:"muted"},DB.user.handle+" · "+DB.user.role),
      el("div",{class:"flex gap-8 mt-8"},
        el("span",{class:"tag green"},DB.user.rank),
        el("span",{class:"tag blue"},"已出题 80 条"),
        el("span",{class:"tag amber"},"参赛 235 次"))),
    el("div",{class:"text-right"},
      el("div",{class:"muted tiny"},"奖金账户"),
      el("b",{style:"color:var(--brand);font-size:28px"},fmtMoney(DB.user.balance)),
      el("div",{class:"flex gap-8 ji-end mt-8"},
        el("button",{class:"btn sm",onclick:()=>infoModal("提现",[
          el("div",{class:"field"},el("label",{},"提现金额"),el("input",{type:"number",value:"2000"})),
          el("div",{class:"field"},el("label",{},"到账账户"),el("select",{},el("option",{},"Appen 已绑定银行卡"),el("option",{},"企业账户")))
        ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("提现申请已提交")}},"提交提现")])},"提现"),
        el("button",{class:"btn sm primary",onclick:()=>infoModal("充值",[
          el("div",{class:"field"},el("label",{},"充值金额"),el("input",{type:"number",value:"5000"})),
          el("div",{class:"field"},el("label",{},"支付方式"),el("select",{},el("option",{},"企业账单"),el("option",{},"银行卡"),el("option",{},"线下转账")))
        ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("充值流程已创建")}},"继续")])},"充值"))
    )));
  root.appendChild(card);

  root.appendChild(el("div",{class:"grid grid-3"},
    el("div",{class:"card"},el("div",{class:"card-h"},el("h3",{},"我承办的竞技场")),
      el("div",{class:"muted"},"作为出题专家承办的赛季 · 3 场进行中"),
      el("div",{class:"flex gap-8 mt-12"},
        el("button",{class:"btn sm primary",onclick:()=>nav("/tasks/new")},"+ 新建难例"),
        el("button",{class:"btn sm",onclick:()=>nav("/arenas")},"管理"))),
    el("div",{class:"card"},el("div",{class:"card-h"},el("h3",{},"我的 Agent")),
      el("div",{class:"muted"},"3 个 Agent，胜率 60%+，总参赛 1,512 次"),
      el("div",{class:"mt-12"},el("button",{class:"btn sm primary",onclick:()=>nav("/agents")},"进入管理"))),
    el("div",{class:"card"},el("div",{class:"card-h"},el("h3",{},"奖金流水"),el("button",{class:"btn ghost sm",onclick:()=>infoModal("全部奖金流水",[
      "Demo 展示最近 3 条流水；正式版将支持按竞赛、难例、提现、月份筛选和导出。"
    ])},"全部")),
      el("div",{class:"list-row"},Avatar("PK"), el("div",{},el("div",{class:"name"},"航旅退改签 PK"),el("div",{class:"sub"},"5月25日")),el("div",{class:"right",style:"color:var(--ok);font-weight:600"},"+¥1,200")),
      el("div",{class:"list-row"},Avatar("HC"), el("div",{},el("div",{class:"name"},"难例采纳"),el("div",{class:"sub"},"5月22日")),el("div",{class:"right",style:"color:var(--ok);font-weight:600"},"+¥380")),
      el("div",{class:"list-row"},Avatar("WD"), el("div",{},el("div",{class:"name"},"提现"),el("div",{class:"sub"},"5月15日")),el("div",{class:"right",style:"color:var(--bad);font-weight:600"},"-¥2,000")),
    )));

  root.appendChild(el("div",{class:"card"},
    el("div",{class:"card-h"},el("h3",{},"账户设置"),el("span",{class:"tag blue"},"用户可见")),
    el("div",{class:"grid grid-3"},
      el("div",{class:"radio-card"},el("b",{},"隐私与日志"),el("span",{},"推理日志保留 90 天，可申请清除"),el("div",{class:"mt-12"},el("button",{class:"btn sm",onclick:()=>toast("已打开日志保留设置")},"设置"))),
      el("div",{class:"radio-card"},el("b",{},"通知偏好"),el("span",{},"站内信、邮件、开赛提醒"),el("div",{class:"mt-12"},el("button",{class:"btn sm",onclick:()=>toast("通知偏好已保存")},"管理"))),
      el("div",{class:"radio-card"},el("b",{},"API 与授权"),el("span",{},"管理订阅 Agent 的 API Key"),el("div",{class:"mt-12"},el("button",{class:"btn sm",onclick:()=>nav("/marketplace")},"查看")))
    )));
  return root;
}

function ViewInbox(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},el("h3",{style:"margin:0"},"消息中心"),el("div",{class:"muted tiny"},"站内消息、赛事邀请、评测报告与奖金通知。")),
      el("button",{class:"btn primary",onclick:()=>infoModal("新建站内消息",[
        el("div",{class:"field"},el("label",{},"收件人"),el("input",{type:"text",placeholder:"输入姓名或组织"})),
        el("div",{class:"field"},el("label",{},"内容"),el("textarea",{placeholder:"输入消息内容…"}))
      ], [el("button",{class:"btn",onclick:closeModal},"取消"),el("button",{class:"btn primary",onclick:()=>{closeModal();toast("消息已发送")}},"发送")])},"+ 新消息"))
  ));
  const list = el("div",{class:"card"});
  DB.messages.forEach(m=>list.appendChild(el("div",{class:"list-row",style:"cursor:pointer",onclick:()=>openMessageModal(m)},
    Avatar(m.a),
    el("div",{style:"flex:1"},el("div",{class:"name"},m.who),el("div",{class:"sub"},m.w)),
    el("div",{class:"right"},m.t)
  )));
  root.appendChild(list);
  return root;
}

function ViewEvents(){
  const root = el("div",{class:"flex col gap-18"});
  root.appendChild(el("div",{class:"card"},
    el("div",{class:"flex ai-center ji-between"},
      el("div",{},el("h3",{style:"margin:0"},"赛事日历"),el("div",{class:"muted tiny"},"查看开赛、决赛、闭门会与众包活动。")),
      el("button",{class:"btn primary",onclick:()=>toast("赛事日历已同步到本地日历")},"同步日历"))
  ));
  root.appendChild(el("div",{class:"grid grid-2"},...DB.events.map(e=>el("div",{class:"card",style:"cursor:pointer",onclick:()=>openEventModal(e)},
    el("div",{class:"event",style:"border-bottom:none"},
      el("div",{class:"when"},el("b",{},e.d),el("span",{},e.m)),
      el("div",{class:"what"},el("b",{},e.t),el("span",{},e.s))
    )
  ))));
  return root;
}

// ---------- Org switcher ----------
function openOrgSwitcher(){
  const body = el("div",{});
  body.appendChild(el("p",{class:"muted"},"切换上下文会改变所有页面的所有权、配额与计费归属。"));
  const list = el("div",{class:"org-list"});
  DB.orgs.forEach(o=>{
    const active = o.id===DB.user.currentOrg;
    const row = el("div",{class:"org-row"+(active?" active":""),onclick:()=>{
      DB.user.currentOrg = o.id; closeModal(); toast("已切换到 "+o.name); render();
    }},
      el("span",{class:"org-mark"},o.short),
      el("div",{class:"col",style:"flex:1"},
        el("b",{},o.name),
        el("small",{class:"muted"}, `${o.plan} · ${o.role} · ${o.used}/${o.seats} 席位`)
      ),
      active?el("span",{class:"chip chip-on"},"当前"):el("span",{class:"chip"},"切换")
    );
    list.appendChild(row);
  });
  body.appendChild(list);
  body.appendChild(el("div",{class:"flex gap-8 mt-12"},
    el("button",{class:"btn",onclick:()=>{closeModal();nav("/org");}},"组织设置"),
    el("button",{class:"btn",onclick:()=>toast("已发送创建组织申请")},"+ 创建组织"),
    el("button",{class:"btn",onclick:()=>toast("已复制邀请链接")},"复制邀请链接")
  ));
  openModal("组织 / 工作区", body);
}

// ---------- Org & team ----------
function ViewOrg(){
  const root = el("div",{class:"view"});
  const cur = DB.orgs.find(o=>o.id===DB.user.currentOrg);
  root.appendChild(el("div",{class:"view-head"},
    el("div",{},
      el("h2",{},"组织 & 团队"),
      el("p",{class:"muted"},"SaaS 多租户：一个账号可属于多个组织，每个组织独立配额、计费、数据隔离与权限。")
    ),
    el("div",{class:"flex gap-8"},
      el("button",{class:"btn",onclick:openOrgSwitcher},"切换组织"),
      el("button",{class:"btn primary",onclick:()=>toast("邀请邮件已发送")},"邀请成员")
    )
  ));

  // header card
  const head = el("div",{class:"card org-head"});
  head.appendChild(el("div",{class:"org-mark lg"},cur.short));
  head.appendChild(el("div",{class:"col",style:"flex:1"},
    el("div",{class:"flex ai-center gap-8"},el("h3",{},cur.name),el("span",{class:"chip chip-on"},cur.plan),el("span",{class:"chip"},cur.role)),
    el("div",{class:"muted"}, `域 ${cur.domain} · 席位 ${cur.used}/${cur.seats} · 账单 ${cur.billing}`)
  ));
  head.appendChild(el("button",{class:"btn",onclick:()=>toast("已导出组织审计日志")},"导出审计日志"));
  root.appendChild(head);

  // KPI grid
  const kpis = el("div",{class:"grid grid-4 mt-12"});
  [["席位用量",`${cur.used}/${cur.seats}`,"距上限 "+(cur.seats-cur.used)+" 席"],
   ["本月沙盒",`${Math.round(cur.used*8.4)}h`,"配额 200h/月"],
   ["本月评测花费",`¥${(cur.used*1840).toLocaleString()}`,"环比 +12%"],
   ["合规事件",`0`,"过去 30 天"]].forEach(([t,v,s])=>{
    kpis.appendChild(el("div",{class:"card kpi"},
      el("div",{class:"muted"},t), el("div",{class:"kpi-v"},v), el("div",{class:"muted"},s)));
  });
  root.appendChild(kpis);

  // tabs: members / roles / plan / sso / audit
  const grid = el("div",{class:"grid grid-2 mt-12"});
  // members
  const m = el("div",{class:"card"});
  m.appendChild(el("h3",{},"成员"));
  cur.members.forEach(u=>{
    m.appendChild(el("div",{class:"list-row"},
      Avatar(u.a),
      el("div",{class:"col",style:"flex:1"}, el("div",{class:"name"},u.name), el("div",{class:"sub"},u.role)),
      el("span",{class:"chip "+(u.on?"chip-on":"")}, u.on?"在线":"离线"),
      el("button",{class:"icon-btn",title:"角色管理",onclick:()=>infoModal("修改角色 · "+u.name,[
        el("div",{class:"grid grid-2"},
          ...["Owner","Org Admin","Maintainer","Member","Viewer"].map(r=>
            el("button",{class:"btn"+(r===u.role?" primary":""),onclick:()=>{u.role=r;closeModal();render();toast("角色已更新");}},r))
        )
      ])},"⚙")
    ));
  });
  grid.appendChild(m);

  // roles + sso
  const r = el("div",{class:"card"});
  r.appendChild(el("h3",{},"角色矩阵"));
  const rt = el("table",{class:"tbl"});
  rt.innerHTML = `<thead><tr><th>能力</th><th>Owner</th><th>Admin</th><th>Maintainer</th><th>Member</th><th>Viewer</th></tr></thead>`;
  const rb = el("tbody",{});
  [["计费 / 续费","✓","—","—","—","—"],
   ["邀请 / 移除成员","✓","✓","—","—","—"],
   ["创建 Arena / 评测","✓","✓","✓","—","—"],
   ["发布 Agent / 数据集","✓","✓","✓","✓","—"],
   ["查看排行 & 报告","✓","✓","✓","✓","✓"]].forEach(row=>{
     rb.appendChild(el("tr",{}, ...row.map(c=>el("td",{},c))));
   });
  rt.appendChild(rb); r.appendChild(rt);

  r.appendChild(el("div",{class:"divider"}));
  r.appendChild(el("h3",{},"安全 & 接入"));
  r.appendChild(el("div",{class:"grid grid-2"},
    el("div",{class:"feature"},el("b",{},"SSO / SAML"),el("span",{class:"muted"},"已启用 · Okta"),el("button",{class:"btn small",onclick:()=>toast("已下载 SAML 元数据")},"导出元数据")),
    el("div",{class:"feature"},el("b",{},"SCIM 同步"),el("span",{class:"muted"},"已启用 · 每小时"),el("button",{class:"btn small",onclick:()=>toast("已触发立即同步")},"立即同步")),
    el("div",{class:"feature"},el("b",{},"审计日志"),el("span",{class:"muted"},"过去 90 天 2,341 条"),el("button",{class:"btn small",onclick:()=>nav("/org")},"查看")),
    el("div",{class:"feature"},el("b",{},"IP 白名单"),el("span",{class:"muted"},"3 段 CIDR"),el("button",{class:"btn small",onclick:()=>toast("配置面板已打开")},"配置"))
  ));
  grid.appendChild(r);
  root.appendChild(grid);

  // plan
  const plan = el("div",{class:"card mt-12"});
  plan.appendChild(el("h3",{},"组织套餐能力"));
  const fg = el("div",{class:"chips"});
  cur.features.forEach(f=>fg.appendChild(el("span",{class:"chip chip-on"},"✓ "+f)));
  plan.appendChild(fg);
  plan.appendChild(el("div",{class:"flex gap-8 mt-12"},
    el("button",{class:"btn",onclick:()=>toast("已发起升级咨询")},"升级套餐"),
    el("button",{class:"btn",onclick:()=>toast("已导出账单")},"导出账单"),
    el("button",{class:"btn",onclick:()=>toast("已生成订阅发票")},"开具发票")
  ));
  root.appendChild(plan);

  return root;
}

// ---------- Tools / Skills / MCP marketplaces ----------
function MarketCard(items, kind){
  const grid = el("div",{class:"grid grid-3 mt-12"});
  items.forEach(t=>{
    const card = el("div",{class:"card market-card"});
    card.appendChild(el("div",{class:"flex ai-center gap-8"},
      el("div",{class:"market-icon"}, Icon(itemIconKey(t,kind),"market-svg")),
      el("div",{class:"col",style:"flex:1"},
        el("b",{},t.name),
        el("small",{class:"muted"}, t.cat || t.vendor || (t.scenario?scenarioMeta(t.scenario).name:""))
      ),
      t.verified===false?el("span",{class:"chip"},"社区"):el("span",{class:"chip chip-on"},"已认证")
    ));
    card.appendChild(el("p",{class:"muted mt-8"}, t.desc));
    const meta = el("div",{class:"flex gap-8 ai-center mt-8"});
    if(t.installs) meta.appendChild(el("span",{class:"chip"}, t.installs+" 安装"));
    if(t.uses)     meta.appendChild(el("span",{class:"chip"}, t.uses+" 次使用"));
    if(t.rating)   meta.appendChild(el("span",{class:"chip"}, "评分 "+t.rating));
    if(t.price)    meta.appendChild(el("span",{class:"chip"}, t.price));
    if(t.risk)     meta.appendChild(el("span",{class:"chip"}, "风险 "+t.risk));
    card.appendChild(meta);
    card.appendChild(el("div",{class:"flex gap-8 mt-12"},
      el("button",{class:"btn small",onclick:()=>infoModal(t.name,[t.desc,"在 Agent Studio 中可一键挂载到当前 Agent 流水线。"])},"详情"),
      el("button",{class:"btn primary small",onclick:()=>toast(t.name+(kind==="mcp"?" 已接入当前组织":" 已添加到 Agent Studio"))}, kind==="mcp"?"接入":"添加到 Agent")
    ));
    grid.appendChild(card);
  });
  return grid;
}

function ViewTools(){
  const root = el("div",{class:"view"});
  root.appendChild(el("div",{class:"view-head"},
    el("div",{},el("h2",{},"工具市场"),el("p",{class:"muted"},"原子化工具调用：浏览器、代码、SQL、向量库、视觉、仿真器…")),
    el("div",{class:"flex gap-8"},
      el("button",{class:"btn",onclick:()=>toast("已切换为组织私有工具视图")},"组织私有"),
      el("button",{class:"btn primary",onclick:()=>toast("已进入工具发布向导")},"+ 发布工具"))
  ));
  const filters = el("div",{class:"chips"});
  ["全部","信息检索","执行","数据","检索增强","文档","多模态","具身仿真","业务"].forEach((c,i)=>{
    const p = el("button",{class:"pill"+(i===0?" active":""),onclick:(e)=>setActiveSibling(e.currentTarget)},c);
    filters.appendChild(p);
  });
  root.appendChild(filters);
  root.appendChild(MarketCard(DB.tools,"tool"));
  return root;
}

function ViewSkills(){
  const root = el("div",{class:"view"});
  root.appendChild(el("div",{class:"view-head"},
    el("div",{},el("h2",{},"技能市场"),el("p",{class:"muted"},"可复用的领域 SOP / Prompt 组合包，含评测样本与最佳实践。")),
    el("button",{class:"btn primary",onclick:()=>toast("已进入技能发布向导")},"+ 发布技能")));
  root.appendChild(MarketCard(DB.skills,"skill"));
  return root;
}

function ViewMCP(){
  const root = el("div",{class:"view"});
  root.appendChild(el("div",{class:"view-head"},
    el("div",{},el("h2",{},"MCP 接入"),el("p",{class:"muted"},"Model Context Protocol 服务器：把企业系统/真机/外部 API 统一暴露给 Agent。")),
    el("div",{class:"flex gap-8"},
      el("button",{class:"btn",onclick:()=>infoModal("MCP 接入规范",[
        "支持 stdio / streamable-http / sse 三种传输。",
        "组织级密钥托管：所有凭证由 KMS 加密，运行时通过代理注入。",
        "调用日志按组织隔离，可导出至 SIEM / 数据湖。"
      ])},"接入规范"),
      el("button",{class:"btn primary",onclick:()=>toast("已打开 MCP 注册向导")},"+ 注册 MCP"))));
  root.appendChild(MarketCard(DB.mcps,"mcp"));
  // health table
  root.appendChild(el("h3",{class:"mt-18"},"已接入 MCP · 健康状态"));
  const tbl = el("table",{class:"tbl"});
  tbl.innerHTML = `<thead><tr><th>名称</th><th>厂商</th><th>传输</th><th>暴露工具</th><th>认证</th><th>P95 延迟</th><th>状态</th><th></th></tr></thead>`;
  const tb = el("tbody",{});
  [["Filesystem MCP","官方","stdio","read,write,watch","sandbox","2ms","🟢 健康"],
   ["GitHub MCP","GitHub","http","repo,issue,pr,actions","OAuth","180ms","🟢 健康"],
   ["ROS2 Bridge","Open Robotics","sse","topic,service,tf","mTLS","48ms","🟡 抖动"],
   ["医疗 EHR MCP","Appen × 医联","http","patient,record,lab","SAML+审计","260ms","🟢 健康"]
  ].forEach(r=>tb.appendChild(el("tr",{},...r.map(c=>el("td",{},c)), el("td",{}, el("button",{class:"btn small",onclick:()=>openSandboxLogs("MCP "+r[0])},"日志")))));
  tbl.appendChild(tb); root.appendChild(tbl);
  return root;
}

// ---------- Agent Studio ----------
function ViewStudio(){
  const root = el("div",{class:"view"});
  root.appendChild(el("div",{class:"view-head"},
    el("div",{},el("h2",{},"Agent Studio · 可视化构建"),
      el("p",{class:"muted"},"把模型、工具、技能、MCP、数据、记忆、护栏、评测一图打通。")),
    el("div",{class:"flex gap-8"},
      el("button",{class:"btn",onclick:()=>nav("/agents/new")},"用引导式向导"),
      el("button",{class:"btn",onclick:()=>toast("已加载社区模板：客服退改签 v2")},"模板库"),
      el("button",{class:"btn primary",onclick:()=>toast("已保存并提交沙盒")},"运行 & 部署"))));

  // Capability matrix — research-backed module list
  const modules = [
    {k:"model",  t:"🧠 模型层", d:"Claude Opus 4.7 / GPT-5 / Qwen3 多供应商路由 + 回退", chips:["主模型 Claude","回退 GPT-5","蒸馏 Qwen3"]},
    {k:"prompt", t:"📝 Prompt & 系统提示", d:"版本化、A/B、变量与片段库", chips:["v3.2","A/B 启用","片段 × 18"]},
    {k:"tools",  t:"工具", d:"原子调用：浏览器/代码/SQL/视觉…", chips:["Web","Python","SQL","Vector RAG"]},
    {k:"skills", t:"技能包", d:"领域 SOP 与最佳实践组合", chips:["航旅退改 v4","越权检测","摘要压缩"]},
    {k:"mcp",    t:"MCP 接入", d:"企业系统 / 真机 / 外部 API", chips:["GitHub","Jira","EHR","ROS2"]},
    {k:"rag",    t:"知识 / RAG", d:"多向量库 + 关键词 + 图检索 + rerank", chips:["客服 KB","政策库","图谱"]},
    {k:"memory", t:"🧠 记忆", d:"会话短期 + 用户长程 + 任务 episodic", chips:["短期 32k","长程 Mem0","episodic"]},
    {k:"flow",   t:"🪢 工作流编排", d:"DAG / 状态机，多 Agent 协作", chips:["Planner→Solver→Critic","并行 ×3"]},
    {k:"guard",  t:"护栏 & 策略", d:"PII / 越权 / 工具白名单 / 速率", chips:["PII 脱敏","越权拦截","工具白名单"]},
    {k:"eval",   t:"评测 & Rubric", d:"在线/离线评测、回归集、人工抽检", chips:["回归 1.2k","抽检 5%","Rubric ×6"]},
    {k:"data",   t:"🗂 数据 & 反馈", d:"难例上架、标注回流、偏好数据", chips:["难例回流","RLHF/RLAIF"]},
    {k:"trigger",t:"⚡ 触发与渠道", d:"Webhook / 邮件 / IM / 工单系统", chips:["飞书","邮件","Webhook"]},
    {k:"obs",    t:"观测与成本", d:"Trace、token、延迟、错误归因", chips:["OpenTelemetry","成本预算"]},
    {k:"ver",    t:"🔖 版本 & 发布", d:"灰度、金丝雀、回滚、组织隔离", chips:["灰度 10%","金丝雀","秒级回滚"]},
  ];
  const grid = el("div",{class:"grid grid-3 mt-12"});
  modules.forEach(m=>{
    const c = el("div",{class:"card studio-mod",onclick:()=>{
      if(m.k==="tools") nav("/tools");
      else if(m.k==="skills") nav("/skills");
      else if(m.k==="mcp") nav("/mcp");
      else toast(m.t+" 配置面板已打开");
    },style:"cursor:pointer"});
    c.appendChild(el("h3",{},m.t));
    c.appendChild(el("p",{class:"muted"},m.d));
    const cg = el("div",{class:"chips mt-8"});
    m.chips.forEach(x=>cg.appendChild(el("span",{class:"chip"},x)));
    c.appendChild(cg);
    grid.appendChild(c);
  });
  root.appendChild(grid);

  // Pipeline canvas (mock)
  const canvas = el("div",{class:"card mt-12 pipeline"});
  canvas.appendChild(el("h3",{},"📐 流水线画布 (示意)"));
  const lane = el("div",{class:"pipe-lane"});
  ["触发","Planner","RAG","工具调用","护栏","Critic","输出"]
    .forEach((s,i,arr)=>{
      lane.appendChild(el("div",{class:"pipe-node"},s));
      if(i<arr.length-1) lane.appendChild(el("div",{class:"pipe-arrow"},"→"));
    });
  canvas.appendChild(lane);
  canvas.appendChild(el("div",{class:"flex gap-8 mt-12"},
    el("button",{class:"btn",onclick:()=>toast("已生成 OpenTelemetry trace")},"查看 Trace"),
    el("button",{class:"btn",onclick:()=>toast("已运行回归集 1.2k 例")},"运行评测"),
    el("button",{class:"btn",onclick:()=>toast("已发起 A/B 实验：旧 v3.1 vs 新 v3.2")},"A/B 实验"),
    el("button",{class:"btn primary",onclick:()=>toast("已部署到组织灰度 10%")},"灰度发布")
  ));
  root.appendChild(canvas);
  return root;
}

// ---------- Embodied AI simulation arena ----------
function ViewEmbodied(){
  const root = el("div",{class:"view"});
  root.appendChild(el("div",{class:"view-head"},
    el("div",{},el("h2",{},"具身仿真竞技场"),
      el("p",{class:"muted"},"在多家高保真仿真环境里 PK 长程任务，统一评测成功率 / 安全 / 节拍 / 能耗 / sim2real 差距。")),
    el("div",{class:"flex gap-8"},
      el("button",{class:"btn",onclick:()=>infoModal("评测维度",[
        "成功率 SR、加权成功率 SPL、子任务完成率",
        "碰撞次数 / 安全事件 / 人机交接质量",
        "完成时间 / 节拍 / 能耗 / 控制带宽",
        "sim2real 迁移差距 (sim → real 抽样真机复跑)",
        "可恢复性：从失败状态恢复继续任务的能力"
      ])},"评测协议"),
      el("button",{class:"btn primary",onclick:()=>toast("已打开策略提交向导")},"+ 提交策略"))));

  // Sim environments
  root.appendChild(el("h3",{},"仿真环境"));
  const envs = el("div",{class:"grid grid-3"});
  DB.simEnvs.forEach(e=>{
    const c = el("div",{class:"card sim-card",style:"cursor:pointer",onclick:()=>nav("/embodied/"+e.id)});
    c.appendChild(el("div",{class:"flex ai-center gap-8"},
      el("div",{class:"market-icon"},Icon("embodied","market-svg")),
      el("div",{class:"col",style:"flex:1"},el("b",{},e.name),el("small",{class:"muted"},e.vendor+" · "+e.domain))));
    c.appendChild(el("div",{class:"flex gap-8 mt-8"},
      el("span",{class:"chip"},"任务 "+e.tasks),
      el("span",{class:"chip"},"策略 "+e.agents),
      el("span",{class:"chip"},"sim2real "+e.real2sim)));
    const sg = el("div",{class:"chips mt-8"}); e.sensors.forEach(s=>sg.appendChild(el("span",{class:"chip"},s)));
    c.appendChild(sg);
    c.appendChild(el("p",{class:"muted mt-8"},"物理：" + e.physics));
    envs.appendChild(c);
  });
  root.appendChild(envs);

  // Featured tasks
  root.appendChild(el("h3",{class:"mt-18"},"精选长程任务"));
  const tasks = el("div",{class:"grid grid-2"});
  DB.simTasks.forEach(t=>{
    const env = DB.simEnvs.find(e=>e.id===t.env);
    const c = el("div",{class:"card"});
    c.appendChild(el("div",{class:"flex ai-center gap-8"},
      el("b",{},t.title), el("span",{class:"chip"}, env?.name||t.env)));
    c.appendChild(el("div",{class:"flex gap-8 mt-8"},
      el("span",{class:"chip"},"时长 "+t.horizon),
      el("span",{class:"chip"},"步数 "+t.steps),
      el("span",{class:"chip"},"SOTA SR "+(t.success*100).toFixed(0)+"%")));
    const kg = el("div",{class:"chips mt-8"}); t.kpis.forEach(k=>kg.appendChild(el("span",{class:"chip chip-on"},"KPI "+k)));
    c.appendChild(kg);
    c.appendChild(el("div",{class:"flex gap-8 mt-12"},
      el("button",{class:"btn",onclick:()=>openReplay(t)},"3D 回放"),
      el("button",{class:"btn",onclick:()=>toast("已查看排行")},"排行榜"),
      el("button",{class:"btn primary",onclick:()=>openSubmitPolicy(t)},"提交策略")));
    tasks.appendChild(c);
  });
  root.appendChild(tasks);

  // PK split-screen mock
  root.appendChild(el("h3",{class:"mt-18"},"PK 复盘 · 双策略并排回放"));
  const pk = el("div",{class:"card embodied-pk"});
  pk.appendChild(el("div",{class:"pk-split"},
    el("div",{class:"pk-side"}, el("div",{class:"pk-head"}, "🟦 OmniBody-Pro · v0.9"), buildSimViewer("blue"), el("div",{class:"pk-stats"},"SR 0.62 · 碰撞 1 · 完成 4:21")),
    el("div",{class:"pk-side"}, el("div",{class:"pk-head"}, "🟪 Aurora-Embodied · v0.4"), buildSimViewer("violet"), el("div",{class:"pk-stats"},"SR 0.48 · 碰撞 3 · 完成 5:47"))
  ));
  pk.appendChild(el("div",{class:"flex gap-8 mt-12 ji-center"},
    el("button",{class:"btn",onclick:()=>toast("帧 ← 已回退")},"⏮ 上一关键帧"),
    el("button",{class:"btn primary",onclick:()=>toast("播放/暂停")},"▶ 播放"),
    el("button",{class:"btn",onclick:()=>toast("帧 → 已前进")},"下一关键帧 ⏭"),
    el("button",{class:"btn",onclick:()=>toast("已对齐时间轴")},"对齐时间轴")
  ));
  root.appendChild(pk);

  return root;
}

function ViewEmbodiedDetail(id){
  const env = DB.simEnvs.find(e=>e.id===id) || DB.simEnvs[0];
  const root = el("div",{class:"view"});
  root.appendChild(el("div",{class:"view-head"},
    el("div",{},el("a",{href:"#/embodied",class:"muted"},"← 返回仿真竞技场"),
      el("h2",{},env.name), el("p",{class:"muted"}, env.vendor+" · "+env.domain+" · 物理 "+env.physics)),
    el("div",{class:"flex gap-8"},
      el("button",{class:"btn",onclick:()=>toast("已下载 SDK")},"下载 SDK"),
      el("button",{class:"btn primary",onclick:()=>openSubmitPolicy({title:env.name+" · 通用提交"})},"+ 提交策略"))));

  root.appendChild(el("div",{class:"grid grid-3 mt-12"},
    el("div",{class:"card kpi"}, el("div",{class:"muted"},"任务数"), el("div",{class:"kpi-v"},env.tasks)),
    el("div",{class:"card kpi"}, el("div",{class:"muted"},"已提交策略"), el("div",{class:"kpi-v"},env.agents)),
    el("div",{class:"card kpi"}, el("div",{class:"muted"},"sim2real 评级"), el("div",{class:"kpi-v"},env.real2sim))
  ));

  // tasks
  root.appendChild(el("h3",{class:"mt-12"},"任务清单"));
  const list = el("div",{class:"grid grid-2"});
  DB.simTasks.filter(t=>t.env===env.id).forEach(t=>{
    list.appendChild(el("div",{class:"card"},
      el("b",{},t.title),
      el("div",{class:"flex gap-8 mt-8"},
        el("span",{class:"chip"},"时长 "+t.horizon), el("span",{class:"chip"},"SOTA SR "+(t.success*100).toFixed(0)+"%")),
      el("div",{class:"flex gap-8 mt-8"},
        el("button",{class:"btn small",onclick:()=>openReplay(t)},"3D 回放"),
        el("button",{class:"btn primary small",onclick:()=>openSubmitPolicy(t)},"提交策略"))));
  });
  if(!list.children.length) list.appendChild(el("p",{class:"muted"},"该环境的任务正在筹备中。"));
  root.appendChild(list);

  // leaderboard
  root.appendChild(el("h3",{class:"mt-18"},"排行榜"));
  const lb = el("table",{class:"tbl"});
  lb.innerHTML = `<thead><tr><th>排名</th><th>策略</th><th>组织</th><th>SR</th><th>碰撞</th><th>节拍</th><th>sim2real Δ</th></tr></thead>`;
  const lbb = el("tbody",{});
  [["1","OmniBody-Pro","Meta FAIR","0.71","0.4","3:48","-7.2%"],
   ["2","Aurora-Embodied","清华 RWAI","0.62","0.9","4:21","-11.0%"],
   ["3","RoboGPT-v0.3","UC Berkeley","0.58","1.2","4:53","-13.8%"],
   ["4","BaseLine-PPO","Appen","0.41","2.1","6:02","-22.5%"]].forEach(r=>lbb.appendChild(el("tr",{},...r.map(c=>el("td",{},c)))));
  lb.appendChild(lbb); root.appendChild(lb);

  // protocol
  root.appendChild(el("div",{class:"card mt-12"},
    el("h3",{},"提交规范 & 评测协议"),
    el("ul",{},
      el("li",{},"提交物：policy.zip (含 action/observation spec) 或 ROS2 桥接镜像。"),
      el("li",{},"动作空间：连续 / 离散均可，需声明频率与边界。"),
      el("li",{},"观测：" + env.sensors.join(" · ") + "；可订阅子集，最少需含 RGB。"),
      el("li",{},"评测：3 个随机种子 × 3 次复跑，统计中位数；环境扰动按规范注入。"),
      el("li",{},"sim2real：从真机/数字孪生抽样 N=20 复跑，差距进入综合分。"),
      el("li",{},"合规：禁止读取真值标签、禁止外联非白名单 MCP。")
    )
  ));
  return root;
}

function buildSimViewer(color){
  // CSS isometric scene mock
  const stage = el("div",{class:"sim-stage"});
  stage.appendChild(el("div",{class:"sim-floor"}));
  stage.appendChild(el("div",{class:"sim-grid"}));
  stage.appendChild(el("div",{class:"sim-robot",style:`background:${color==="violet"?"#8b5cf6":"#3b82f6"}`}));
  stage.appendChild(el("div",{class:"sim-target"}));
  stage.appendChild(el("div",{class:"sim-hud"}, color==="violet"?"frame 1247 / 3200":"frame 1480 / 3200"));
  return stage;
}

function openReplay(t){
  const body = el("div",{},
    el("p",{class:"muted"}, "任务："+(t.title||"")),
    buildSimViewer("blue"),
    el("div",{class:"flex gap-8 mt-12 ji-center"},
      el("button",{class:"btn",onclick:()=>toast("⏮ 上一关键帧")},"⏮"),
      el("button",{class:"btn primary",onclick:()=>toast("▶ 播放")},"▶ 播放"),
      el("button",{class:"btn",onclick:()=>toast("⏭ 下一关键帧")},"⏭"))
  );
  openModal("3D 回放 (示意)", body, [el("button",{class:"btn primary",onclick:closeModal},"关闭")]);
}

function openSubmitPolicy(t){
  const body = el("div",{},
    el("p",{class:"muted"},"提交目标："+(t.title||"通用任务")),
    el("div",{class:"grid grid-2"},
      el("label",{class:"field"}, el("span",{},"策略包 (policy.zip)"), el("input",{type:"file"})),
      el("label",{class:"field"}, el("span",{},"动作空间"),
        el("select",{}, el("option",{},"连续 7-DoF"), el("option",{},"离散 navigation"), el("option",{},"混合"))),
      el("label",{class:"field"}, el("span",{},"观测订阅"),
        el("select",{multiple:"multiple"}, el("option",{},"RGB"), el("option",{},"Depth"), el("option",{},"Tactile"), el("option",{},"Proprio"))),
      el("label",{class:"field"}, el("span",{},"最长 episode"), el("input",{type:"number",value:"4000"})),
      el("label",{class:"field"}, el("span",{},"评测种子数"), el("input",{type:"number",value:"3"})),
      el("label",{class:"field"}, el("span",{},"是否申请真机复跑"),
        el("select",{}, el("option",{},"否"), el("option",{},"是 (排队)"))),
    )
  );
  openModal("提交策略到具身竞技场", body, [
    el("button",{class:"btn",onclick:closeModal},"取消"),
    el("button",{class:"btn primary",onclick:()=>{closeModal();toast("策略已入队，沙盒评测启动");}},"开始评测")
  ]);
}

// ---------- Router ----------
const ROUTES = {
  "dashboard": {view:ViewDashboard, rail:true},
  "arenas":    {view:ViewArenas, rail:true},
  "arena":     {view:(id)=>ViewArena(id), rail:true, dyn:true},
  "agents":    {view:ViewAgents, rail:true},
  "agentsnew": {view:ViewAgentNew, rail:true, path:"agents/new"},
  "studio":    {view:ViewStudio, rail:false},
  "tasks":     {view:ViewTasks, rail:true},
  "tasksnew":  {view:ViewTaskNew, rail:true, path:"tasks/new"},
  "pk":        {view:ViewPK, rail:false},
  "report":    {view:ViewReport, rail:false},
  "datasets":  {view:ViewDatasets, rail:true},
  "marketplace":{view:ViewMarketplace, rail:true},
  "tools":     {view:ViewTools, rail:false},
  "skills":    {view:ViewSkills, rail:false},
  "mcp":       {view:ViewMCP, rail:false},
  "org":       {view:ViewOrg, rail:false},
  "embodied":  {view:ViewEmbodied, rail:false},
  "profile":   {view:ViewProfile, rail:true},
  "inbox":     {view:ViewInbox, rail:false},
  "events":    {view:ViewEvents, rail:false},
};

function nav(path){ location.hash = "#"+path; }

function render(){
  flashRouteLoader();
  const hash = location.hash.replace(/^#\/?/,"") || "dashboard";
  const parts = hash.split("/");
  const root = parts[0];

  // resolve
  let route, viewNode, navKey;
  if(root==="arena" && parts[1]){ route = ROUTES.arena; viewNode = route.view(parts[1]); navKey = "arenas"; }
  else if(root==="agents" && parts[1]==="new"){ route = ROUTES.agentsnew; viewNode = route.view(); navKey = "agents"; }
  else if(root==="tasks" && parts[1]==="new"){ route = ROUTES.tasksnew; viewNode = route.view(); navKey = "tasks"; }
  else if(root==="embodied" && parts[1]){ route = {view:()=>ViewEmbodiedDetail(parts[1]), rail:false}; viewNode = route.view(); navKey = "embodied"; }
  else if(ROUTES[root]){ route = ROUTES[root]; viewNode = route.view(); navKey = root; }
  else { route = ROUTES.dashboard; viewNode = route.view(); navKey = "dashboard"; }

  const app = $("#app");
  app.innerHTML = "";
  app.className = "app" + (route.rail ? "" : " no-rail");
  app.appendChild(Sidebar(navKey));

  const main = el("div",{class:"main"});
  main.appendChild(Topbar());
  main.appendChild(viewNode);
  app.appendChild(main);

  if(route.rail) app.appendChild(RightRail());

  window.scrollTo({top:0});
  requestAnimationFrame(()=>document.body.classList.add("app-ready"));
}

window.addEventListener("hashchange", render);
document.addEventListener("DOMContentLoaded", render);
window.nav = nav;
