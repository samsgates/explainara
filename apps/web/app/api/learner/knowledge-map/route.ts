import { NextResponse } from "next/server";
import { demoKubernetesGraph } from "@explainara/knowledge";
import { demoTwin } from "@/lib/demo";
export async function GET(){const twin=demoTwin();return NextResponse.json({graph:demoKubernetesGraph,state:Object.fromEntries(demoKubernetesGraph.nodes.map(n=>[n.id,twin.concepts[n.id]??null]))})}
