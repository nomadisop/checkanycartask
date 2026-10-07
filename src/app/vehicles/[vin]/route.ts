import { validateVin } from "@/lib/vin";
import { getReport } from "@/lib/report";

export async function GET(_req: Request, ctx: RouteContext<"/vehicles/[vin]">) {
  const { vin } = await ctx.params;

  const result = validateVin(vin);
  if (!result.ok) {
    return Response.json({ error: "Invalid VIN", reason: result.reason }, { status: 400 });
  }

  const report = getReport(result.vin);
  if (!report) {
    return Response.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return Response.json(report);
}
