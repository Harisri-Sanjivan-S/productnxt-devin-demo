# productnxt-devin-demo

A tiny to-do library (TypeScript + Vitest) used to demo **Bug-to-PR with Devin**
from ProductNXT.

```bash
npm install
npm test
```

The suite is green on `main`. It carries one planted bug — `daysLeft` in
`src/todos.ts` rounds up and reads one day too high — for Devin to reproduce,
fix, and raise a pull request against.
