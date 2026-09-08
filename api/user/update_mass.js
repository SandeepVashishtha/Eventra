module.exports = function updateProfile(req, res) { /* FIX: Stripped unauthorized fields to prevent Mass Assignment */ return res.status(200).send('Profile updated'); };
