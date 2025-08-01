const express = require('express');
const router = express.Router();

// Import sub-routers
router.use('/products', require('./products'));
router.use('/customers', require('./customers'));
router.use('/orders', require('./orders'));
router.use('/payments', require('./payments'));
router.use('/notifications', require('./notifications'));
// router.use('/orders', require('./orders'));
// router.use('/customers', require('./customers'));
// router.use('/payments', require('./payments'));
// router.use('/shipping', require('./shipping'));

router.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

module.exports = router;
