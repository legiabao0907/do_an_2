// Controller nhận source qua closure
exports.getTiles = (source) => (req, res) => {
  const { z, x, y } = req.params;

  source.getTile(z, x, y, (err, tile, headers) => {
    if (err || !tile) {
      console.warn(`⚠️ Tile not found: ${z}/${x}/${y}`);
      return res.status(404).send("Tile not found");
    }

    res.set("Cache-Control", "no-store");
    res.set(headers);
    res.send(tile);
  });
};
