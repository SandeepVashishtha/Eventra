const express = require('express');
const router = express.Router();
const eventsController = require('../../controllers/eventsController');

// Existing endpoints
router.get('/', eventsController.listEvents);

// New advanced filtering and sorting logic
router.get('/filter', (req, res) => {
    const {
        category,
        type,
        registrationStatus,
        startDate,
        endDate,
        isVirtual
    } = req.query;

    let filters = {};

    if (category) filters.category = category;
    if (type) filters.type = type;
    if (registrationStatus) filters.registrationStatus = registrationStatus;
    if (startDate || endDate) filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
    if (isVirtual) filters.isVirtual = isVirtual === 'true';

    eventsController.filterAndSortEvents(filters)
        .then(events => res.status(200).json(events))
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;