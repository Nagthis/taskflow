const { Router } = require('express');
const { listar, crear, actualizarEstado, actualizar, reasignar } = require('../controllers/tareasController');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', requireAuth, listar);
router.post('/', requireAuth, crear);
router.patch('/:id', requireAuth, actualizar);
router.patch('/:id/estado', requireAuth, actualizarEstado);
router.patch('/:id/asignado', requireAuth, reasignar);

module.exports = router;
