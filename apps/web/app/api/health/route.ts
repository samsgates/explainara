import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({ok:true,service:"explainara-web",time:new Date().toISOString(),demoMode:process.env.DEMO_MODE!=="false"})}
