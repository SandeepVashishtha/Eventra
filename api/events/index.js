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

    const allowedKeys = ['category', 'type', 'registrationStatus', 'startDate', 'endDate', 'isVirtual'];
    const invalidKeys = Object.keys(req.query).filter(key => !allowedKeys.includes(key));
    
    if (invalidKeys.length > 0) {
        return res.status(400).json({ error: `Invalid filter parameters: ${invalidKeys.join(', ')}` });
    }

    let filters = {};

    if (category) filters.category = category;
    if (type) filters.type = type;
    if (registrationStatus) filters.registrationStatus = registrationStatus;
    
    if (startDate || endDate) filters.date = {};
    if (startDate) {
        const d = new Date(startDate);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid startDate' });
        filters.date.$gte = d;
    }
    if (endDate) {
        const d = new Date(endDate);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid endDate' });
        filters.date.$lte = d;
    }
    if (isVirtual !== undefined) {
        if (isVirtual !== 'true' && isVirtual !== 'false') return res.status(400).json({ error: 'Invalid isVirtual' });
        filters.isVirtual = isVirtual === 'true';
    }

    eventsController.filterAndSortEvents(filters)
        .then(events => res.status(200).json(events))
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;