import { useState, useCallback } from "react";
 
/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS & SEED DATA
───────────────────────────────────────────────────────────────────────────── */
const THRUST_AREAS = [
  "Revenue Growth","Customer Experience","Operational Efficiency",
  "People & Culture","Innovation","Compliance & Safety","Digital Transformation","Quality Assurance",
];
const UOM_TYPES = [
  { value:"Numeric (Min)", label:"Numeric – Min (higher is better, e.g. Revenue)" },
  { value:"Numeric (Max)", label:"Numeric – Max (lower is better, e.g. TAT, Cost)" },
  { value:"Percentage (Min)", label:"% – Min (higher is better, e.g. Efficiency%)" },
  { value:"Percentage (Max)", label:"% – Max (lower is better, e.g. Error Rate%)" },
  { value:"Timeline", label:"Timeline (date-based completion)" },
  { value:"Zero-based", label:"Zero-based (0 = 100% success, e.g. Safety incidents)" },
];
const STATUSES = ["Not Started","On Track","Completed"];
const QUARTERS = ["Q1 (July)","Q2 (October)","Q3 (January)","Q4/Annual (March-April)"];
const CHECK_SCHEDULE = [
  { period:"Goal Setting", window:"1st May", action:"Goal Creation, Submission & Approval" },
  { period:"Q1 Check-in", window:"July", action:"Progress Update — Planned vs. Actual" },
  { period:"Q2 Check-in", window:"October", action:"Progress Update — Planned vs. Actual" },
  { period:"Q3 Check-in", window:"January", action:"Progress Update — Planned vs. Actual" },
  { period:"Q4 / Annual", window:"March / April", action:"Final Achievement Capture" },
];
 
const USERS = {
  employee1:{ id:"employee1", name:"Priya Sharma",  email:"priya@atomcorp.in",  role:"employee", managerId:"manager1", dept:"Sales",      avatar:"PS" },
  employee2:{ id:"employee2", name:"Rahul Mehta",   email:"rahul@atomcorp.in",  role:"employee", managerId:"manager1", dept:"Sales",      avatar:"RM" },
  employee3:{ id:"employee3", name:"Anjali Verma",  email:"anjali@atomcorp.in", role:"employee", managerId:"manager2", dept:"Operations", avatar:"AV" },
  manager1: { id:"manager1",  name:"Vikram Nair",   email:"vikram@atomcorp.in", role:"manager",  dept:"Sales",      avatar:"VN" },
  manager2: { id:"manager2",  name:"Deepa Pillai",  email:"deepa@atomcorp.in",  role:"manager",  dept:"Operations", avatar:"DP" },
  admin:    { id:"admin",     name:"Suresh Kumar",  email:"suresh@atomcorp.in", role:"admin",    dept:"HR",         avatar:"SK" },
};
 
const mkAch = (q1=0,q2=0,q3=0,q4=0) => ({
  "Q1 (July)":q1,"Q2 (October)":q2,"Q3 (January)":q3,"Q4/Annual (March-April)":q4
});
const mkAchStr = (q1="",q2="",q3="",q4="") => ({
  "Q1 (July)":q1,"Q2 (October)":q2,"Q3 (January)":q3,"Q4/Annual (March-April)":q4
});
 
const SEED_GOALS = [
  { id:"g1",  employeeId:"employee1", title:"Increase Sales Revenue",      thrustArea:"Revenue Growth",          description:"Achieve monthly sales targets across all product lines.", uom:"Numeric (Min)",    target:5000000, weightage:30, status:"On Track",   achievements:mkAch(3800000), approvalStatus:"approved", locked:true,  isShared:false, createdAt:"2025-05-10", checkinComments:{} },
  { id:"g2",  employeeId:"employee1", title:"Customer Satisfaction Score",  thrustArea:"Customer Experience",     description:"Maintain CSAT above 90% across all touchpoints.",          uom:"Percentage (Min)", target:90,      weightage:25, status:"On Track",   achievements:mkAch(88),      approvalStatus:"approved", locked:true,  isShared:false, createdAt:"2025-05-10", checkinComments:{"Q1 (July)":"Good progress, aim to cross 90 next quarter."} },
  { id:"g3",  employeeId:"employee1", title:"Zero Safety Incidents",        thrustArea:"Compliance & Safety",     description:"Maintain zero workplace safety incidents throughout the year.", uom:"Zero-based",    target:0,       weightage:20, status:"On Track",   achievements:mkAch(0),       approvalStatus:"approved", locked:true,  isShared:true,  sharedFrom:"manager1", createdAt:"2025-05-10", checkinComments:{} },
  { id:"g4",  employeeId:"employee1", title:"TAT Reduction – Order Proc.",  thrustArea:"Operational Efficiency",  description:"Reduce order processing turnaround time to under 48 hours.",  uom:"Numeric (Max)", target:48,      weightage:25, status:"Not Started", achievements:mkAch(0),       approvalStatus:"pending",  locked:false, isShared:false, createdAt:"2025-05-12", checkinComments:{} },
  { id:"g5",  employeeId:"employee2", title:"New Client Acquisition",       thrustArea:"Revenue Growth",          description:"Onboard new enterprise clients across verticals.",            uom:"Numeric (Min)", target:10,      weightage:40, status:"Not Started", achievements:mkAch(0),       approvalStatus:"approved", locked:true,  isShared:false, createdAt:"2025-05-14", checkinComments:{} },
  { id:"g6",  employeeId:"employee2", title:"Product Launch Timeline",      thrustArea:"Innovation",              description:"Complete product launch by committed target date.",           uom:"Timeline",      target:"2025-12-31", weightage:35, status:"Not Started", achievements:mkAchStr(), approvalStatus:"approved", locked:true, isShared:false, createdAt:"2025-05-14", checkinComments:{} },
  { id:"g7",  employeeId:"employee2", title:"Training Completion Rate",     thrustArea:"People & Culture",        description:"Complete all mandatory L&D training modules.",               uom:"Percentage (Min)", target:100, weightage:25, status:"On Track",   achievements:mkAch(60),      approvalStatus:"approved", locked:true,  isShared:false, createdAt:"2025-05-14", checkinComments:{} },
  { id:"g8",  employeeId:"employee3", title:"Process Efficiency Gain",      thrustArea:"Operational Efficiency",  description:"Reduce operational costs by streamlining key processes.",     uom:"Percentage (Min)", target:15,  weightage:50, status:"On Track",   achievements:mkAch(8),       approvalStatus:"approved", locked:true,  isShared:false, createdAt:"2025-05-08", checkinComments:{"Q1 (July)":"Good start. Focus on warehouse process next."} },
  { id:"g9",  employeeId:"employee3", title:"Zero Safety Incidents",        thrustArea:"Compliance & Safety",     description:"Maintain zero workplace safety incidents in operations.",    uom:"Zero-based",    target:0,       weightage:50, status:"On Track",   achievements:mkAch(0),       approvalStatus:"approved", locked:true,  isShared:true,  sharedFrom:"manager2", createdAt:"2025-05-08", checkinComments:{} },
];
 
const SEED_AUDIT = [
  { id:"a1", timestamp:"2025-05-10 09:00", userId:"manager1", action:"Goal approved",  details:"Approved 'Increase Sales Revenue' for Priya Sharma",       goalId:"g1" },
  { id:"a2", timestamp:"2025-05-10 09:05", userId:"manager1", action:"Goal approved",  details:"Approved 'Customer Satisfaction Score' for Priya Sharma",   goalId:"g2" },
  { id:"a3", timestamp:"2025-05-10 09:10", userId:"admin",    action:"Goal shared",    details:"Pushed 'Zero Safety Incidents' to Priya Sharma (employee1)", goalId:"g3" },
  { id:"a4", timestamp:"2025-05-10 09:15", userId:"admin",    action:"Goal shared",    details:"Pushed 'Zero Safety Incidents' to Anjali Verma (employee3)", goalId:"g9" },
  { id:"a5", timestamp:"2025-05-14 11:00", userId:"manager1", action:"Goal approved",  details:"Approved 'New Client Acquisition' for Rahul Mehta",         goalId:"g5" },
  { id:"a6", timestamp:"2025-05-14 11:02", userId:"manager1", action:"Goal approved",  details:"Approved 'Product Launch Timeline' for Rahul Mehta",        goalId:"g6" },
  { id:"a7", timestamp:"2025-05-14 11:05", userId:"manager1", action:"Goal approved",  details:"Approved 'Training Completion Rate' for Rahul Mehta",       goalId:"g7" },
  { id:"a8", timestamp:"2025-05-15 10:00", userId:"manager1", action:"Check-in added", details:"Q1 check-in comment added for Priya Sharma – CSAT goal",    goalId:"g2" },
  { id:"a9", timestamp:"2025-05-15 10:10", userId:"manager2", action:"Check-in added", details:"Q1 check-in comment added for Anjali Verma – Efficiency",   goalId:"g8" },
];
 
const NOTIFICATIONS_SEED = [
  { id:"n1", userId:"employee1", msg:"Your goal 'Increase Sales Revenue' has been approved by Vikram Nair.", type:"success", read:false, ts:"2025-05-10 09:00" },
  { id:"n2", userId:"employee1", msg:"Goal 'TAT Reduction' submitted — awaiting manager approval.", type:"info",    read:false, ts:"2025-05-12 14:00" },
  { id:"n3", userId:"manager1",  msg:"Priya Sharma submitted a new goal for your approval: 'TAT Reduction'.", type:"warning", read:false, ts:"2025-05-12 14:01" },
  { id:"n4", userId:"manager1",  msg:"Q1 check-in window is now open. Please review your team's progress.", type:"info",    read:false, ts:"2025-07-01 08:00" },
  { id:"n5", userId:"employee2", msg:"Rahul, Q1 check-in window is open. Log your achievements now.", type:"info",    read:false, ts:"2025-07-01 08:00" },
  { id:"n6", userId:"admin",     msg:"3 employees have not completed Q1 check-in. Escalation pending.", type:"warning", read:false, ts:"2025-07-15 09:00" },
];
 
