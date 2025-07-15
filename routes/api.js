const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');


router.use(requireAuth);


router.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        user: req.session.user.username,
        timestamp: new Date()
    });
});

module.exports = router;