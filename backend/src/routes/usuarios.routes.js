const { Router } = require('express');
const { listar } = require('../controllers/usuariosController');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', requireAuth, listar);

module.exports = router;
