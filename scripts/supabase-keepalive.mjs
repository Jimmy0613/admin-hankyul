const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("SUPABASE_URL and SUPABASE_ANON_KEY are required.");
  process.exit(1);
}

const normalizedUrl = supabaseUrl.replace(/\/+$/, "");

async function ping(path, options = {}) {
  const response = await fetch(`${normalizedUrl}${path}`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...options.headers,
    },
  });

  return response;
}

async function main() {
  const checks = [
    { name: "project health", path: "/auth/v1/health" },
    { name: "rest gateway", path: "/rest/v1/" },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const response = await ping(check.path);
      results.push({
        ...check,
        ok: true,
        status: response.status,
      });
    } catch (error) {
      results.push({
        ...check,
        ok: false,
        status: "network-error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const hasSuccess = results.some((result) => result.ok);

  for (const result of results) {
    const suffix = result.error ? ` (${result.error})` : "";
    console.log(
      `[supabase-keepalive] ${result.name}: ${result.status}${suffix}`,
    );
  }

  if (!hasSuccess) {
    console.error(
      "[supabase-keepalive] All keep-alive requests failed at the network level. Check Supabase URL/key or platform availability.",
    );
    process.exit(1);
  }
}

main();
