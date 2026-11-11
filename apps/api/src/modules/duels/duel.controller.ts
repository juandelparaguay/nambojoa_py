import { Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/auth.middleware';

// Esquema de validación para crear un duelo
const createDuelSchema = z.object({
  deporte: z.string().min(1, 'El deporte es obligatorio'),
  equipoA: z.string().min(1, 'El equipo A es obligatorio'),
  equipoB: z.string().min(1, 'El equipo B es obligatorio'),
  equipoCreador: z.enum(['equipoA', 'equipoB'], { message: 'Debes elegir en qué equipo juegas' }),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  message: z.string().optional(),
});

// 1. Crear un Duelo
export const createDuel = async (req: AuthRequest, res: Response) => {
  try {
    const data = createDuelSchema.parse(req.body);
    const creatorId = req.user!.userId;

    const link = uuidv4(); // Genera un ID único para el link (ej: "123e4567-e89b-12d3-a456-426614174000")

    const duel = await prisma.duel.create({
      data: {
        creatorId,
        deporte: data.deporte,
        equipoA: data.equipoA,
        equipoB: data.equipoB,
        equipoCreador: data.equipoCreador,
        amount: data.amount,
        message: data.message || '',
        link,
        status: 'pending',
      },
    });

    // Calculamos las comisiones para mostrárselas al usuario inmediatamente
    const comisionPorPersona = duel.amount * 0.05;
    const pozoTotal = duel.amount * 2;
    const premio = pozoTotal - (comisionPorPersona * 2);

    res.status(201).json({
      message: 'Duelo creado exitosamente',
      duel,
      calculos: {
        pozoTotal,
        comisionPorPersona,
        premio,
      },
      linkCompartir: `${req.protocol}://${req.get('host')}/duelo/${duel.link}`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues[0].message });
    res.status(500).json({ error: 'Error al crear el duelo' });
  }
};

// 2. Obtener un Duelo por su Link (Para el rival)
export const getDuelByLink = async (req: AuthRequest, res: Response) => {
  try {
    const { link } = req.params;

    const duel = await prisma.duel.findUnique({
      where: { link },
      include: {
        creator: {
          select: { username: true, foto: true, nivel: true } // Solo datos públicos del creador
        }
      }
    });

    if (!duel) return res.status(404).json({ error: 'Duelo no encontrado' });

    // Calculamos los montos para mostrarlos en la pantalla de invitación
    const comisionPorPersona = duel.amount * 0.05;
    const comisionTotal = comisionPorPersona * 2;
    const pozoTotal = duel.amount * 2;
    const premio = pozoTotal - comisionTotal;

    res.json({
      ...duel,
      calculos: { pozoTotal, comisionPorPersona, comisionTotal, premio }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el duelo' });
  }
};

// 3. Aceptar un Duelo
export const acceptDuel = async (req: AuthRequest, res: Response) => {
  try {
    const duelId = parseInt(req.params.id);
    const rivalId = req.user!.userId;

    // Usamos una transacción de Prisma para asegurar que todo se ejecute o nada se ejecute
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar el duelo
      const duel = await tx.duel.findUnique({ where: { id: duelId } });
      if (!duel) throw new Error('Duelo no encontrado');
      if (duel.status !== 'pending') throw new Error('El duelo ya no está disponible');
      if (duel.creatorId === rivalId) throw new Error('No puedes aceptar tu propio duelo');

      // 2. Verificar saldo del rival
      const rival = await tx.user.findUnique({ where: { id: rivalId } });
      if (!rival || rival.balance < duel.amount) throw new Error('Saldo insuficiente para aceptar el duelo');

      // 3. Verificar saldo del creador
      const creator = await tx.user.findUnique({ where: { id: duel.creatorId } });
      if (!creator || creator.balance < duel.amount) throw new Error('El creador del duelo no tiene saldo suficiente');

      // 4. Descontar saldo a ambos y registrar transacciones
      await tx.user.update({ where: { id: rivalId }, data: { balance: { decrement: duel.amount } } });
      await tx.transaction.create({
        data: { userId: rivalId, monto: -duel.amount, tipo: 'apuesta', descripcion: `Apuesta duelo #${duel.id}` }
      });

      await tx.user.update({ where: { id: duel.creatorId }, data: { balance: { decrement: duel.amount } } });
      await tx.transaction.create({
        data: { userId: duel.creatorId, monto: -duel.amount, tipo: 'apuesta', descripcion: `Apuesta duelo #${duel.id}` }
      });

      // 5. Actualizar el duelo
      return await tx.duel.update({
        where: { id: duelId },
        data: { status: 'accepted', rivalId }
      });
    });

    res.json({ message: 'Duelo aceptado exitosamente', duel: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al aceptar el duelo' });
  }
};

// 4. Obtener mis Duelos (Creados o Aceptados)
export const getMyDuels = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const duels = await prisma.duel.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { rivalId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { username: true, foto: true } },
        rival: { select: { username: true, foto: true } }
      }
    });

    res.json(duels);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los duelos' });
  }
};