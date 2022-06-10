exports.test = (req, res) => {
  return res.status(200).json({ msg: "This is a test API" });
};
