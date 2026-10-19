import { env } from "cloudflare:workers";
import { service } from "@/app/lib/service.mjs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return service(request, env); }
export async function POST(request: Request) { return service(request, env); }
export async function DELETE(request: Request) { return service(request, env); }