/* ─────────────────────────────────────────────────────────────────────────────
   SCORE ENGINE
───────────────────────────────────────────────────────────────────────────── */
function computeScore(goal, quarter) {
  const ach = goal.achievements[quarter];
  if (ach === 0 && goal.uom !== "Zero-based") return 0;
  if (ach === "" || ach === null || ach === undefined) return 0;
  if (goal.uom === "Numeric (Min)" || goal.uom === "Percentage (Min)") {
    return Math.min(150, Math.round((parseFloat(ach) / parseFloat(goal.target)) * 100));
  }
  if (goal.uom === "Numeric (Max)" || goal.uom === "Percentage (Max)") {
    if (parseFloat(ach) === 0) return 100;
    return Math.min(150, Math.round((parseFloat(goal.target) / parseFloat(ach)) * 100));
  }
  if (goal.uom === "Timeline") {
    if (!ach) return 0;
    return new Date(ach) <= new Date(goal.target) ? 100 : Math.max(0, Math.round(100 - ((new Date(ach)-new Date(goal.target))/(1000*60*60*24))*5));
  }
  if (goal.uom === "Zero-based") return parseFloat(ach) === 0 ? 100 : 0;
  return 0;
}
 
function weightedScore(goals, quarter) {
  const approved = goals.filter(g=>g.approvalStatus==="approved");
  if (!approved.length) return 0;
  const totalW = approved.reduce((s,g)=>s+g.weightage,0);
  if (!totalW) return 0;
  return Math.round(approved.reduce((s,g)=>s+(computeScore(g,quarter)*g.weightage),0)/totalW);
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   COLOUR HELPERS
───────────────────────────────────────────────────────────────────────────── */
const C = {
  navy:"#042C53", blue:"#185FA5", teal:"#0F6E56", amber:"#854F0B",
  red:"#A32D2D", purple:"#534AB7", gray:"#5F5E5A", lightGray:"#888780",
  border:"#D3D1C7", bg:"#f5f4f0", white:"#ffffff",
};
const scoreColor = s => s>=80?"#0F6E56":s>=50?"#854F0B":"#A32D2D";
const ROLE_BADGE_STYLE = {
  employee:{ bg:"#E6F1FB", color:"#185FA5" },
  manager: { bg:"#E1F5EE", color:"#0F6E56" },
  admin:   { bg:"#FAEEDA", color:"#854F0B" },
};
 
/* ─────────────────────────────────────────────────────────────────────────────
   TINY UI PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */
function Badge({ label, bg, color, size=12 }) {
  return <span style={{ background:bg, color, fontSize:size, fontWeight:700, padding:"2px 9px", borderRadius:20, whiteSpace:"nowrap" }}>{label}</span>;
}
function ApprovalBadge({ status }) {
  const map = { pending:{bg:"#FAEEDA",color:"#854F0B",l:"⏳ Pending"}, approved:{bg:"#E1F5EE",color:"#0F6E56",l:"✓ Approved"}, rejected:{bg:"#FCEBEB",color:"#A32D2D",l:"↩ Returned"} };
  const m = map[status]||map.pending;
  return <Badge label={m.l} bg={m.bg} color={m.color} />;
}
function StatusBadge({ status }) {
  const map = { "Not Started":{bg:"#F1EFE8",color:"#5F5E5A"}, "On Track":{bg:"#E1F5EE",color:"#0F6E56"}, "Completed":{bg:"#E6F1FB",color:"#185FA5"} };
  const m = map[status]||map["Not Started"];
  return <Badge label={status} bg={m.bg} color={m.color} />;
}
function ProgressBar({ pct, color }) {
  const c = color||scoreColor(pct);
  return (
    <div style={{ background:"#e8e6e0", borderRadius:4, height:8, overflow:"hidden" }}>
      <div style={{ width:Math.min(100,pct)+"%", height:"100%", background:c, borderRadius:4, transition:"width .4s ease" }} />
    </div>
  );
}
function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"20px 24px", ...style }}>{children}</div>;
}
function SectionHead({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
      <div>
        <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:C.navy }}>{title}</h2>
        {sub && <p style={{ margin:"4px 0 0", color:C.gray, fontSize:13 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function Alert({ type, msg }) {
  const map = { error:{bg:"#FCEBEB",bdr:"#F09595",color:"#A32D2D",icon:"⚠️"}, success:{bg:"#E1F5EE",bdr:"#5DCAA5",color:"#0F6E56",icon:"✓"}, info:{bg:"#E6F1FB",bdr:"#85B7EB",color:"#185FA5",icon:"ℹ️"}, warning:{bg:"#FAEEDA",bdr:"#FAC775",color:"#854F0B",icon:"⚠️"} };
  const m = map[type]||map.info;
  return <div style={{ background:m.bg, border:`1px solid ${m.bdr}`, borderRadius:8, padding:"10px 14px", color:m.color, fontSize:13, display:"flex", gap:8, alignItems:"flex-start" }}><span>{m.icon}</span><span>{msg}</span></div>;
}
function StatCard({ label, value, color, sub, icon }) {
  return (
    <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"18px 20px", flex:1, minWidth:130 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:26, fontWeight:800, color:color||C.navy }}>{value}</div>
          <div style={{ fontSize:13, fontWeight:600, color:"#2C2C2A", marginTop:2 }}>{label}</div>
          {sub && <div style={{ fontSize:11, color:C.lightGray, marginTop:2 }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize:24, opacity:0.6 }}>{icon}</span>}
      </div>
    </div>
  );
}
function Btn({ label, onClick, variant="primary", disabled=false, small=false, style={} }) {
  const styles = {
    primary:   { bg:C.blue, color:"#fff", border:"none" },
    success:   { bg:C.teal, color:"#fff", border:"none" },
    danger:    { bg:"#A32D2D", color:"#fff", border:"none" },
    warning:   { bg:"#854F0B", color:"#fff", border:"none" },
    ghost:     { bg:"#F1EFE8", color:"#2C2C2A", border:`1px solid ${C.border}` },
    outline:   { bg:"transparent", color:C.blue, border:`1px solid ${C.blue}` },
  };
  const s = styles[variant]||styles.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small?"5px 12px":"9px 20px", background:disabled?"#D3D1C7":s.bg,
      color:disabled?"#888780":s.color, border:disabled?"none":s.border,
      borderRadius:8, fontSize:small?12:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer",
      transition:"all .15s", opacity:disabled?0.7:1, ...style
    }}>{label}</button>
  );
}
function Avatar({ name, size=34, bg="#E6F1FB", color=C.blue }) {
  const initials = name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  return <div style={{ width:size, height:size, borderRadius:"50%", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:size*0.38, flexShrink:0 }}>{initials}</div>;
}
function Input({ label, required, error, hint, children, style={} }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, ...style }}>
      {label && <label style={{ fontSize:13, fontWeight:700, color:"#2C2C2A" }}>{label}{required&&<span style={{ color:"#A32D2D" }}> *</span>}{hint&&<span style={{ fontWeight:400, color:C.lightGray, marginLeft:6 }}>{hint}</span>}</label>}
      {children}
      {error && <span style={{ fontSize:12, color:"#A32D2D" }}>⚠ {error}</span>}
    </div>
  );
}
const iStyle = { width:"100%", borderRadius:7, border:`1px solid ${C.border}`, padding:"9px 12px", fontSize:14, background:C.white, outline:"none", boxSizing:"border-box" };
 
