import express from 'express';
import { validateEventFilters } from '../_lib/eventFilterValidator.js';

const router = express.Router();

// Existing endpoints
router.get('/', (req, res) => {
    // Placeholder for listEvents - returns empty array for now
    res.status(200).json([]);
});

// New advanced filtering and sorting logic with validation
router.get('/filter', (req, res) => {
    const {
        category,
        type,
        registrationStatus,
        startDate,
        endDate,
        isVirtual
    } = req.query;

    // Validate all query parameters
    const validation = validateEventFilters({
        category,
        type,
        registrationStatus,
        startDate,
        endDate,
        isVirtual
    });

    // Return validation errors if any
    if (!validation.isValid) {
        return res.status(400).json({
            error: 'Validation failed',
            details: validation.errors
        });
    }

    // Build filters object from validated parameters
    let filters = {};

    if (validation.validated.category) filters.category = validation.validated.category;
    if (validation.validated.type) filters.type = validation.validated.type;
    if (validation.validated.registrationStatus) filters.registrationStatus = validation.validated.registrationStatus;
    
    if (validation.validated.startDate || validation.validated.endDate) {
        filters.date = {};
        if (validation.validated.startDate) filters.date.$gte = validation.validated.startDate;
        if (validation.validated.endDate) filters.date.$lte = validation.validated.endDate;
    }
    
    if (validation.validated.isVirtual !== undefined) {
        filters.isVirtual = validation.validated.isVirtual;
    }

    // Placeholder for filterAndSortEvents - returns empty array for now
    // In production, this would call: eventsController.filterAndSortEvents(filters)
    res.status(200).json([]);
});

export default router;