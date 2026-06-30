import { validateEventFilters } from '../_lib/eventFilterValidator.js';

const sendJson = (res, statusCode, payload) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
};

const getRequestPath = (req) => {
    const url = new URL(req.url || '/', 'http://localhost');
    return url.pathname.replace(/^\/api\/events/, '') || '/';
};

const listEvents = (_req, res) => {
    // Placeholder for listEvents - returns empty array for now
    sendJson(res, 200, []);
};

const filterEvents = (req, res) => {
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
        return sendJson(res, 400, {
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
    return sendJson(res, 200, []);
};

export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const path = getRequestPath(req);

    if (path === '/' || path === '') {
        return listEvents(req, res);
    }

    if (path === '/filter') {
        return filterEvents(req, res);
    }

    return sendJson(res, 404, { error: 'Not found' });
}
