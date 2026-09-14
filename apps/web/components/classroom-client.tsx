"use client";
import { useMemo, useState, type FormEvent } from "react";
import { Beaker, BrainCircuit, ChevronRight, MessageCircle, Play, Send, Sparkles, Wand2 } from "lucide-react";

const concepts=["TCP/IP Foundations","Linux Network Namespaces","NAT and Routing","Kubernetes Pod Networking","Kubernetes Services","Ingress and Gateway"];

type Message={who:"ai"|"you";text:string};

export function ClassroomClient(){
  const [lr,setLr]=useState(.1);
  const [messages,setMessages]=useState<Message[]>([
    {who:"ai",text:"I noticed a specific gap in your NAT mental model. Before we continue to Pod Networking, let's test one prediction with this packet-routing simulation."},
    {who:"ai",text:"Prediction: if NAT rewrites the application payload, changing only the source address should also change the payload bytes. What do you expect to observe?"}
  ]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const curve=useMemo(()=>lossCurve(lr),[lr]);
  const diverging=lr>.82;
  async function send(e:FormEvent){e.preventDefault();if(!input.trim())return; const text=input.trim(); setInput(""); setMessages(m=>[...m,{who:"you",text}]); setBusy(true); try{const res=await fetch("/api/classroom/respond",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:text,learningRate:lr})});const data=await res.json();setMessages(m=>[...m,{who:"ai",text:data.message??"Let's test that reasoning with the simulation."}]);}catch{setMessages(m=>[...m,{who:"ai",text:"Let's test the claim against the observable packet fields. Which field changed?"}]);}finally{setBusy(false)}}
  return <div className="classroom">
    <aside className="card"><div className="eyebrow">Learning path</div><h3 style={{margin:"8px 0 14px"}}>Kubernetes Networking</h3><div className="lesson-nav">{concepts.map((c,i)=><button key={c} className={i===2?"active":""}><span style={{opacity:.55,marginRight:7}}>{i+1}</span>{c}</button>)}</div><div className="callout" style={{fontSize:12,marginTop:20}}><BrainCircuit size={15} style={{verticalAlign:-3,marginRight:5}}/>Path branched because NAT is below prerequisite mastery.</div></aside>
    <section className="card stage"><div className="stage-hero"><span className="tag" style={{width:"fit-content",background:"rgba(255,255,255,.14)",color:"white"}}><Sparkles size={12}/>Adaptive insertion</span><h2>NAT: observe what actually changes</h2><p style={{opacity:.75,margin:0}}>Manipulate the model. Explainara observes the action and can react to the resulting evidence.</p></div><div style={{marginTop:18}} className="simulator"><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div className="eyebrow">Live lab</div><h3 style={{margin:"5px 0"}}>Optimization analogy sandbox</h3></div><span className={diverging?"tag bad":"tag good"}>{diverging?"unstable":"converging"}</span></div><p className="muted" style={{fontSize:12}}>This compact simulation demonstrates the same agent-aware interaction contract used by domain simulations. The AI can observe state changes and ask questions about them.</p><div className="chart"><svg viewBox="0 0 600 180" preserveAspectRatio="none"><path d={curve} fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke"/><line x1="0" y1="145" x2="600" y2="145" stroke="#e4e6ec" strokeDasharray="5 5"/></svg></div><div className="slider-row"><label style={{fontSize:12,fontWeight:800,minWidth:95}}>Learning rate {lr.toFixed(2)}</label><input type="range" min="0.02" max="1.5" step="0.02" value={lr} onChange={e=>setLr(Number(e.target.value))}/></div>{diverging&&<div className="callout" style={{marginTop:12}}>The loss is oscillating. The classroom can turn this state transition into a question, hint, or misconception test.</div>}</div><div style={{display:"flex",gap:8,marginTop:14}}><button className="button brand"><Play size={14}/>Run guided experiment</button><button className="button"><Wand2 size={14}/>Explain differently</button><button className="button"><Beaker size={14}/>Generate another lab</button></div></section>
    <aside className="card chat"><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><div><div className="eyebrow">Adaptive tutor</div><h3 style={{margin:"5px 0 0"}}>Teacher agent</h3></div><span className="icon-box"><MessageCircle size={17}/></span></div><div className="chat-log">{messages.map((m,i)=><div key={i} className={`bubble ${m.who==="ai"?"ai":""}`}><b>{m.who==="ai"?"Explainara":"You"}</b><div style={{marginTop:4}}>{m.text}</div></div>)}{busy&&<div className="bubble ai">Reasoning from your learner state…</div>}</div><form className="chat-form" onSubmit={send}><input placeholder="Ask or explain your reasoning…" value={input} onChange={e=>setInput(e.target.value)}/><button className="button brand" aria-label="Send"><Send size={15}/></button></form></aside>
  </div>;
}

function lossCurve(rate:number){let loss=1,velocity=.0; const points=[] as string[]; for(let i=0;i<60;i++){const grad=2*loss; velocity=.15*velocity+rate*grad; loss=loss-velocity+(rate>.82?Math.sin(i*.75)*rate*.34:0); const y=Math.max(8,Math.min(172,148-loss*90)); const x=i/59*600; points.push(`${i?"L":"M"}${x.toFixed(1)},${y.toFixed(1)}`)} return points.join(" ")}
