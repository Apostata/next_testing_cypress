# Cypress

## tasks
Exemplo: implementando uma task para resetar o DB, no arquivo `./cypress.config.ts`

```ts
import { addBand } from '@/lib/features/bands/queries';
import { resetDB } from '__tests__/__mocks__/db/utils/reset-db';
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        "db:reset":()=>resetDB().then(()=>null),
        "band:add":(newBand)=>addBand(newBand).then(()=>null),
      });
    },
  },
});


```