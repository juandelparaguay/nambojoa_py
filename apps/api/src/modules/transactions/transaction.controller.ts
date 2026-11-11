import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const getMyTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Mostramos las últimas 30
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};
