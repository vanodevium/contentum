require("dotenv").config();
const debug = require("debug")("sssr");

const PORT = process.env.PORT || 3000;
const app = require("./app")(process.env.WORKERS || 1);

app.listen(PORT, "0.0.0.0", () => {
  debug(`is listening on ${PORT} port`);
});
