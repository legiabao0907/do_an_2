const express = require("express");
const { getTiles } = require("../controllers/mbtiles.controller");

module.exports = (source) => {
  const router = express.Router();

  // Route prefix sẽ được mount từ index.js
  router.get("/:z/:x/:y.png", getTiles(source));

  return router;
};
