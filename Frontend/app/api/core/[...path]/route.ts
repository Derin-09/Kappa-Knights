// Inactive placeholder. You asked not to use /core routes; this handler returns 404 for any access.
export async function GET(_req: Request, _context: unknown) {
  return new Response("Not found", { status: 404 });
}
export async function POST(_req: Request, _context: unknown) {
  return new Response("Not found", { status: 404 });
}
export async function PUT(_req: Request, _context: unknown) {
  return new Response("Not found", { status: 404 });
}
export async function DELETE(_req: Request, _context: unknown) {
  return new Response("Not found", { status: 404 });
}