/* ─────────────────────────────────────────────────────────────────────────────
   NOTIFICATION BELL
───────────────────────────────────────────────────────────────────────────── */
function NotifBell({ notifs, onRead }) {
  const [open, setOpen] = useState(false);
  const unread = notifs.filter(n=>!n.read).length;
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(p=>!p)} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", borderRadius:8, padding:"6px 10px", cursor:"pointer", position:"relative", fontSize:16 }}>
        🔔 {unread>0 && <span style={{ position:"absolute", top:-4, right:-4, background:"#E24B4A", color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position:"absolute", right:0, top:40, background:C.white, borderRadius:12, border:`1px solid ${C.border}`, minWidth:320, maxHeight:400, overflowY:"auto", zIndex:1000, boxShadow:"0 8px 30px rgba(0,0,0,0.15)" }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700, color:C.navy, fontSize:14 }}>Notifications</span>
            <button onClick={()=>{onRead();setOpen(false);}} style={{ fontSize:11, color:C.blue, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Mark all read</button>
          </div>
          {notifs.length===0 && <p style={{ padding:16, color:C.lightGray, textAlign:"center", fontSize:13 }}>All caught up! 🎉</p>}
          {notifs.map(n=>(
            <div key={n.id} style={{ padding:"10px 16px", borderBottom:`1px solid #f1f0ec`, background:n.read?"transparent":"#f0f7ff" }}>
              <div style={{ fontSize:13, color:"#2C2C2A" }}>{n.msg}</div>
              <div style={{ fontSize:11, color:C.lightGray, marginTop:3 }}>{n.ts}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   TOP NAV
───────────────────────────────────────────────────────────────────────────── */
const NAV_LINKS = {
  employee:[
    { key:"dashboard", label:"🏠 Dashboard" },
    { key:"my-goals",  label:"🎯 My Goals" },
    { key:"create-goal", label:"＋ New Goal" },
  ],
  manager:[
    { key:"dashboard",     label:"🏠 Dashboard" },
    { key:"approve-goals", label:"✅ Approve Goals" },
    { key:"checkins",      label:"💬 Check-ins" },
    { key:"share-goal",    label:"📤 Share Goal" },
  ],
  admin:[
    { key:"dashboard",    label:"🏠 Dashboard" },
    { key:"manage-goals", label:"⚙️ Manage Goals" },
    { key:"reports",      label:"📊 Reports" },
    { key:"cycle-mgmt",   label:"📅 Cycle Mgmt" },
    { key:"audit-log",    label:"📜 Audit Log" },
    { key:"share-goal",   label:"📤 Share Goal" },
  ],
};
 
function TopNav({ user, view, setView, onLogout, notifs, onReadNotifs }) {
  const links = NAV_LINKS[user.role]||[];
  const rb = ROLE_BADGE_STYLE[user.role]||{};
  return (
    <div style={{ background:C.navy, color:"#fff" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:16, padding:"0 20px", height:58 }}>
        <div style={{ fontWeight:900, fontSize:20, letterSpacing:-1, whiteSpace:"nowrap", marginRight:8 }}>⚛️ AtomQuest</div>
        <div style={{ display:"flex", gap:2, flex:1, overflowX:"auto" }}>
          {links.map(l=>(
            <button key={l.key} onClick={()=>setView(l.key)} style={{
              background:view===l.key?"rgba(255,255,255,0.18)":"transparent",
              border:"none", color:"#fff", padding:"7px 13px", borderRadius:7,
              fontSize:13, cursor:"pointer", whiteSpace:"nowrap",
              fontWeight:view===l.key?700:400, borderBottom:view===l.key?"2px solid #85B7EB":"2px solid transparent"
            }}>{l.label}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <NotifBell notifs={notifs} onRead={onReadNotifs} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Avatar name={user.name} size={30} />
            <div>
              <div style={{ fontSize:13, fontWeight:600, lineHeight:1.2 }}>{user.name}</div>
              <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:10, background:rb.bg, color:rb.color }}>{user.role.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", borderRadius:7, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>← Logout</button>
        </div>
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────────────────────────────────────── */
function Login({ onLogin }) {
  const [sel, setSel] = useState(null);
  const CARDS = [
    { key:"employee1", role:"Employee",    name:"Priya Sharma",  dept:"Sales",      icon:"👤", color:"#185FA5", desc:"Create goals, log achievements, track quarterly progress" },
    { key:"manager1",  role:"Manager (L1)",name:"Vikram Nair",   dept:"Sales",      icon:"👔", color:"#0F6E56", desc:"Review & approve goals, conduct check-ins, log feedback" },
    { key:"admin",     role:"Admin / HR",  name:"Suresh Kumar",  dept:"HR",         icon:"🛡️", color:"#854F0B", desc:"Manage cycles, org hierarchy, audit trail, exceptions" },
  ];
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#042C53 0%,#185FA5 55%,#0F6E56 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.white, borderRadius:22, padding:"44px 40px", maxWidth:560, width:"100%", boxShadow:"0 30px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center", marginBottom:34 }}>
          <div style={{ fontSize:44, marginBottom:10 }}>⚛️</div>
          <h1 style={{ fontSize:28, fontWeight:900, margin:"0 0 6px", color:C.navy, letterSpacing:-1 }}>AtomQuest Portal</h1>
          <p style={{ color:C.gray, fontSize:14, margin:0 }}>Goal Setting & Tracking · Hackathon 1.0</p>
          <div style={{ marginTop:12, padding:"6px 16px", background:"#E1F5EE", borderRadius:8, display:"inline-block", fontSize:12, color:"#0F6E56", fontWeight:600 }}>
            FY 2025–26 · Cycle: Goal Setting Phase Open
          </div>
        </div>
        <p style={{ fontSize:13, color:C.lightGray, textAlign:"center", marginBottom:18, fontWeight:600 }}>SELECT YOUR ROLE TO DEMO</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {CARDS.map(c=>(
            <div key={c.key} onClick={()=>setSel(c.key)} style={{
              border:sel===c.key?`2.5px solid ${c.color}`:`1.5px solid ${C.border}`,
              borderRadius:12, padding:"16px 18px", background:sel===c.key?c.color+"10":C.white,
              cursor:"pointer", transition:"all .15s", display:"flex", alignItems:"center", gap:14
            }}>
              <span style={{ fontSize:26 }}>{c.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:15, color:C.navy }}>{c.role}</div>
                <div style={{ fontSize:13, color:C.gray }}>{c.name} · {c.dept}</div>
                <div style={{ fontSize:12, color:C.lightGray, marginTop:3 }}>{c.desc}</div>
              </div>
              <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${sel===c.key?c.color:C.border}`, background:sel===c.key?c.color:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {sel===c.key && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>}
              </div>
            </div>
          ))}
        </div>
        <Btn label={sel?"Enter Portal →":"Select a role first"} onClick={()=>onLogin(USERS[sel])} disabled={!sel} style={{ width:"100%", padding:"13px 0", fontSize:15, borderRadius:10 }} />
        <div style={{ marginTop:20, background:"#F1EFE8", borderRadius:10, padding:"12px 16px" }}>
          <p style={{ margin:0, fontSize:12, color:C.gray, fontWeight:600, marginBottom:6 }}>🔐 Demo Credentials</p>
          {[["Employee","priya@atomcorp.in","Priya123"],["Manager","vikram@atomcorp.in","Vikram123"],["Admin","suresh@atomcorp.in","Suresh123"]].map(([r,e,p])=>(
            <div key={r} style={{ fontSize:12, color:C.gray, display:"flex", gap:12, marginBottom:3 }}>
              <span style={{ fontWeight:700, minWidth:70 }}>{r}:</span><span>{e}</span><span style={{ color:C.blue }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   EMPLOYEE DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
function EmpDashboard({ user, goals, setView, activeQ, setActiveQ }) {
  const myGoals = goals.filter(g=>g.employeeId===user.id);
  const approved = myGoals.filter(g=>g.approvalStatus==="approved");
  const pending  = myGoals.filter(g=>g.approvalStatus==="pending");
  const totalW   = myGoals.reduce((s,g)=>s+g.weightage,0);
  const ws       = weightedScore(myGoals, activeQ);
  const wValid   = totalW===100;
 
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:C.navy, margin:"0 0 4px" }}>Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p style={{ color:C.gray, margin:0, fontSize:14 }}>FY 2025–26 · {user.dept} · Goal Setting Phase Active</p>
      </div>
 
      {!wValid && myGoals.length>0 && <div style={{ marginBottom:16 }}><Alert type="warning" msg={`Total weightage is ${totalW}% — must equal exactly 100%. Please adjust your goals.`}/></div>}
      {pending.length>0 && <div style={{ marginBottom:16 }}><Alert type="info" msg={`${pending.length} goal(s) awaiting manager approval. You cannot log achievements until approved.`}/></div>}
 
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
        <StatCard label="Total Goals" value={myGoals.length} color={C.navy} sub={`Max 8 allowed`} icon="🎯" />
        <StatCard label="Approved"    value={approved.length} color={C.teal} icon="✅" />
        <StatCard label="Pending"     value={pending.length}  color={C.amber} icon="⏳" />
        <StatCard label="Total Weightage" value={totalW+"%"} color={wValid?C.teal:"#A32D2D"} sub={wValid?"✓ Valid — equals 100%":"✗ Must equal 100%"} icon="⚖️" />
        <StatCard label="Weighted Score" value={ws+"%"} color={scoreColor(ws)} sub={activeQ} icon="📈" />
      </div>
 
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#2C2C2A" }}>Quarter view:</span>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {QUARTERS.map(q=>(
            <button key={q} onClick={()=>setActiveQ(q)} style={{ padding:"5px 12px", borderRadius:7, border:`1.5px solid ${activeQ===q?C.blue:C.border}`, background:activeQ===q?C.blue:C.white, color:activeQ===q?"#fff":"#2C2C2A", fontSize:12, fontWeight:activeQ===q?700:400, cursor:"pointer" }}>{q}</button>
          ))}
        </div>
      </div>
 
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
        {myGoals.length===0 && (
          <Card style={{ textAlign:"center", padding:40 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
            <p style={{ color:C.lightGray, margin:"0 0 16px", fontSize:15 }}>No goals yet. Start by creating your first goal for FY 2025–26.</p>
            <Btn label="＋ Create First Goal" onClick={()=>setView("create-goal")} />
          </Card>
        )}
        {myGoals.map(g=>{
          const sc = computeScore(g, activeQ);
          return (
            <Card key={g.id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontWeight:800, fontSize:16, color:C.navy, marginBottom:5 }}>
                    {g.title}
                    {g.isShared && <Badge label="SHARED KPI" bg="#E6F1FB" color={C.blue} size={10} />}
                    {g.locked   && <Badge label="🔒 Locked"  bg="#F1EFE8" color={C.gray} size={10} />}
                  </div>
                  <div style={{ fontSize:13, color:C.gray, marginBottom:8 }}>{g.thrustArea} · {g.uom} · Target: <strong>{g.target}</strong></div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <ApprovalBadge status={g.approvalStatus}/>
                    <StatusBadge status={g.status}/>
                    <Badge label={`Weight: ${g.weightage}%`} bg={g.weightage<10?"#FCEBEB":"#E6F1FB"} color={g.weightage<10?"#A32D2D":C.blue}/>
                  </div>
                </div>
                <div style={{ textAlign:"center", minWidth:80 }}>
                  <div style={{ fontSize:28, fontWeight:900, color:scoreColor(sc) }}>{sc}<span style={{ fontSize:14 }}>%</span></div>
                  <div style={{ fontSize:11, color:C.lightGray }}>Score · {activeQ.split(" ")[0]}</div>
                </div>
              </div>
              <div style={{ marginTop:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.lightGray, marginBottom:5 }}>
                  <span>Achievement: <strong style={{ color:"#2C2C2A" }}>{g.achievements[activeQ]||"—"}</strong> / Target: {g.target}</span>
                  <span>{sc}%</span>
                </div>
                <ProgressBar pct={sc} />
              </div>
              {g.checkinComments[activeQ] && (
                <div style={{ marginTop:10, background:"#EAF3DE", border:"1px solid #C0DD97", borderRadius:8, padding:"8px 12px", fontSize:13, color:"#27500A" }}>
                  💬 Manager feedback: "{g.checkinComments[activeQ]}"
                </div>
              )}
            </Card>
          );
        })}
      </div>
 
      {myGoals.length<8 && (
        <Btn label="＋ Add New Goal" onClick={()=>setView("create-goal")} variant="primary" />
      )}
      {myGoals.length>=8 && <Alert type="warning" msg="You have reached the maximum of 8 goals. Remove or wait for admin to unlock a goal before adding more."/>}
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   CREATE GOAL
───────────────────────────────────────────────────────────────────────────── */
function CreateGoal({ user, goals, onSave, onCancel }) {
  const myGoals = goals.filter(g=>g.employeeId===user.id);
  const usedW   = myGoals.reduce((s,g)=>s+g.weightage,0);
  const remaining = 100 - usedW;
  const [form, setForm] = useState({ title:"", thrustArea:THRUST_AREAS[0], description:"", uom:"Numeric (Min)", target:"", weightage:"" });
  const [errors, setErrors] = useState({});
 
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Goal title is required.";
    if (!form.target) e.target = "Target value is required.";
    if (form.uom==="Timeline" && form.target && isNaN(Date.parse(form.target))) e.target = "Enter a valid date.";
    const w = parseInt(form.weightage);
    if (isNaN(w) || w<10)       e.weightage = "Minimum weightage per goal is 10%.";
    else if (w>remaining)        e.weightage = `Only ${remaining}% remaining. Total must equal 100%.`;
    else if (w>90)               e.weightage = "Maximum weightage per single goal is 90%.";
    if (myGoals.length>=8)       e.title = "Maximum 8 goals per employee. Please remove a goal first.";
    return e;
  };
 
  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const isTimeline = form.uom==="Timeline";
    const newGoal = {
      id:"g"+Date.now(), employeeId:user.id,
      title:form.title.trim(), thrustArea:form.thrustArea, description:form.description.trim(), uom:form.uom,
      target:isTimeline?form.target:parseFloat(form.target),
      weightage:parseInt(form.weightage), status:"Not Started",
      achievements: isTimeline?mkAchStr():mkAch(),
      approvalStatus:"pending", locked:false, isShared:false,
      createdAt:new Date().toISOString().split("T")[0], checkinComments:{}
    };
    onSave(newGoal);
  };
 
  const set = (k,v) => { setForm(p=>({...p,[k]:v})); if(errors[k]) setErrors(p=>({...p,[k]:undefined})); };
 
  return (
    <div>
      <SectionHead title="Create New Goal" sub={`${myGoals.length}/8 goals used · ${usedW}% weightage allocated · ${remaining}% remaining`} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>
        <Card>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Input label="Goal Title" required error={errors.title} hint="Be specific and measurable">
              <input style={iStyle} value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Increase Q3 Revenue by 20%" />
            </Input>
            <Input label="Thrust Area" required>
              <select style={iStyle} value={form.thrustArea} onChange={e=>set("thrustArea",e.target.value)}>
                {THRUST_AREAS.map(a=><option key={a}>{a}</option>)}
              </select>
            </Input>
            <Input label="Description / Rationale">
              <textarea style={{...iStyle,height:80,resize:"vertical"}} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Provide context — why is this goal important?" />
            </Input>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Unit of Measurement (UoM)" required>
                <select style={iStyle} value={form.uom} onChange={e=>set("uom",e.target.value)}>
                  {UOM_TYPES.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </Input>
              <Input label="Target" required error={errors.target} hint={form.uom==="Timeline"?"(date)":""}>
                <input style={iStyle} type={form.uom==="Timeline"?"date":"number"} value={form.target} onChange={e=>set("target",e.target.value)} placeholder={form.uom==="Timeline"?"":"e.g. 5000000"} />
              </Input>
            </div>
            <Input label="Weightage (%)" required error={errors.weightage} hint={`Min 10% · Max ${remaining}% remaining`}>
              <input style={iStyle} type="number" min={10} max={remaining} value={form.weightage} onChange={e=>set("weightage",e.target.value)} placeholder={`Between 10 and ${remaining}`} />
              <div style={{ marginTop:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.lightGray, marginBottom:4 }}>
                  <span>Used: {usedW}%</span><span>This goal: {form.weightage||0}%</span><span>Remaining after: {remaining-(parseInt(form.weightage)||0)}%</span>
                </div>
                <ProgressBar pct={usedW+(parseInt(form.weightage)||0)} color={(usedW+(parseInt(form.weightage)||0))>100?"#A32D2D":C.blue}/>
              </div>
            </Input>
            <div style={{ display:"flex", gap:10, paddingTop:4 }}>
              <Btn label="Submit for Approval" onClick={handleSubmit} variant="success" />
              <Btn label="Cancel" onClick={onCancel} variant="ghost" />
            </div>
          </div>
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card style={{ background:"#F0F7FF", border:"1px solid #85B7EB" }}>
            <p style={{ margin:"0 0 10px", fontWeight:700, color:C.navy, fontSize:14 }}>📋 Validation Rules</p>
            {[
              ["Total weightage","Must equal 100%",usedW===100],
              ["Min per goal","≥ 10% weightage",true],
              ["Max goals","8 goals per employee",myGoals.length<8],
              ["Goal lock","Locked after manager approval",true],
            ].map(([k,v,ok])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                <span style={{ color:C.gray }}>{k}</span>
                <span style={{ color:ok?C.teal:"#A32D2D", fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card style={{ background:"#FFFBF0", border:"1px solid #FAC775" }}>
            <p style={{ margin:"0 0 10px", fontWeight:700, color:"#633806", fontSize:14 }}>📐 UoM Guide</p>
            {UOM_TYPES.map(u=>(
              <div key={u.value} style={{ marginBottom:8, paddingBottom:8, borderBottom:"0.5px solid #fde9a6" }}>
                <div style={{ fontWeight:700, fontSize:12, color:"#633806" }}>{u.value}</div>
                <div style={{ fontSize:11, color:C.gray }}>{u.label}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   MY GOALS (Employee achievement tracking)
───────────────────────────────────────────────────────────────────────────── */
function MyGoals({ user, goals, activeQ, setActiveQ, onUpdateAch }) {
  const myGoals = goals.filter(g=>g.employeeId===user.id);
  const [achInputs, setAchInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});
  const [editing, setEditing] = useState({});
 
  const startEdit = g => {
    setEditing(p=>({...p,[g.id]:true}));
    setAchInputs(p=>({...p,[g.id]:g.achievements[activeQ]||""}));
    setStatusInputs(p=>({...p,[g.id]:g.status}));
  };
  const saveAch = g => {
    const val = g.uom==="Timeline"?achInputs[g.id]:parseFloat(achInputs[g.id])||0;
    onUpdateAch(g.id, activeQ, val, statusInputs[g.id]);
    setEditing(p=>({...p,[g.id]:false}));
  };
 
  return (
    <div>
      <SectionHead title="My Goals & Achievements" sub={`FY 2025–26 · ${myGoals.length} goal(s) · Log your progress each quarter`} />
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {QUARTERS.map(q=>(
          <button key={q} onClick={()=>setActiveQ(q)} style={{ padding:"6px 14px", borderRadius:8, border:`1.5px solid ${activeQ===q?C.blue:C.border}`, background:activeQ===q?C.blue:C.white, color:activeQ===q?"#fff":"#2C2C2A", fontSize:13, fontWeight:activeQ===q?700:400, cursor:"pointer" }}>{q}</button>
        ))}
      </div>
      {myGoals.length===0 && <Card style={{ textAlign:"center", padding:40 }}><p style={{ color:C.lightGray }}>No goals yet.</p></Card>}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {myGoals.map(g=>{
          const sc = computeScore(g, activeQ);
          const isEdit = editing[g.id];
          return (
            <Card key={g.id}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:16, color:C.navy, marginBottom:4 }}>
                    {g.title}&nbsp;
                    {g.isShared && <Badge label="SHARED KPI" bg="#E6F1FB" color={C.blue} size={10}/>}
                    {g.locked   && <Badge label="🔒"         bg="#F1EFE8" color={C.gray} size={10}/>}
                  </div>
                  <div style={{ fontSize:13, color:C.gray, marginBottom:8 }}>
                    {g.thrustArea} · {g.uom} · Target: <strong>{g.target}</strong> · Weight: <strong>{g.weightage}%</strong>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <ApprovalBadge status={g.approvalStatus}/>
                    <StatusBadge status={g.status}/>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:30, fontWeight:900, color:scoreColor(sc) }}>{sc}%</div>
                  <div style={{ fontSize:11, color:C.lightGray }}>Score</div>
                </div>
              </div>
 
              <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {QUARTERS.map(q=>{
                  const qs = computeScore(g, q);
                  return (
                    <div key={q} style={{ background:q===activeQ?"#E6F1FB":"#F5F4F0", borderRadius:8, padding:"8px 12px", border:q===activeQ?`1px solid ${C.blue}`:"1px solid transparent" }}>
                      <div style={{ fontSize:11, color:C.lightGray }}>{q.split(" ")[0]}</div>
                      <div style={{ fontWeight:700, color:scoreColor(qs), fontSize:16 }}>{qs}%</div>
                      <div style={{ fontSize:11, color:C.gray }}>Ach: {g.achievements[q]||"—"}</div>
                    </div>
                  );
                })}
              </div>
 
              {g.approvalStatus==="approved" && (
                <div style={{ marginTop:14, borderTop:`1px solid #f1f0ec`, paddingTop:14 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#2C2C2A", marginBottom:10 }}>Update Achievement — {activeQ}</div>
                  {isEdit ? (
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                      <div>
                        <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:3 }}>Actual Achievement</label>
                        <input type={g.uom==="Timeline"?"date":"number"} value={achInputs[g.id]||""} onChange={e=>setAchInputs(p=>({...p,[g.id]:e.target.value}))}
                          style={{ ...iStyle, width:160 }} placeholder={g.uom==="Timeline"?"":"Enter actual value"}/>
                      </div>
                      <div>
                        <label style={{ fontSize:12, color:C.gray, display:"block", marginBottom:3 }}>Status</label>
                        <select value={statusInputs[g.id]||g.status} onChange={e=>setStatusInputs(p=>({...p,[g.id]:e.target.value}))} style={{...iStyle,width:140}}>
                          {STATUSES.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ marginTop:16, display:"flex", gap:8 }}>
                        <Btn label="Save" onClick={()=>saveAch(g)} variant="success" small />
                        <Btn label="Cancel" onClick={()=>setEditing(p=>({...p,[g.id]:false}))} variant="ghost" small />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ fontSize:14, color:"#2C2C2A" }}>
                        Current: <strong>{g.achievements[activeQ]||"—"}</strong> / Target: {g.target}
                      </span>
                      {!g.isShared && <Btn label="✏ Update" onClick={()=>startEdit(g)} variant="outline" small />}
                    </div>
                  )}
                  {g.checkinComments[activeQ] && (
                    <div style={{ marginTop:10, background:"#EAF3DE", border:"1px solid #9FE1CB", borderRadius:8, padding:"8px 12px", fontSize:13, color:"#085041" }}>
                      💬 Manager: "{g.checkinComments[activeQ]}"
                    </div>
                  )}
                </div>
              )}
              {g.approvalStatus==="pending" && (
                <div style={{ marginTop:10 }}><Alert type="info" msg="Awaiting manager approval. Achievement logging will unlock after approval."/></div>
              )}
              {g.approvalStatus==="rejected" && (
                <div style={{ marginTop:10 }}><Alert type="error" msg="Goal returned for rework. Please edit and resubmit."/></div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   MANAGER DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
function MgrDashboard({ user, goals, allUsers, setView, activeQ, setActiveQ }) {
  const myEmps = Object.values(allUsers).filter(u=>u.managerId===user.id);
  const teamGoals = goals.filter(g=>myEmps.some(e=>e.id===g.employeeId));
  const pending = teamGoals.filter(g=>g.approvalStatus==="pending");
  const approved = teamGoals.filter(g=>g.approvalStatus==="approved");
 
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:C.navy, margin:"0 0 4px" }}>Manager Dashboard</h1>
        <p style={{ color:C.gray, fontSize:14, margin:0 }}>{user.name} · {user.dept} · {myEmps.length} Direct Report(s)</p>
      </div>
 
      {pending.length>0 && (
        <div style={{ background:"#FAEEDA", border:"1px solid #FAC775", borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <span style={{ color:"#633806", fontWeight:700 }}>⚠️ {pending.length} goal(s) pending your approval</span>
          <Btn label="Review & Approve →" onClick={()=>setView("approve-goals")} variant="warning" small />
        </div>
      )}
 
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
        <StatCard label="Team Goals"       value={teamGoals.length} color={C.navy}  icon="🎯" />
        <StatCard label="Pending Approval" value={pending.length}   color={C.amber} icon="⏳" />
        <StatCard label="Approved"         value={approved.length}  color={C.teal}  icon="✅" />
        <StatCard label="Team Members"     value={myEmps.length}    color={C.blue}  icon="👥" />
      </div>
 
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        {QUARTERS.map(q=>(
          <button key={q} onClick={()=>setActiveQ(q)} style={{ padding:"5px 12px", borderRadius:7, border:`1.5px solid ${activeQ===q?C.blue:C.border}`, background:activeQ===q?C.blue:C.white, color:activeQ===q?"#fff":"#2C2C2A", fontSize:12, fontWeight:activeQ===q?700:400, cursor:"pointer" }}>{q}</button>
        ))}
      </div>
 
      <SectionHead title={`Team Progress — ${activeQ}`} />
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {myEmps.map(emp=>{
          const eg = goals.filter(g=>g.employeeId===emp.id&&g.approvalStatus==="approved");
          const ws = weightedScore(eg, activeQ);
          const totalW = eg.reduce((s,g)=>s+g.weightage,0);
          return (
            <Card key={emp.id}>
              <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                <Avatar name={emp.name} size={44}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:16, color:C.navy }}>{emp.name}</div>
                  <div style={{ fontSize:13, color:C.gray }}>{emp.dept} · {eg.length} approved goals · Wt: {totalW}%{totalW===100?" ✓":""}</div>
                  <div style={{ marginTop:8 }}><ProgressBar pct={ws}/></div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:28, fontWeight:900, color:scoreColor(ws) }}>{ws}%</div>
                  <div style={{ fontSize:11, color:C.lightGray }}>Weighted Score</div>
                </div>
              </div>
              <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
                {eg.map(g=>{
                  const sc=computeScore(g,activeQ);
                  return (
                    <div key={g.id} style={{ background:"#F5F4F0", borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ fontSize:11, color:C.lightGray, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.title}</div>
                      <div style={{ fontWeight:700, color:scoreColor(sc) }}>{sc}% <span style={{ fontWeight:400, color:C.lightGray, fontSize:11 }}>({g.weightage}%)</span></div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   APPROVE GOALS
───────────────────────────────────────────────────────────────────────────── */
function ApproveGoals({ user, goals, allUsers, onApprove, onReject }) {
  const myEmps = Object.values(allUsers).filter(u=>u.managerId===user.id);
  const pending = goals.filter(g=>g.approvalStatus==="pending"&&myEmps.some(e=>e.id===g.employeeId));
  const [edits, setEdits] = useState({});
  const [isEditing, setIsEditing] = useState({});
 
  const startEdit = g => {
    setIsEditing(p=>({...p,[g.id]:true}));
    setEdits(p=>({...p,[g.id]:{target:g.target,weightage:g.weightage}}));
  };
 
  if (!pending.length) return (
    <div>
      <SectionHead title="Approve Goals" />
      <Card style={{ textAlign:"center", padding:40 }}>
        <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
        <p style={{ color:C.lightGray, fontSize:15 }}>All caught up — no pending approvals.</p>
      </Card>
    </div>
  );
 
  return (
    <div>
      <SectionHead title={`Approve Goals (${pending.length} Pending)`} sub="Review each goal carefully. You may edit targets and weightage before approving. Goals are locked after approval." />
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {pending.map(g=>{
          const emp = allUsers[g.employeeId];
          const currEdit = edits[g.id]||{target:g.target,weightage:g.weightage};
          const inlineEdit = isEditing[g.id];
          return (
            <Card key={g.id}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <Avatar name={emp?.name||"?"} size={40}/>
                  <div>
                    <div style={{ fontWeight:800, fontSize:17, color:C.navy }}>{g.title}</div>
                    <div style={{ fontSize:13, color:C.gray }}>{emp?.name} · {emp?.dept} · Submitted {g.createdAt}</div>
                  </div>
                </div>
                <ApprovalBadge status={g.approvalStatus}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginBottom:14 }}>
                {[["Thrust Area",g.thrustArea],["UoM",g.uom],["Description",g.description||"—"]].map(([k,v])=>(
                  <div key={k} style={{ background:"#F5F4F0", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:11, color:C.lightGray }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#2C2C2A" }}>{v}</div>
                  </div>
                ))}
                <div style={{ background:"#F5F4F0", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, color:C.lightGray }}>Target</div>
                  {inlineEdit
                    ? <input type={g.uom==="Timeline"?"date":"number"} value={currEdit.target} onChange={e=>setEdits(p=>({...p,[g.id]:{...currEdit,target:e.target.value}}))} style={{...iStyle,padding:"5px 8px",width:"100%"}}/>
                    : <div style={{ fontSize:14, fontWeight:700, color:"#2C2C2A" }}>{g.target}</div>}
                </div>
                <div style={{ background:"#F5F4F0", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, color:C.lightGray }}>Weightage</div>
                  {inlineEdit
                    ? <input type="number" min={10} max={100} value={currEdit.weightage} onChange={e=>setEdits(p=>({...p,[g.id]:{...currEdit,weightage:parseInt(e.target.value)||0}}))} style={{...iStyle,padding:"5px 8px",width:"100%"}}/>
                    : <div style={{ fontSize:14, fontWeight:700, color:"#2C2C2A" }}>{g.weightage}%</div>}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {inlineEdit ? (
                  <>
                    <Btn label="✓ Approve with Edits" onClick={()=>{onApprove(g.id,{target:currEdit.target,weightage:currEdit.weightage});setIsEditing(p=>({...p,[g.id]:false}));}} variant="success"/>
                    <Btn label="Cancel Edit" onClick={()=>setIsEditing(p=>({...p,[g.id]:false}))} variant="ghost"/>
                  </>
                ) : (
                  <>
                    <Btn label="✓ Approve As-Is" onClick={()=>onApprove(g.id,{})} variant="success"/>
                    <Btn label="✏ Edit & Approve" onClick={()=>startEdit(g)} variant="outline"/>
                    <Btn label="↩ Return for Rework" onClick={()=>onReject(g.id)} variant="danger"/>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   CHECK-INS (Manager)
───────────────────────────────────────────────────────────────────────────── */
function Checkins({ user, goals, allUsers, activeQ, setActiveQ, onAddComment }) {
  const myEmps = Object.values(allUsers).filter(u=>u.managerId===user.id);
  const approved = goals.filter(g=>g.approvalStatus==="approved"&&myEmps.some(e=>e.id===g.employeeId));
  const [comments, setComments] = useState({});
 
  const commentKey = (goalId,q) => `${goalId}_${q}`;
 
  return (
    <div>
      <SectionHead title="Quarterly Check-ins" sub="Review planned vs actual, add structured feedback comments per goal." />
      <div style={{ background:"#E1F5EE", border:"1px solid #5DCAA5", borderRadius:10, padding:"12px 16px", marginBottom:20 }}>
        <p style={{ margin:0, fontWeight:700, color:"#085041", fontSize:14, marginBottom:8 }}>📅 Check-in Schedule</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
          {CHECK_SCHEDULE.map(s=>(
            <div key={s.period} style={{ background:"#fff", borderRadius:7, padding:"8px 12px" }}>
              <div style={{ fontWeight:700, fontSize:12, color:"#085041" }}>{s.period}</div>
              <div style={{ fontSize:11, color:C.gray }}>Window: {s.window}</div>
              <div style={{ fontSize:11, color:"#5F5E5A" }}>{s.action}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {QUARTERS.map(q=>(
          <button key={q} onClick={()=>setActiveQ(q)} style={{ padding:"6px 14px", borderRadius:8, border:`1.5px solid ${activeQ===q?C.blue:C.border}`, background:activeQ===q?C.blue:C.white, color:activeQ===q?"#fff":"#2C2C2A", fontSize:13, fontWeight:activeQ===q?700:400, cursor:"pointer" }}>{q}</button>
        ))}
      </div>
      {approved.length===0 && <Card><p style={{ textAlign:"center", color:C.lightGray }}>No approved team goals yet.</p></Card>}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {approved.map(g=>{
          const emp = allUsers[g.employeeId];
          const sc = computeScore(g, activeQ);
          const ck = commentKey(g.id, activeQ);
          const existing = g.checkinComments[activeQ];
          return (
            <Card key={g.id}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name={emp?.name||"?"} size={38}/>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:C.navy }}>{g.title}</div>
                    <div style={{ fontSize:13, color:C.gray }}>{emp?.name} · {g.thrustArea} · {g.uom}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:26, fontWeight:900, color:scoreColor(sc) }}>{sc}%</div>
                  <div style={{ fontSize:11, color:C.lightGray }}>Score</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:10, marginBottom:14 }}>
                <div style={{ background:"#F5F4F0", borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:11, color:C.lightGray }}>Planned Target</div>
                  <div style={{ fontWeight:800, fontSize:18, color:"#2C2C2A" }}>{g.target}</div>
                </div>
                <div style={{ background:sc>=80?"#E1F5EE":"#FAEEDA", borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:11, color:C.lightGray }}>Actual Achievement</div>
                  <div style={{ fontWeight:800, fontSize:18, color:sc>=80?C.teal:C.amber }}>{g.achievements[activeQ]||"—"}</div>
                </div>
                <div style={{ borderRadius:8, padding:"10px 14px", background:"#F5F4F0" }}>
                  <div style={{ fontSize:11, color:C.lightGray, marginBottom:6 }}>Progress vs Target</div>
                  <ProgressBar pct={sc}/>
                  <div style={{ fontSize:12, color:C.gray, marginTop:4 }}>{sc}% of target achieved</div>
                </div>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:"#2C2C2A", display:"block", marginBottom:8 }}>Check-in Comment</label>
                {existing && (
                  <div style={{ background:"#EAF3DE", border:"1px solid #9FE1CB", borderRadius:8, padding:"8px 12px", fontSize:13, color:"#085041", marginBottom:8 }}>
                    <strong>Current:</strong> {existing}
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  <input value={comments[ck]||""} onChange={e=>setComments(p=>({...p,[ck]:e.target.value}))}
                    placeholder={existing?"Update feedback comment…":"Add structured check-in comment…"}
                    style={{...iStyle,flex:1}}/>
                  <Btn label="Save Comment" onClick={()=>{if(comments[ck]){onAddComment(g.id,activeQ,comments[ck]);setComments(p=>({...p,[ck]:""}));}}} disabled={!comments[ck]} variant="success" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   SHARE GOAL
───────────────────────────────────────────────────────────────────────────── */
function ShareGoal({ user, goals, allUsers, onShare, onCancel }) {
  const employees = Object.values(allUsers).filter(u=>u.role==="employee");
  const [form, setForm] = useState({ targetEmpId:employees[0]?.id||"", title:"", thrustArea:THRUST_AREAS[0], description:"", uom:"Numeric (Min)", target:"", weightage:"" });
  const [errors, setErrors] = useState({});
  const [multi, setMulti] = useState([]);
 
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Goal title is required.";
    if (!form.target) e.target = "Target is required.";
    const w = parseInt(form.weightage);
    if (isNaN(w)||w<10) e.weightage = "Minimum weightage is 10%.";
    const targets = multi.length>0?multi:[form.targetEmpId];
    targets.forEach(tid=>{
      const eg = goals.filter(g=>g.employeeId===tid);
      if(eg.length>=8) e.title = `${allUsers[tid]?.name} already has 8 goals.`;
    });
    return e;
  };
 
  const handleShare = () => {
    const e = validate();
    if(Object.keys(e).length){setErrors(e);return;}
    const targets = multi.length>0?multi:[form.targetEmpId];
    targets.forEach(tid=>{
      const newGoal = {
        id:"sg"+Date.now()+tid, employeeId:tid,
        title:form.title.trim(), thrustArea:form.thrustArea, description:form.description.trim(), uom:form.uom,
        target:form.uom==="Timeline"?form.target:parseFloat(form.target),
        weightage:parseInt(form.weightage), status:"Not Started",
        achievements:form.uom==="Timeline"?mkAchStr():mkAch(),
        approvalStatus:"approved", locked:true, isShared:true, sharedFrom:user.id,
        createdAt:new Date().toISOString().split("T")[0], checkinComments:{}
      };
      onShare(newGoal);
    });
  };
 
  const toggleMulti = id => setMulti(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
 
  return (
    <div>
      <SectionHead title="Share / Push Departmental KPI" sub="Shared goals are auto-approved and locked. Recipients can only adjust weightage, not title or target." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20, alignItems:"start" }}>
        <Card>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Input label="Goal Title" required error={errors.title}>
              <input style={iStyle} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Zero Safety Incidents FY26"/>
            </Input>
            <Input label="Thrust Area" required>
              <select style={iStyle} value={form.thrustArea} onChange={e=>setForm(p=>({...p,thrustArea:e.target.value}))}>
                {THRUST_AREAS.map(a=><option key={a}>{a}</option>)}
              </select>
            </Input>
            <Input label="Description">
              <textarea style={{...iStyle,height:70,resize:"vertical"}} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Describe the KPI..."/>
            </Input>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="UoM" required>
                <select style={iStyle} value={form.uom} onChange={e=>setForm(p=>({...p,uom:e.target.value}))}>
                  {UOM_TYPES.map(u=><option key={u.value} value={u.value}>{u.value}</option>)}
                </select>
              </Input>
              <Input label="Target" required error={errors.target}>
                <input style={iStyle} type={form.uom==="Timeline"?"date":"number"} value={form.target} onChange={e=>setForm(p=>({...p,target:e.target.value}))}/>
              </Input>
            </div>
            <Input label="Weightage (%)" required error={errors.weightage} hint="(employee can adjust this)">
              <input style={iStyle} type="number" min={10} max={90} value={form.weightage} onChange={e=>setForm(p=>({...p,weightage:e.target.value}))} placeholder="Min 10%"/>
            </Input>
            <div style={{ display:"flex", gap:10 }}>
              <Btn label={`Push to ${multi.length>0?multi.length+" Employees":allUsers[form.targetEmpId]?.name}`} onClick={handleShare} variant="success"/>
              <Btn label="Cancel" onClick={onCancel} variant="ghost"/>
            </div>
          </div>
        </Card>
        <div>
          <Card>
            <p style={{ margin:"0 0 12px", fontWeight:700, color:C.navy, fontSize:14 }}>👥 Select Recipients</p>
            <p style={{ margin:"0 0 10px", fontSize:12, color:C.gray }}>Select multiple to push to all at once:</p>
            {employees.map(emp=>{
              const empGoals = goals.filter(g=>g.employeeId===emp.id);
              const checked = multi.includes(emp.id)||(multi.length===0&&form.targetEmpId===emp.id);
              return (
                <div key={emp.id} onClick={()=>multi.length>0?toggleMulti(emp.id):setForm(p=>({...p,targetEmpId:emp.id}))} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, marginBottom:6, background:checked?"#E6F1FB":"transparent", cursor:"pointer", border:`1px solid ${checked?C.blue:C.border}` }}>
                  <input type="checkbox" checked={multi.includes(emp.id)} onChange={()=>toggleMulti(emp.id)} style={{ cursor:"pointer" }}/>
                  <Avatar name={emp.name} size={28}/>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.navy }}>{emp.name}</div>
                    <div style={{ fontSize:11, color:C.gray }}>{emp.dept} · {empGoals.length}/8 goals</div>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card style={{ marginTop:12, background:"#FAEEDA", border:"1px solid #FAC775" }}>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#633806" }}>ℹ Shared Goal Rules</p>
            <ul style={{ margin:"8px 0 0", paddingLeft:16, fontSize:12, color:"#854F0B" }}>
              <li>Title & Target are read-only for recipients</li>
              <li>Auto-approved & locked immediately</li>
              <li>Achievement by primary owner syncs across all linked sheets</li>
              <li>Recipient may only adjust weightage</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
function AdminDashboard({ goals, allUsers, auditLog, setView }) {
  const employees = Object.values(allUsers).filter(u=>u.role==="employee");
  const managers  = Object.values(allUsers).filter(u=>u.role==="manager");
  const approved  = goals.filter(g=>g.approvalStatus==="approved");
  const pending   = goals.filter(g=>g.approvalStatus==="pending");
  const locked    = goals.filter(g=>g.locked);
  const checkinsDone = goals.filter(g=>Object.keys(g.checkinComments).length>0);
 
  const ACTIONS = [
    { icon:"⚙️", title:"Manage Goals",     desc:"Unlock goals, view all, handle exceptions",  key:"manage-goals" },
    { icon:"📊", title:"Reports & Export",  desc:"CSV export, planned vs actual, completion",   key:"reports" },
    { icon:"📅", title:"Cycle Management",  desc:"Configure goal-setting windows and cycles",   key:"cycle-mgmt" },
    { icon:"📜", title:"Audit Trail",       desc:"Full log of all post-lock changes",            key:"audit-log" },
    { icon:"📤", title:"Share / Push Goal", desc:"Push departmental KPIs to employees",         key:"share-goal" },
  ];
 
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:C.navy, margin:"0 0 4px" }}>Admin / HR Control Panel</h1>
        <p style={{ color:C.gray, fontSize:14, margin:0 }}>FY 2025–26 · Organisation-wide governance & oversight</p>
      </div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
        <StatCard label="Employees"     value={employees.length}    color={C.navy}  icon="👤" />
        <StatCard label="Managers"      value={managers.length}     color={C.blue}  icon="👔" />
        <StatCard label="Total Goals"   value={goals.length}        color={C.gray}  icon="🎯" />
        <StatCard label="Approved"      value={approved.length}     color={C.teal}  icon="✅" />
        <StatCard label="Pending"       value={pending.length}      color={C.amber} icon="⏳" />
        <StatCard label="Locked Goals"  value={locked.length}       color={C.purple} icon="🔒" />
        <StatCard label="Check-ins Done" value={checkinsDone.length} color="#3B6D11" icon="💬" />
        <StatCard label="Audit Events"  value={auditLog.length}     color="#993C1D"  icon="📜" />
      </div>
 
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginBottom:24 }}>
        {ACTIONS.map(a=>(
          <button key={a.key} onClick={()=>setView(a.key)} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", textAlign:"left", cursor:"pointer", transition:"box-shadow .15s" }}
            onMouseOver={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
            onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{ fontSize:28, marginBottom:10 }}>{a.icon}</div>
            <div style={{ fontWeight:800, fontSize:15, color:C.navy }}>{a.title}</div>
            <div style={{ fontSize:12, color:C.gray, marginTop:4 }}>{a.desc}</div>
          </button>
        ))}
      </div>
 
      <SectionHead title="Employee Goal Completion Status" />
      <Card>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${C.border}` }}>
                {["Employee","Dept","Manager","Goals","Weightage","Pending","Approved","Check-ins"].map(h=>(
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:C.lightGray, fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp=>{
                const eg = goals.filter(g=>g.employeeId===emp.id);
                const totalW = eg.reduce((s,g)=>s+g.weightage,0);
                const mgr = allUsers[emp.managerId];
                const ci = eg.filter(g=>Object.keys(g.checkinComments).length>0).length;
                return (
                  <tr key={emp.id} style={{ borderBottom:`1px solid #F1EFE8` }}>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Avatar name={emp.name} size={28}/>
                        <span style={{ fontWeight:700, color:C.navy }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"10px 12px", color:C.gray }}>{emp.dept}</td>
                    <td style={{ padding:"10px 12px", color:C.gray }}>{mgr?.name||"—"}</td>
                    <td style={{ padding:"10px 12px" }}><Badge label={`${eg.length}/8`} bg="#F1EFE8" color="#2C2C2A"/></td>
                    <td style={{ padding:"10px 12px" }}><Badge label={totalW+"%"} bg={totalW===100?"#E1F5EE":"#FCEBEB"} color={totalW===100?C.teal:"#A32D2D"}/></td>
                    <td style={{ padding:"10px 12px" }}><Badge label={eg.filter(g=>g.approvalStatus==="pending").length} bg="#FAEEDA" color={C.amber}/></td>
                    <td style={{ padding:"10px 12px" }}><Badge label={eg.filter(g=>g.approvalStatus==="approved").length} bg="#E1F5EE" color={C.teal}/></td>
                    <td style={{ padding:"10px 12px" }}><Badge label={ci+"/"+(eg.filter(g=>g.approvalStatus==="approved").length)} bg={ci>0?"#EAF3DE":"#F1EFE8"} color={ci>0?"#3B6D11":C.gray}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ marginTop:20 }}>
        <SectionHead title="Recent Audit Events" />
        <Card>
          {auditLog.slice(0,6).map((e,i)=>(
            <div key={e.id} style={{ display:"flex", gap:12, padding:"8px 0", borderBottom:i<5?`1px solid #F1EFE8`:"none", alignItems:"flex-start" }}>
              <div style={{ fontSize:11, color:C.lightGray, fontFamily:"monospace", whiteSpace:"nowrap", minWidth:130 }}>{e.timestamp}</div>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:700, color:"#2C2C2A", fontSize:13 }}>{allUsers[e.userId]?.name}</span>
                <span style={{ fontSize:12, color:C.lightGray, margin:"0 6px" }}>·</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.blue }}>{e.action}</span>
                <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>{e.details}</div>
              </div>
            </div>
          ))}
          <button onClick={()=>setView("audit-log")} style={{ marginTop:10, fontSize:13, color:C.blue, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>View all {auditLog.length} events →</button>
        </Card>
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   MANAGE GOALS (Admin)
───────────────────────────────────────────────────────────────────────────── */
function ManageGoals({ goals, allUsers, onUnlock, onReopen }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = goals
    .filter(g=>filter==="all"||(filter==="locked"&&g.locked)||(filter==="pending"&&g.approvalStatus==="pending")||(filter==="shared"&&g.isShared)||(filter==="rejected"&&g.approvalStatus==="rejected"))
    .filter(g=>!search||g.title.toLowerCase().includes(search.toLowerCase())||allUsers[g.employeeId]?.name.toLowerCase().includes(search.toLowerCase()));
  const FILTERS = [["all","All"],["locked","Locked"],["pending","Pending"],["shared","Shared KPI"],["rejected","Returned"]];
  return (
    <div>
      <SectionHead title="Manage All Goals" sub="Admin can unlock goals post-lock, force-approve, and manage exceptions." />
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search goals or employees…" style={{...iStyle,width:220,flex:"none"}}/>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTERS.map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{ padding:"6px 14px", borderRadius:7, border:`1.5px solid ${filter===k?C.blue:C.border}`, background:filter===k?C.blue:C.white, color:filter===k?"#fff":"#2C2C2A", fontSize:12, fontWeight:filter===k?700:400, cursor:"pointer" }}>
              {l} ({k==="all"?goals.length:goals.filter(g=>k==="locked"?g.locked:k==="shared"?g.isShared:g.approvalStatus===(k==="pending"?"pending":k==="rejected"?"rejected":"approved")).length})
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(g=>{
          const emp = allUsers[g.employeeId];
          return (
            <Card key={g.id} style={{ padding:"14px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:C.navy }}>{g.title} {g.isShared&&<Badge label="SHARED" bg="#E6F1FB" color={C.blue} size={10}/>}</div>
                  <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>{emp?.name} ({emp?.dept}) · {g.thrustArea} · {g.uom} · Target: {g.target} · Wt: {g.weightage}%</div>
                  <div style={{ display:"flex", gap:6, marginTop:6 }}><ApprovalBadge status={g.approvalStatus}/></div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {g.locked
                    ? <Badge label="🔒 Locked" bg="#F1EFE8" color={C.gray}/>
                    : <Badge label="🔓 Unlocked" bg="#EAF3DE" color="#3B6D11"/>}
                  {g.locked && <Btn label="Unlock (Admin)" onClick={()=>onUnlock(g.id)} variant="warning" small/>}
                  {!g.locked && g.approvalStatus==="rejected" && <Btn label="Force Approve" onClick={()=>onReopen(g.id)} variant="success" small/>}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length===0 && <Card style={{ textAlign:"center", padding:30 }}><p style={{ color:C.lightGray }}>No goals match the current filter.</p></Card>}
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   REPORTS
───────────────────────────────────────────────────────────────────────────── */
function Reports({ goals, allUsers, activeQ, setActiveQ }) {
  const employees = Object.values(allUsers).filter(u=>u.role==="employee");
 
  const exportCSV = () => {
    const rows = [["Employee","Dept","Goal Title","Thrust Area","UoM","Target","Weightage","Quarter","Achievement","Score%","Status","Approval"]];
    goals.forEach(g=>{
      const emp=allUsers[g.employeeId];
      QUARTERS.forEach(q=>{
        rows.push([emp?.name,emp?.dept,g.title,g.thrustArea,g.uom,g.target,g.weightage+"%",q,g.achievements[q]||"—",computeScore(g,q)+"%",g.status,g.approvalStatus]);
      });
    });
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=`AtomQuest_Achievement_Report_${activeQ.replace(/[^a-z0-9]/gi,"_")}.csv`;
    a.click();
  };
 
  return (
    <div>
      <SectionHead
        title="Reports & Analytics"
        sub="Real-time achievement data, completion dashboards, and exportable reports."
        action={<Btn label="⬇ Export CSV" onClick={exportCSV} variant="success"/>}
      />
 
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {QUARTERS.map(q=>(
          <button key={q} onClick={()=>setActiveQ(q)} style={{ padding:"6px 14px", borderRadius:8, border:`1.5px solid ${activeQ===q?C.blue:C.border}`, background:activeQ===q?C.blue:C.white, color:activeQ===q?"#fff":"#2C2C2A", fontSize:13, fontWeight:activeQ===q?700:400, cursor:"pointer" }}>{q}</button>
        ))}
      </div>
 
      <h3 style={{ fontWeight:800, color:C.navy, margin:"0 0 14px" }}>Check-in Completion Dashboard — {activeQ}</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
        {employees.map(emp=>{
          const eg = goals.filter(g=>g.employeeId===emp.id&&g.approvalStatus==="approved");
          const achDone = eg.filter(g=>g.achievements[activeQ]&&g.achievements[activeQ]!==0&&g.achievements[activeQ]!=="").length;
          const ciDone  = eg.filter(g=>g.checkinComments[activeQ]).length;
          const ws = weightedScore(eg, activeQ);
          return (
            <Card key={emp.id} style={{ padding:"14px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name={emp.name} size={38}/>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15, color:C.navy }}>{emp.name}</div>
                    <div style={{ fontSize:12, color:C.gray }}>{emp.dept} · {eg.length} approved goals</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:900, color:achDone===eg.length&&eg.length>0?C.teal:C.amber }}>{achDone}/{eg.length}</div>
                    <div style={{ fontSize:11, color:C.lightGray }}>Achievements</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:900, color:ciDone>0?C.teal:"#A32D2D" }}>{ciDone}/{eg.length}</div>
                    <div style={{ fontSize:11, color:C.lightGray }}>Check-ins</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:900, color:scoreColor(ws) }}>{ws}%</div>
                    <div style={{ fontSize:11, color:C.lightGray }}>Wt. Score</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:10 }}><ProgressBar pct={ws}/></div>
            </Card>
          );
        })}
      </div>
 
      <h3 style={{ fontWeight:800, color:C.navy, margin:"0 0 14px" }}>Planned vs Actual — {activeQ}</h3>
      <Card>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${C.border}` }}>
                {["Employee","Goal Title","Thrust Area","UoM","Planned Target","Actual","Score","Status","Weight"].map(h=>(
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:C.lightGray, fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goals.filter(g=>g.approvalStatus==="approved").map(g=>{
                const emp=allUsers[g.employeeId];
                const sc=computeScore(g,activeQ);
                return (
                  <tr key={g.id} style={{ borderBottom:`1px solid #F5F4F0` }}>
                    <td style={{ padding:"9px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Avatar name={emp?.name||"?"} size={24}/>
                        <span style={{ fontWeight:700, color:C.navy, fontSize:12 }}>{emp?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"9px 12px", color:"#2C2C2A", fontSize:12 }}>{g.title}</td>
                    <td style={{ padding:"9px 12px", color:C.gray, fontSize:12 }}>{g.thrustArea}</td>
                    <td style={{ padding:"9px 12px", color:C.gray, fontSize:12 }}>{g.uom.split(" ")[0]}</td>
                    <td style={{ padding:"9px 12px", fontWeight:700 }}>{g.target}</td>
                    <td style={{ padding:"9px 12px", color:sc>0?C.teal:C.lightGray, fontWeight:700 }}>{g.achievements[activeQ]||"—"}</td>
                    <td style={{ padding:"9px 12px" }}><span style={{ fontWeight:900, color:scoreColor(sc) }}>{sc}%</span></td>
                    <td style={{ padding:"9px 12px" }}><StatusBadge status={g.status}/></td>
                    <td style={{ padding:"9px 12px" }}><Badge label={g.weightage+"%"} bg="#F1EFE8" color="#2C2C2A"/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   CYCLE MANAGEMENT (Admin)
───────────────────────────────────────────────────────────────────────────── */
function CycleMgmt() {
  const [cycles, setCycles] = useState([
    { id:"c1", name:"FY 2025–26", goalSettingOpen:"2025-05-01", goalSettingClose:"2025-05-31", status:"Active" },
    { id:"c2", name:"FY 2024–25", goalSettingOpen:"2024-05-01", goalSettingClose:"2024-05-31", status:"Closed" },
  ]);
  const [showNew, setShowNew] = useState(false);
  const [newCycle, setNewCycle] = useState({ name:"", goalSettingOpen:"", goalSettingClose:"" });
 
  return (
    <div>
      <SectionHead title="Cycle Management" sub="Configure goal-setting windows and quarterly check-in schedules for each FY cycle." action={<Btn label="＋ New Cycle" onClick={()=>setShowNew(true)} />} />
      {showNew && (
        <Card style={{ marginBottom:20, background:"#F0F7FF", border:`1px solid ${C.blue}` }}>
          <p style={{ fontWeight:700, color:C.navy, margin:"0 0 14px" }}>Create New Cycle</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <Input label="Cycle Name"><input style={iStyle} value={newCycle.name} onChange={e=>setNewCycle(p=>({...p,name:e.target.value}))} placeholder="FY 2026–27"/></Input>
            <Input label="Goal Setting Opens"><input style={iStyle} type="date" value={newCycle.goalSettingOpen} onChange={e=>setNewCycle(p=>({...p,goalSettingOpen:e.target.value}))}/></Input>
            <Input label="Goal Setting Closes"><input style={iStyle} type="date" value={newCycle.goalSettingClose} onChange={e=>setNewCycle(p=>({...p,goalSettingClose:e.target.value}))}/></Input>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <Btn label="Create Cycle" onClick={()=>{if(newCycle.name){setCycles(p=>[...p,{id:"c"+Date.now(),...newCycle,status:"Draft"}]);setShowNew(false);}}} variant="success"/>
            <Btn label="Cancel" onClick={()=>setShowNew(false)} variant="ghost"/>
          </div>
        </Card>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {cycles.map(c=>(
          <Card key={c.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:17, color:C.navy }}>{c.name}</div>
                <div style={{ fontSize:13, color:C.gray }}>Goal Setting: {c.goalSettingOpen} → {c.goalSettingClose}</div>
              </div>
              <Badge label={c.status} bg={c.status==="Active"?"#E1F5EE":c.status==="Draft"?"#E6F1FB":"#F1EFE8"} color={c.status==="Active"?C.teal:c.status==="Draft"?C.blue:C.gray}/>
            </div>
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
              {CHECK_SCHEDULE.map(s=>(
                <div key={s.period} style={{ background:"#F5F4F0", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontWeight:700, fontSize:11, color:C.navy }}>{s.period}</div>
                  <div style={{ fontSize:10, color:C.gray }}>{s.window}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   AUDIT LOG
───────────────────────────────────────────────────────────────────────────── */
function AuditLog({ auditLog, allUsers }) {
  const [search, setSearch] = useState("");
  const filtered = auditLog.filter(e=>!search||e.action.toLowerCase().includes(search.toLowerCase())||e.details.toLowerCase().includes(search.toLowerCase())||allUsers[e.userId]?.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <SectionHead title={`Audit Trail (${auditLog.length} Events)`} sub="Complete immutable log of all goal changes post-lock date — who changed what, and when." />
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Filter by action, user or details…" style={{...iStyle,maxWidth:400,marginBottom:16}}/>
      <Card>
        {filtered.length===0 && <p style={{ textAlign:"center", color:C.lightGray, padding:20 }}>No events match your search.</p>}
        {filtered.map((e,i)=>{
          const u = allUsers[e.userId];
          return (
            <div key={e.id} style={{ display:"flex", gap:14, padding:"10px 0", borderBottom:i<filtered.length-1?`1px solid #F5F4F0`:"none" }}>
              <div style={{ fontSize:11, fontFamily:"monospace", color:C.lightGray, whiteSpace:"nowrap", minWidth:140 }}>{e.timestamp}</div>
              <div style={{ flexShrink:0 }}><Avatar name={u?.name||"?"} size={28} bg={ROLE_BADGE_STYLE[u?.role]?.bg||"#F1EFE8"} color={ROLE_BADGE_STYLE[u?.role]?.color||C.gray}/></div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontWeight:800, color:"#2C2C2A", fontSize:13 }}>{u?.name}</span>
                  <Badge label={u?.role||"?"} bg={ROLE_BADGE_STYLE[u?.role]?.bg||"#F1EFE8"} color={ROLE_BADGE_STYLE[u?.role]?.color||C.gray} size={10}/>
                  <span style={{ fontWeight:700, color:C.blue, fontSize:12 }}>{e.action}</span>
                </div>
                <div style={{ fontSize:12, color:C.gray, marginTop:3 }}>{e.details}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────────────────────── */
function Toast({ notif }) {
  if (!notif) return null;
  const map = { success:{bg:"#0F6E56",icon:"✓"}, error:{bg:"#A32D2D",icon:"✗"}, info:{bg:"#185FA5",icon:"ℹ"}, warning:{bg:"#854F0B",icon:"⚠"} };
  const m = map[notif.type]||map.info;
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background:m.bg, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:14, fontWeight:600, boxShadow:"0 6px 24px rgba(0,0,0,0.2)", maxWidth:380, display:"flex", gap:10, alignItems:"center" }}>
      <span style={{ fontSize:18 }}>{m.icon}</span><span>{notif.msg}</span>
    </div>
  );
}
 
/* ─────────────────────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [user, setUser]     = useState(null);
  const [goals, setGoals]   = useState(SEED_GOALS);
  const [audit, setAudit]   = useState(SEED_AUDIT);
  const [notifs, setNotifs] = useState(NOTIFICATIONS_SEED);
  const [view, setView]     = useState("dashboard");
  const [toast, setToast]   = useState(null);
  const [activeQ, setActiveQ] = useState("Q1 (July)");
 
  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);
 
  const addAudit = useCallback((action, details, goalId=null) => {
    setAudit(p => [{ id:"a"+Date.now(), timestamp:new Date().toLocaleString("en-IN"), userId:user?.id, action, details, goalId }, ...p]);
  }, [user]);
 
  const addNotif = useCallback((userId, msg, type="info") => {
    setNotifs(p => [{ id:"n"+Date.now(), userId, msg, type, read:false, ts:new Date().toLocaleString("en-IN") }, ...p]);
  }, []);
 
  const myNotifs = notifs.filter(n => n.userId === user?.id);
 
  if (!user) return <Login onLogin={u => { setUser(u); setView("dashboard"); }} />;
 
  const role = user.role;
 
  /* ── handlers ── */
  const handleCreateGoal = goal => {
    setGoals(p => [...p, goal]);
    addAudit("Goal submitted", `'${goal.title}' submitted for approval`, goal.id);
    addNotif(user.id, `Goal '${goal.title}' submitted — awaiting manager approval.`, "info");
    // notify manager
    const mgr = Object.values(USERS).find(u=>u.id===user.managerId);
    if (mgr) addNotif(mgr.id, `${user.name} submitted a new goal for approval: '${goal.title}'.`, "warning");
    showToast("Goal submitted for manager approval!");
    setView("my-goals");
  };
 
  const handleApprove = (goalId, edits) => {
    const g = goals.find(x=>x.id===goalId);
    setGoals(p => p.map(x => x.id===goalId ? {...x, ...edits, approvalStatus:"approved", locked:true } : x));
    addAudit("Goal approved", `Approved '${g?.title}' for ${USERS[g?.employeeId]?.name}`, goalId);
    addNotif(g?.employeeId, `Your goal '${g?.title}' has been approved by ${user.name}. It is now locked.`, "success");
    showToast("Goal approved and locked!");
  };
 
  const handleReject = goalId => {
    const g = goals.find(x=>x.id===goalId);
    setGoals(p => p.map(x => x.id===goalId ? {...x, approvalStatus:"rejected"} : x));
    addAudit("Goal returned", `Returned '${g?.title}' to ${USERS[g?.employeeId]?.name} for rework`, goalId);
    addNotif(g?.employeeId, `Your goal '${g?.title}' was returned for rework by ${user.name}.`, "error");
    showToast("Goal returned for rework.", "error");
  };
 
  const handleUpdateAch = (goalId, quarter, value, status) => {
    setGoals(p => p.map(g => g.id===goalId ? {...g, achievements:{...g.achievements,[quarter]:value}, status } : g));
    addAudit("Achievement updated", `${user.name} updated ${quarter} achievement for goal ${goalId}`, goalId);
    showToast("Achievement updated!");
  };
 
  const handleCheckinComment = (goalId, quarter, comment) => {
    const g = goals.find(x=>x.id===goalId);
    setGoals(p => p.map(x => x.id===goalId ? {...x, checkinComments:{...x.checkinComments,[quarter]:comment}} : x));
    addAudit("Check-in comment", `${user.name} added check-in for '${g?.title}' — ${quarter}`, goalId);
    addNotif(g?.employeeId, `Manager added a check-in comment on '${g?.title}' for ${quarter}.`, "info");
    showToast("Check-in comment saved!");
  };
 
  const handleShareGoal = goal => {
    setGoals(p => [...p, goal]);
    addAudit("Goal shared", `Pushed '${goal.title}' to ${USERS[goal.employeeId]?.name}`, goal.id);
    addNotif(goal.employeeId, `A shared goal '${goal.title}' has been assigned to you.`, "info");
    showToast("Goal shared successfully!");
    setView("dashboard");
  };
 
  const handleUnlock = goalId => {
    const g = goals.find(x=>x.id===goalId);
    setGoals(p => p.map(x => x.id===goalId ? {...x, locked:false} : x));
    addAudit("Goal unlocked (Admin)", `Admin unlocked '${g?.title}' post lock-date`, goalId);
    showToast("Goal unlocked by Admin.");
  };
 
  const handleReopen = goalId => {
    const g = goals.find(x=>x.id===goalId);
    setGoals(p => p.map(x => x.id===goalId ? {...x, approvalStatus:"approved", locked:true} : x));
    addAudit("Goal force-approved (Admin)", `Admin force-approved '${g?.title}'`, goalId);
    showToast("Goal force-approved.");
  };
 
  const teamGoals = goals.filter(g => {
    const emp = USERS[g.employeeId];
    return emp?.managerId === user.id;
  });
 
  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif", background:C.bg, minHeight:"100vh" }}>
      <Toast notif={toast}/>
      <TopNav user={user} view={view} setView={setView} notifs={myNotifs} onReadNotifs={()=>setNotifs(p=>p.map(n=>n.userId===user.id?{...n,read:true}:n))}
        onLogout={()=>{ setUser(null); setView("dashboard"); }} />
 
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px" }}>
        {/* ── EMPLOYEE ── */}
        {role==="employee" && view==="dashboard"   && <EmpDashboard user={user} goals={goals.filter(g=>g.employeeId===user.id)} setView={setView} activeQ={activeQ} setActiveQ={setActiveQ}/>}
        {role==="employee" && view==="my-goals"    && <MyGoals user={user} goals={goals.filter(g=>g.employeeId===user.id)} activeQ={activeQ} setActiveQ={setActiveQ} onUpdateAch={handleUpdateAch}/>}
        {role==="employee" && view==="create-goal" && <CreateGoal user={user} goals={goals} onSave={handleCreateGoal} onCancel={()=>setView("dashboard")}/>}
 
        {/* ── MANAGER ── */}
        {role==="manager" && view==="dashboard"     && <MgrDashboard user={user} goals={teamGoals} allUsers={USERS} setView={setView} activeQ={activeQ} setActiveQ={setActiveQ}/>}
        {role==="manager" && view==="approve-goals" && <ApproveGoals user={user} goals={teamGoals} allUsers={USERS} onApprove={handleApprove} onReject={handleReject}/>}
        {role==="manager" && view==="checkins"      && <Checkins user={user} goals={teamGoals} allUsers={USERS} activeQ={activeQ} setActiveQ={setActiveQ} onAddComment={handleCheckinComment}/>}
        {role==="manager" && view==="share-goal"    && <ShareGoal user={user} goals={goals} allUsers={USERS} onShare={handleShareGoal} onCancel={()=>setView("dashboard")}/>}
 
        {/* ── ADMIN ── */}
        {role==="admin" && view==="dashboard"    && <AdminDashboard goals={goals} allUsers={USERS} auditLog={audit} setView={setView}/>}
        {role==="admin" && view==="manage-goals" && <ManageGoals goals={goals} allUsers={USERS} onUnlock={handleUnlock} onReopen={handleReopen}/>}
        {role==="admin" && view==="reports"      && <Reports goals={goals} allUsers={USERS} activeQ={activeQ} setActiveQ={setActiveQ}/>}
        {role==="admin" && view==="cycle-mgmt"   && <CycleMgmt/>}
        {role==="admin" && view==="audit-log"    && <AuditLog auditLog={audit} allUsers={USERS}/>}
        {role==="admin" && view==="share-goal"   && <ShareGoal user={user} goals={goals} allUsers={USERS} onShare={handleShareGoal} onCancel={()=>setView("dashboard")}/>}
      </div>
    </div>
  );
}