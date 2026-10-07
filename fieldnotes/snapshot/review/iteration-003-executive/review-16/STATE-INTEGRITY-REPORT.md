# State-integrity report

Base: https://fieldnotes-khaki-three.vercel.app/ · 1180×820 · assertions on visible text of the active screen after real interactions

| journey | check | result | note |
|---|---|---|---|
| negotiated | s3 shows 41 of 60 | pass |  |
| negotiated | s3 @41 says more needed (7) | pass |  |
| negotiated | s3 @41 never says begin/coverage | pass |  |
| negotiated | s3 shows 47 of 60 | pass |  |
| negotiated | s3 @47 says more needed (1) | pass |  |
| negotiated | s3 @47 never says begin/coverage | pass |  |
| negotiated | s3 shows 48 of 60 | pass |  |
| negotiated | s3 @48 participation reached, verification required | pass |  |
| negotiated | s3 @48 never says begin/coverage | pass |  |
| negotiated | s3 shows 60 of 60 | pass |  |
| negotiated | s3 @60 participation reached, verification required | pass |  |
| negotiated | s3 @60 never says begin/coverage | pass |  |
| negotiated | s4 count carried (48 of 60) | pass |  |
| negotiated | s4 pending by default | pass |  |
| negotiated | s5 pending when unverified | pass |  |
| negotiated | s4 verified after toggle | pass |  |
| negotiated | s5 begins at 48 + verified | pass |  |
| negotiated | s5 pending after drop to 41 post-verification | pass |  |
| negotiated | s4 shows 41 of 60 after drop (no silent reset) | pass |  |
| negotiated | restart resets to 41 | pass |  |
| negotiated | restart clears verification | pass |  |
| negotiated | s2 no amounts | pass |  |
| negotiated | no page errors | pass |  |
| backed | draft-only → s4 waiting | pass |  |
| backed | s5 after draft-only: future only line | pass |  |
| backed | draft-only persists after s5 round-trip | pass |  |
| backed | simulate shows the authorised day | pass |  |
| backed | simulate did not flip mode (#lv0 still selected) | pass |  |
| backed | authorised → three placed, one needed you | pass |  |
| backed | s4 authorised: no fourth completed, no amounts | pass |  |
| backed | s5 expand adds proposed line | pass |  |
| backed | history unchanged after expand | pass |  |
| backed | restart → draft-only waiting | pass |  |
| backed | s2 no premium/percent | pass |  |
| backed | no page errors | pass |  |
| opencover | s3 price: Meridian fits, others ineligible | pass |  |
| opencover | s3 price: not bought | pass |  |
| opencover | s3 excl: Meridian fits, others ineligible | pass |  |
| opencover | s3 excl: not bought | pass |  |
| opencover | s3 settle: Meridian fits, others ineligible | pass |  |
| opencover | s3 settle: not bought | pass |  |
| opencover | s4 before buy: no Bought | pass |  |
| opencover | s5 before buy does not claim purchase | pass |  |
| opencover | s4 after buy: Bought · Meridian Mutual + simulated note | pass |  |
| opencover | bought persists across reload | pass |  |
| opencover | s5 reads purchased insurer | pass |  |
| opencover | restart clears purchase | pass |  |
| opencover | no page errors | pass |  |
| wildfire | s3 decision pending by default | pass |  |
| wildfire | s4 recorded ≠ established | pass |  |
| wildfire | s4 no results/percentages | pass |  |
| wildfire | s2 business: services + buyers, no amounts | pass |  |
| wildfire | s5 conditional only | pass |  |
| wildfire | no page errors | pass |  |
| first-move | s1 request, no result | pass |  |
| first-move | s2 differences, no ranking | pass |  |
| first-move | s3 recommendation | pass |  |
| first-move | s4 handoff | pass |  |
| first-move | no page errors | pass |  |

59 checks · 0 failed