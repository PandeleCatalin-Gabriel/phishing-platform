const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Toate rutele API necesită autentificare
router.use(requireAuth);

// Placeholder pentru viitoare endpoint-uri API
router.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        user: req.session.user.username,
        timestamp: new Date()
    });
});

module.exports = router;