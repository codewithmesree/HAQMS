const express = require('express');
const { PrismaClient, Prisma } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/doctors
// Retrieve list of doctors with special search filtering
// SECURED: SQL Injection fixed via parameterized queries
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, specialization } = req.query;

    const conditions = [];

    if (search) {
      conditions.push(Prisma.sql`name ILIKE ${'%' + search + '%'}`);
    }

    if (specialization && specialization !== 'All') {
      conditions.push(Prisma.sql`specialization = ${specialization}`);
    }

    let whereClause = Prisma.empty;
    if (conditions.length > 0) {
      whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
    }

    const query = Prisma.sql`SELECT * FROM "Doctor" ${whereClause}`;

    // SECURED: Uses parameterized $queryRaw
    const doctors = await prisma.$queryRaw(query);

    res.json(doctors);
  } catch (error) {
    // SECURED: Do not leak SQL error messages to client
    res.status(500).json({ error: 'Database execution failure' });
  }
});

// GET /api/doctors/stats
// Returns aggregation details about available doctors
// PERFORMANCE BUG: Sequential async calls instead of Promise.all()
router.get('/stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    // SECURED: Execute independent DB calls in parallel using Promise.all
    const [totalDoctors, surgeonsCount, averageFee, highestExperience] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { department: 'Surgery' } }),
      prisma.doctor.aggregate({ _avg: { consultationFee: true } }),
      prisma.doctor.aggregate({ _max: { experience: true } }),
    ]);

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      data: {
        total: totalDoctors,
        surgeons: surgeonsCount,
        averageFee: Math.round(averageFee._avg.consultationFee || 0),
        maxExperience: highestExperience._max.experience || 0,
      },
      debugInfo: {
        executionTimeMs: durationMs,
        notes: 'Loaded sequentially for safety. Optimization needed.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
