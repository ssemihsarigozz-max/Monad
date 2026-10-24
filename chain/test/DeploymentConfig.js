const { expect } = require("chai");
const { deploymentConfig } = require("../scripts/deployment-config");

describe("Long-lived demo deployment configuration", function () {
  const now = 1800000000n;
  it("gives all three services 48 hours and threshold two by default", function () {
    const config = deploymentConfig({}, now);
    expect(config.deadlines).to.deep.equal(Array(3).fill(now + 172800n));
    expect(config.thresholds).to.deep.equal([2n, 2n, 2n]);
  });
  it("rejects old explicit deadlines and durations under 24 hours", function () {
    expect(() => deploymentConfig({ LIBRARY_DEADLINE: String(now + 3600n) }, now)).to.throw("Every service deadline");
    expect(() => deploymentConfig({ DEPLOYMENT_DURATION_SECONDS: "86399" }, now)).to.throw("at least 24 hours");
  });
  it("accepts a 24 hour minimum and longer explicit service deadlines", function () {
    const config = deploymentConfig({ DEPLOYMENT_DURATION_SECONDS: "86400", CAFETERIA_DEADLINE: String(now + 200000n), SERVICE_THRESHOLD: "30" }, now);
    expect(config.deadlines).to.deep.equal([now + 86400n, now + 86400n, now + 200000n]);
    expect(config.thresholds).to.deep.equal([30n, 30n, 30n]);
  });
});
