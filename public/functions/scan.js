export async function onRequest(context) {
  return Response.json({
    ok: true,
    message: "Function is working"
  });
}
