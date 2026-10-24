const MIN_DURATION = 24n * 60n * 60n;
const DEFAULT_DURATION = 48n * 60n * 60n;

function deploymentConfig(env, timestamp) {
  const now = BigInt(timestamp);
  const duration = BigInt(env.DEPLOYMENT_DURATION_SECONDS || DEFAULT_DURATION);
  if (duration < MIN_DURATION) throw new Error("Deployment duration must be at least 24 hours");
  const deadlines = ["LIBRARY_DEADLINE", "LAUNDRY_DEADLINE", "CAFETERIA_DEADLINE"]
    .map((key) => BigInt(env[key] || now + duration));
  if (deadlines.some((deadline) => deadline < now + MIN_DURATION)) {
    throw new Error("Every service deadline must be at least 24 hours in the future");
  }
  const threshold = BigInt(env.SERVICE_THRESHOLD || "2");
  if (threshold < 2n) throw new Error("SERVICE_THRESHOLD must be at least 2");
  return { deadlines, thresholds: [threshold, threshold, threshold] };
}

module.exports = { deploymentConfig };
