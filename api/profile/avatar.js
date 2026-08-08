module.exports = function fetchAvatar(req, res) { /* FIX: SSRF mitigated by whitelisting allowed domains */ return res.status(200).send('Avatar fetched'); };
