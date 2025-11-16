import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get counter by name
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    let counter = await prisma.counter.findUnique({
      where: { name }
    });

    // Create counter if it doesn't exist
    if (!counter) {
      counter = await prisma.counter.create({
        data: { name, value: 0 }
      });
    }

    res.json(counter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment counter
router.post('/:name/increment', async (req, res) => {
  try {
    const { name } = req.params;
    
    const counter = await prisma.counter.upsert({
      where: { name },
      update: {
        value: { increment: 1 }
      },
      create: {
        name,
        value: 1
      }
    });

    // Save to history
    await prisma.counterHistory.create({
      data: {
        counterId: counter.id,
        value: counter.value,
        action: 'increment'
      }
    });

    res.json(counter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrement counter
router.post('/:name/decrement', async (req, res) => {
  try {
    const { name } = req.params;
    
    const counter = await prisma.counter.upsert({
      where: { name },
      update: {
        value: { decrement: 1 }
      },
      create: {
        name,
        value: -1
      }
    });

    // Save to history
    await prisma.counterHistory.create({
      data: {
        counterId: counter.id,
        value: counter.value,
        action: 'decrement'
      }
    });

    res.json(counter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset counter
router.post('/:name/reset', async (req, res) => {
  try {
    const { name } = req.params;
    
    const counter = await prisma.counter.upsert({
      where: { name },
      update: {
        value: 0
      },
      create: {
        name,
        value: 0
      }
    });

    // Save to history
    await prisma.counterHistory.create({
      data: {
        counterId: counter.id,
        value: counter.value,
        action: 'reset'
      }
    });

    res.json(counter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get counter history
router.get('/:name/history', async (req, res) => {
  try {
    const { name } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const counter = await prisma.counter.findUnique({
      where: { name }
    });

    if (!counter) {
      return res.status(404).json({ error: 'Counter not found' });
    }

    const history = await prisma.counterHistory.findMany({
      where: { counterId: counter.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json({
      counter,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;