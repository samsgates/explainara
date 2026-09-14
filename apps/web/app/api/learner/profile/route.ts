import { NextResponse } from "next/server";
import { demoTwin } from "@/lib/demo";
import { summarizeTwin } from "@explainara/learner";
export async function GET(){const twin=demoTwin();return NextResponse.json({twin,summary:summarizeTwin(twin)})}
