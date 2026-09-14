import { Activity, Sparkles } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { demoEvents } from "@/lib/demo";
export default function History(){return <><Topbar title="Learning history" eyebrow="Evidence timeline"/><div className="card"><div className="timeline">{demoEvents.slice().reverse().map(e=><div className="timeline-item" key={e.id}><div style={{display:"flex",justifyContent:"space-between",gap:16}}><div><b>{e.type.replaceAll("_"," ")}</b><p className="muted" style={{fontSize:13,margin:"5px 0"}}>{JSON.stringify(e.payload).replace(/[{}\"]/g,"")}</p></div><span className="tag">{Math.round((Date.now()-e.createdAt.getTime())/60000)}m ago</span></div></div>)}</div></div></>}
