# Fix for Issue #2630 - N+1 Query Pattern in Notification Mark-All-As-Read

Problem: markAllAsRead sends 50+ individual PUT requests sequentially instead of 1 bulk request.

Solution: Parallelize chunk processing using Promise.all() instead of sequential awaits.
