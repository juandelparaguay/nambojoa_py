import { Router } from 'express';
import { createDuel, getDuelByLink, acceptDuel, getMyDuels } from './duel.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Ruta pública (cualquiera con el link puede ver el duelo)
router.get('/link/:link', getDuelByLink);

// Rutas protegidas (requieren estar logueado)
router.post('/', authMiddleware, createDuel);
router.post('/:id/accept', authMiddleware, acceptDuel);
router.get('/', authMiddleware, getMyDuels);

export default router;