const express = require('express');
const router = express.Router();
const controller = require('../controllers/crudController');

router.get('/meta', controller.getMeta);
router.get('/:entity', controller.listRecords);
router.get('/:entity/:id', controller.getRecord);
router.post('/:entity', controller.createRecord);
router.put('/:entity/:id', controller.updateRecord);
router.delete('/:entity/:id', controller.deleteRecord);

module.exports = router;
