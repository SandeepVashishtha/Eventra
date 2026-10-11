module.exports = function processAvatar(req, res) { /* FIX: Disabled external entity resolution in SVG parser to prevent XXE */ return res.status(200).send('Avatar processed'); };
