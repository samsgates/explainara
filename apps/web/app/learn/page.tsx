import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Plus, Sparkles } from "lucide-react";
import { Topbar } from "@/components/topbar";

const courses=[
  {title:"Kubernetes Networking",desc:"Namespaces, NAT, CNI, Services and ingress.",mastery:48,time:"3.2h",adaptive:true},
  {title:"Transformer Architecture",desc:"Attention, masking, embeddings and training dynamics.",mastery:72,time:"5.7h",adaptive:true},
  {title:"System Design Foundations",desc:"Scalability, data, reliability and tradeoffs.",mastery:31,time:"1.8h",adaptive:false}
];
export default function Learn(){return <><Topbar title="Learn"/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><p className="muted">Your active learning spaces and adaptive courses.</p><Link href="/create" className="button brand"><Plus size={15}/>Create course</Link></div><div className="grid grid-3">{courses.map((c,i)=><div className="card course-card" key={c.title}><div className="course-visual" style={{filter:`hue-rotate(${i*36}deg)`}}/><div><span className={c.adaptive?"tag good":"tag"}>{c.adaptive?<><Sparkles size={12}/>Adaptive</>:<><BookOpen size={12}/>Course</>}</span><h2 style={{margin:"10px 0 5px"}}>{c.title}</h2><p className="muted" style={{fontSize:13}}>{c.desc}</p></div><div style={{marginTop:"auto"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span>{c.mastery}% mastery</span><span><Clock3 size={12} style={{verticalAlign:-2}}/> {c.time}</span></div><div className="progress"><span style={{width:`${c.mastery}%`}}/></div><Link href={i===0?"/classroom":"/classroom"} className="button" style={{width:"100%",marginTop:12}}>Continue <ArrowRight size={14}/></Link></div></div>)}</div></>}
