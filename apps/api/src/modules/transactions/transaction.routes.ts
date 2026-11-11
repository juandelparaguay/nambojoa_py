import { Router } from 'express';
import { getMyTransactions } from './transaction.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getMyTransactions);

export default router;
