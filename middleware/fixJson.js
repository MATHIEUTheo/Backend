module.exports = function (req, res, next) {
  if (req.is("application/json")) {
    let rawData = ""
    req.on("data", (chunk) => {
      rawData += chunk
    });

    req.on("end", () => {
      try {
        // Remplacer les clés non guillemetées par des clés guillemetées
        const fixedData = rawData.replace(/(\w+):/g, '"$1":')
        req.body = JSON.parse(fixedData)
        next()
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON format" })
      }
    })
  } else {
    next()
  }
}
