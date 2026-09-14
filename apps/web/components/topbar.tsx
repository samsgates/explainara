import { Bell, Search } from "lucide-react";
export function Topbar({title, eyebrow="Adaptive learning"}:{title:string;eyebrow?:string}) {
  return <div className="topbar"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div><div style={{display:"flex",gap:8}}><button className="button"><Search size={16}/> Search</button><button className="button"><Bell size={16}/></button></div></div>;
}
