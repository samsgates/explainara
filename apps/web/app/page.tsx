import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, Clock3, Flame, Sparkles, Target, TrendingUp, TriangleAlert } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { demoKubernetesGraph } from "@explainara/knowledge";
import { demoTwin } from "@/lib/demo";

export default function HomePage() {
  const twin=demoTwin();
  const states=Object.values(twin.concepts);
  const avg=Math.round(states.reduce((s,c)=>s+c.mastery,0)/states.length*100);
  const current=demoKubernetesGraph.nodes[2]!;
  return <>
    <Topbar title="Good evening, learner" />
    <p className="muted" style={{marginTop:-12,maxWidth:620}}>Your classroom is adapting around the concepts you actually understand, not just the lessons you completed.</p>
    <div className="grid grid-4" style={{marginTop:24}}>
      <Metric icon={<Target size={19}/>} label="Overall mastery" value={`${avg}%`} note="+7% this week" />
      <Metric icon={<BrainCircuit size={19}/>} label="Concepts tracked" value={`${states.length}`} note="2 need attention" />
      <Metric icon={<Clock3 size={19}/>} label="Learning time" value="4.8h" note="This week" />
      <Metric icon={<Flame size={19}/>} label="Learning streak" value="6 days" note="Best: 11 days" />
    </div>

    <div className="section-head"><div><h2>Continue learning</h2><p className="muted">The Director selected the next activity from your learner model.</p></div><Link className="button" href="/learn">All courses <ArrowRight size={15}/></Link></div>
    <div className="grid grid-3">
      <div className="card course-card" style={{gridColumn:"span 2"}}>
        <div className="course-visual" />
        <div style={{display:"flex",justifyContent:"space-between",gap:20}}><div><span className="tag warn"><Sparkles size={12}/>Adaptive intervention</span><h2 style={{margin:"10px 0 6px"}}>Kubernetes Networking</h2><p className="muted">Current focus: <strong>{current.title}</strong>. A misconception is blocking Pod Networking.</p></div><div style={{minWidth:130}}><small className="muted">Course mastery</small><div className="metric">48%</div><div className="progress"><span style={{width:"48%"}}/></div></div></div>
        <div style={{marginTop:"auto",display:"flex",gap:8}}><Link href="/classroom" className="button brand">Open adaptive classroom <ArrowRight size={15}/></Link><Link href="/knowledge" className="button">View knowledge map</Link></div>
      </div>
      <div className="card">
        <div className="metric-row"><div><div className="eyebrow">Director insight</div><h2 style={{marginTop:8}}>Why this lesson changed</h2></div><div className="icon-box"><Sparkles size={18}/></div></div>
        <div className="callout" style={{margin:"8px 0 14px"}}>Your last two answers suggest you connect NAT with application payload rewriting. The classroom inserted a packet-routing simulation before Pod Networking.</div>
        <div className="list">
          <div className="list-item"><TriangleAlert size={17}/><div className="grow"><strong>Misconception active</strong><div className="muted" style={{fontSize:12}}>NAT and Routing</div></div></div>
          <div className="list-item"><TrendingUp size={17}/><div className="grow"><strong>Expected gain</strong><div className="muted" style={{fontSize:12}}>Application mastery +12-18%</div></div></div>
        </div>
      </div>
    </div>

    <div className="section-head"><div><h2>Your knowledge pulse</h2><p className="muted">Concept-level state from multiple evidence types.</p></div></div>
    <div className="grid grid-2">
      <div className="card"><h3>Concept mastery</h3><div className="list">{demoKubernetesGraph.nodes.slice(0,5).map(n=>{const m=Math.round((twin.concepts[n.id]?.mastery??0)*100);return <div key={n.id}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span>{n.title}</span><strong>{m}%</strong></div><div className="progress"><span style={{width:`${m}%`}}/></div></div>})}</div></div>
      <div className="card"><h3>Learning signals</h3><div className="timeline">{twin.behavioralSignals.map((s,i)=><div className="timeline-item" key={s}><strong>{["Pattern detected","Misconception signal","Recommended strategy"][i]}</strong><p className="muted" style={{fontSize:13,margin:"4px 0 0"}}>{s}</p></div>)}</div></div>
    </div>
  </>;
}

function Metric({icon,label,value,note}:{icon:ReactNode;label:string;value:string;note:string}) { return <div className="card"><div className="metric-row"><span className="icon-box">{icon}</span><span className="tag good">live</span></div><div className="metric">{value}</div><div style={{fontSize:13,fontWeight:700}}>{label}</div><div className="muted" style={{fontSize:12,marginTop:4}}>{note}</div></div> }
