import "dotenv/config";
import { serve } from "@hono/node-server";
import { default as Debug } from "debug";
const debug = Debug("contentum");

import init from "./server.mjs";

const PORT = process.env.PORT || 3000;
const app = init(process.env.WORKERS || 1);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  () => {
    debug(`is listening on ${PORT} port`);
  },
);
