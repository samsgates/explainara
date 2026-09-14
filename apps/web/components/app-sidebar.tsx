import Link from "next/link";
import { BookOpen, BrainCircuit, ChartNoAxesCombined, Compass, GraduationCap, History, Home, Network, Plus, Settings2, Sparkles, Users } from "lucide-react";

const nav = [
  ["/", "Home", Home],
  ["/learn", "Learn", GraduationCap],
  ["/knowledge", "Knowledge Map", Network],
  ["/reviews", "Reviews", BrainCircuit],
  ["/history", "History", History],
  ["/teacher", "Teacher", Users],
  ["/admin", "Analytics", ChartNoAxesCombined]
] as const;

export function AppSidebar() {
  return <aside className="sidebar">
    <Link href="/" className="brand"><span className="brand-mark"><Sparkles size={18}/></span>Explainara</Link>
    <nav className="nav">
      {nav.map(([href,label,Icon]) => <Link href={href} key={href}><Icon size={18}/>{label}</Link>)}
      <div style={{height:8}} />
      <Link href="/create"><Plus size={18}/>Create course</Link>
      <Link href="/skills"><Compass size={18}/>Teaching skills</Link>
      <Link href="/settings"><Settings2 size={18}/>Settings</Link>
    </nav>
    <div className="sidebar-foot">
      <div className="user-card"><div className="avatar">DL</div><div><strong style={{fontSize:13}}>Demo Learner</strong><div className="muted" style={{fontSize:11}}>Adaptive path active</div></div></div>
    </div>
  </aside>;
}
