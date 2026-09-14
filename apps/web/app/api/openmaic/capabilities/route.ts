import { NextResponse } from "next/server";
import { OpenMaicAdapter } from "@explainara/openmaic-adapter";
export async function GET(){const adapter=new OpenMaicAdapter(process.env.OPENMAIC_BASE_URL);return NextResponse.json(await adapter.capabilities())}
