# Regression test policy

Every confirmed regression must add or strengthen an automated test that reproduces the observed failure before the fix and passes afterward. A regression is not complete and must not be reported as fixed until that test and the proportionate broader verification suite pass.

The test must assert the failed public behavior or contract boundary. Internal state labels alone are insufficient for visual, interactive, timing-sensitive, caching, or integration regressions; those cases require rendered output, user interaction, network behavior, or end-to-end evidence that would have caught the reported defect. Keep the regression test permanently unless the protected behavior is intentionally removed and that removal is reviewed in the same change.
