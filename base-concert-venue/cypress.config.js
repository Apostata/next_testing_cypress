import { addBand } from '@/lib/features/bands/queries';
import { addReservation } from '@/lib/features/reservations/queries';

import { resetDB } from '__tests__/__mocks__/db/utils/reset-db';
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // passando a variavel de ambiente para o cypress
      config.env.REVALIDATION_SECRET = process.env.REVALIDATION_SECRET

      //tasks       // implement node event listeners here

      on('task', {
        "db:reset":()=>resetDB().then(()=>null),
        "band:add":(newBand)=>addBand(newBand).then(()=>null),
        "reservation:add": (newReservation)=>addReservation(newReservation).then(()=>null)
      });

      return config;
    },
  },
});
