# reviews/

The reviewer's output for each iteration, by exact filename:

```
iteration-001-review.md
iteration-001-next-prompt.md
```

`…-review.md` is the independent evaluation. `…-next-prompt.md` is the prompt
that starts the next build iteration.

**This location is read-only over HTTP.** The bundle is served as static files,
so a reviewing session cannot write here. Produce the two files in your own
workspace and hand them to the next build session; they will be published into
this folder with iteration-002.
