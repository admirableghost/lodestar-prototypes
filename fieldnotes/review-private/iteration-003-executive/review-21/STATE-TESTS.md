# Story-falsifying state tests

Base: https://fieldnotes-khaki-three.vercel.app/ · 1180×820 · real interactions only (clicks, keyboard on the slider); assertions on visible text.

| journey | test | result | note |
|---|---|---|---|
| opencover | fresh #s/5: pending, no service history, no remedy, no retained | pass |  |
| opencover | #to-purchase lands on screen 4 | pass |  |
| opencover | s3 price: Meridian fits, agent explains, not bought | pass |  |
| opencover | s3 excl: Meridian fits, agent explains, not bought | pass |  |
| opencover | s3 settle: Meridian fits, agent explains, not bought | pass |  |
| opencover | s4 before buy: no Bought | pass |  |
| opencover | dropdown/hash to 5 before buying → pending | pass |  |
| opencover | buy → Bought · Meridian Mutual, old policy ends after confirmation | pass |  |
| opencover | all three steps done after buy (permission, confirmation, cover) | pass |  |
| opencover | s5 bought: 5 / 9 / 4 late × 50 / 200, published remedy, no claim | pass |  |
| opencover | s5 bought: benefit headline, alternatives rechecked, coverage retained, missed commitment recorded | pass |  |
| opencover | pref change after purchase: s3 says already bought | pass |  |
| opencover | back arrow from 3 → 2 keeps the journey (offer screen) | pass |  |
| opencover | back navigation after purchase: s4 still bought, no button | pass |  |
| opencover | pref change does not rewrite the purchased terms | pass |  |
| opencover | reload keeps the purchase | pass |  |
| opencover | restart → pending again | pass |  |
| opencover | Next 1→5 without buying → pending, no history | pass |  |
| opencover | refresh on 4 before purchase → still unbought | pass |  |
| opencover | pref changed before purchase → snapshot is Meridian with its terms | pass |  |
| opencover | no page errors | pass |  |
| backed | fresh #s/4: nothing placed, no executed orders | pass |  |
| backed | s3 fresh: no authorisation preselected | pass |  |
| backed | s3 shows the real limit and its unit | pass |  |
| backed | Next from s3 without pressing is not consent | pass |  |
| backed | draft-only → nothing placed, 64,630 awaiting, route back | pass |  |
| backed | #to-authorise lands on s3 | pass |  |
| backed | s1: four canonical ids and derived total 64,630 | pass |  |
| backed | s1 row amounts sum to the reply total | pass |  |
| backed | s4: the same four ids, each accounted for | pass |  |
| backed | authorised → three placed, one returned | pass |  |
| backed | s4 authorised states the benefit (placed without a buyer; covered mistake; exception returned) | pass |  |
| backed | totals distinguish executed and pending (33,130 placed · 31,500 awaiting) | pass |  |
| backed | covered mistake is attached to PO-4473 (row or slip carrying its id) | pass |  |
| backed | covered mistake attached to a placed order, not a 5th order | pass |  |
| backed | hard exception stays with the human (31,500 only on the Returned row and the awaiting total) | pass |  |
| backed | expand: proposed, review required, exception kept | pass |  |
| backed | future-authority choice does not rewrite the day | pass |  |
| backed | s5 context reads the actual day | pass |  |
| backed | reload keeps authorisation | pass |  |
| backed | restart → draft-only | pass |  |
| backed | no page errors | pass |  |
| negotiated | fresh s3: 41, neutral headline, not reached | pass |  |
| negotiated | s1 names the customer | pass |  |
| negotiated | fresh #s/5: pending, both missing | pass |  |
| negotiated | s2 shows terms without invented amounts; share set before acceptance; repayment not a grant | pass |  |
| negotiated | join → visible result: joined the proposal, 42 of 60 | pass |  |
| negotiated | joining counts only once | pass |  |
| negotiated | s3 count matches state after join | pass |  |
| negotiated | Next never adds participants | pass |  |
| negotiated | slider to 47: not reached | pass |  |
| negotiated | slider to 48: reached, still conditional | pass |  |
| negotiated | unverified → no operative-coverage claim | pass |  |
| negotiated | s4 pending by default, 48 of 60 | pass |  |
| negotiated | Next never verifies | pass |  |
| negotiated | verified + 48 → offer secured, share set before acceptance; never in force | pass |  |
| negotiated | drop to 42 after verification → pending | pass |  |
| negotiated | restart → 41 unjoined | pass |  |
| negotiated | no page errors | pass |  |
| wildfire | incident: human decision pending, nothing approved | pass |  |
| wildfire | evidence: events recorded, evaluation still to come, bridge not dead end | pass |  |
| wildfire | evaluator informs, does not set the decision; one incident proves nothing | pass |  |
| wildfire | business: three relationships, proposed funding, no amounts, not incident command | pass |  |
| wildfire | s5 conditional benefit, coverage wording, no observed-history control | pass |  |
| wildfire | s1 Now default with both limits and the retreat annotation | pass |  |
| wildfire | s1 Earlier hides the retreat annotation | pass |  |
| wildfire | no page errors | pass |  |
| first-move | s1 never claims to be a recording | pass |  |
| first-move | evidence slot exists and stays hidden without a file | pass |  |
| first-move | s3: assistant reply with supported reasons, no unsupported claims | pass |  |
| first-move | s4 handoff | pass |  |
| first-move | no page errors | pass |  |

72 tests · 0 failed