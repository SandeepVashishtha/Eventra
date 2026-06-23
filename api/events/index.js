const express = require('express');
const router = express.Router();
const eventsController = require('../../controllers/eventsController');

const ALLOWED_STRING_FIELDS = ['category', 'type', 'registrationStatus'];
const INJECTION_PATTERN = /^(\$|\{)/;

function isPlainString(value) {
    return typeof value === 'string' && !INJECTION_PATTERN.test(value);
}

function parseDate(value) {
    if (!value) return null;
    const trimmed = String(value).trim();
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return null;
    return parsed;
}

function sanitizeFilters(raw) {
    const filters = {};

    for (const field of ALLOWED_STRING_FIELDS) {
        const value = raw[field];
        if (value && isPlainString(value)) {
            filters[field] = value;
        }
    }

    const startDate = parseDate(raw.startDate);
    const endDate = parseDate(raw.endDate);
    if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = startDate;
        if (endDate) filters.date.$lte = endDate;
    }

    if (raw.isVirtual !== undefined && raw.isVirtual !== null) {
        if (raw.isVirtual === 'true' || raw.isVirtual === true) {
            filters.isVirtual = true;
        } else if (raw.isVirtual === 'false' || raw.isVirtual === false) {
            filters.isVirtual = false;
        }
    }

    return filters;
}

router.get('/', eventsController.listEvents);

router.get('/filter', (req, res) => {
    try {
        const filters = sanitizeFilters(req.query);
        eventsController.filterAndSortEvents(filters)
            .then(events => res.status(200).json(events))
            .catch(err => res.status(500).json({ error: err.message }));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;