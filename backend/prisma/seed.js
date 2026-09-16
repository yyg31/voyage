// Demo data seed for asia26.ygouf.com
// Creates the 2 families, 9 members, the 5 stopovers with per-family presence dates,
// a handful of demo activities/flights/links, and a starter forum.
//
// Usage: npm run seed  (reads DATABASE_URL / SEED_DEFAULT_PASSWORD from env)

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'Asia2026!';

async function main() {
  console.log('Seeding asia26 database...');

  // Wipe existing demo content (dependency order matters for FKs).
  await prisma.forumMessage.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.forumCategory.deleteMany();
  await prisma.link.deleteMany();
  await prisma.flightParticipant.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.activityParticipant.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.stopoverFamily.deleteMany();
  await prisma.stopover.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.family.deleteMany();

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const back = await prisma.family.create({ data: { name: 'Back', colorHex: '#dc2626' } });
  const ygouf = await prisma.family.create({ data: { name: 'Ygouf', colorHex: '#2563eb' } });

  const [pierre, marie, leo, emma] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'pierre.back@example.com',
        passwordHash,
        firstName: 'Pierre',
        lastName: 'Back',
        familyId: back.id,
        role: 'ADMIN',
        avatarColor: '#ef4444',
      },
    }),
    prisma.user.create({
      data: {
        email: 'marie.back@example.com',
        passwordHash,
        firstName: 'Marie',
        lastName: 'Back',
        familyId: back.id,
        avatarColor: '#f97316',
      },
    }),
    prisma.user.create({
      data: {
        email: 'leo.back@example.com',
        passwordHash,
        firstName: 'Léo',
        lastName: 'Back',
        familyId: back.id,
        avatarColor: '#facc15',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.back@example.com',
        passwordHash,
        firstName: 'Emma',
        lastName: 'Back',
        familyId: back.id,
        avatarColor: '#fb7185',
      },
    }),
  ]);

  const [yann, claire, hugo, lina, noe] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'yann.ygouf@icloud.com',
        passwordHash,
        firstName: 'Yann',
        lastName: 'Ygouf',
        familyId: ygouf.id,
        role: 'ADMIN',
        avatarColor: '#2563eb',
      },
    }),
    prisma.user.create({
      data: {
        email: 'claire.ygouf@example.com',
        passwordHash,
        firstName: 'Claire',
        lastName: 'Ygouf',
        familyId: ygouf.id,
        avatarColor: '#0ea5e9',
      },
    }),
    prisma.user.create({
      data: {
        email: 'hugo.ygouf@example.com',
        passwordHash,
        firstName: 'Hugo',
        lastName: 'Ygouf',
        familyId: ygouf.id,
        avatarColor: '#14b8a6',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lina.ygouf@example.com',
        passwordHash,
        firstName: 'Lina',
        lastName: 'Ygouf',
        familyId: ygouf.id,
        avatarColor: '#8b5cf6',
      },
    }),
    prisma.user.create({
      data: {
        email: 'noe.ygouf@example.com',
        passwordHash,
        firstName: 'Noé',
        lastName: 'Ygouf',
        familyId: ygouf.id,
        avatarColor: '#6366f1',
      },
    }),
  ]);

  console.log(`Created families Back (4 members) and Ygouf (5 members) — 9 members total.`);

  const day = (iso) => new Date(iso);

  const phnomPenh = await prisma.stopover.create({
    data: {
      name: 'Phnom Penh',
      country: 'Cambodge',
      colorHex: '#16a34a',
      orderIndex: 1,
      startDate: day('2026-12-25'),
      endDate: day('2026-12-28'),
      families: {
        create: [{ familyId: ygouf.id, arrivalDate: day('2026-12-25'), departureDate: day('2026-12-28') }],
      },
    },
  });

  const hoChiMinh = await prisma.stopover.create({
    data: {
      name: 'Ho Chi Minh',
      country: 'Vietnam',
      colorHex: '#f59e0b',
      orderIndex: 2,
      startDate: day('2026-12-28'),
      endDate: day('2026-12-31'),
      families: {
        create: [
          { familyId: ygouf.id, arrivalDate: day('2026-12-28'), departureDate: day('2026-12-31') },
          { familyId: back.id, arrivalDate: day('2026-12-28'), departureDate: day('2026-12-31') },
        ],
      },
    },
  });

  const conDao = await prisma.stopover.create({
    data: {
      name: 'Con Dao',
      country: 'Vietnam',
      colorHex: '#0ea5e9',
      orderIndex: 3,
      startDate: day('2026-12-31'),
      endDate: day('2027-01-04'),
      families: {
        create: [
          { familyId: ygouf.id, arrivalDate: day('2026-12-31'), departureDate: day('2027-01-04') },
          { familyId: back.id, arrivalDate: day('2026-12-31'), departureDate: day('2027-01-04') },
        ],
      },
    },
  });

  const singapore = await prisma.stopover.create({
    data: {
      name: 'Singapour',
      country: 'Singapour',
      colorHex: '#e11d48',
      orderIndex: 4,
      startDate: day('2027-01-04'),
      endDate: day('2027-01-08'),
      families: {
        create: [
          { familyId: ygouf.id, arrivalDate: day('2027-01-04'), departureDate: day('2027-01-08') },
          { familyId: back.id, arrivalDate: day('2027-01-04'), departureDate: day('2027-01-08') },
        ],
      },
    },
  });

  const beijing = await prisma.stopover.create({
    data: {
      name: 'Pékin',
      country: 'Chine',
      colorHex: '#7c3aed',
      orderIndex: 5,
      startDate: day('2027-01-08'),
      endDate: day('2027-01-10'),
      families: {
        create: [{ familyId: back.id, arrivalDate: day('2027-01-08'), departureDate: day('2027-01-10') }],
      },
    },
  });

  console.log('Created 5 stopovers.');

  // Demo flights (mirrored into the agenda as FLIGHT activities, same as the API does).
  async function createFlight({ airline, flightNumber, from, to, dep, arr, participants }) {
    const activity = await prisma.activity.create({
      data: {
        title: `Vol ${airline} ${flightNumber}`,
        description: `${from} -> ${to}`,
        type: 'FLIGHT',
        location: from,
        startDateTime: day(dep),
        endDateTime: day(arr),
        participants: { create: participants.map((userId) => ({ userId })) },
      },
    });
    return prisma.flight.create({
      data: {
        airline,
        flightNumber,
        departureCity: from,
        arrivalCity: to,
        departureDateTime: day(dep),
        arrivalDateTime: day(arr),
        activityId: activity.id,
        participants: { create: participants.map((userId) => ({ userId })) },
      },
    });
  }

  await createFlight({
    airline: 'Cathay Pacific',
    flightNumber: 'CX 261',
    from: 'Paris CDG',
    to: 'Phnom Penh',
    dep: '2026-12-25T09:20:00Z',
    arr: '2026-12-26T04:10:00Z',
    participants: [yann.id, claire.id, hugo.id, lina.id, noe.id],
  });

  await createFlight({
    airline: 'Air France',
    flightNumber: 'AF 168',
    from: 'Paris CDG',
    to: 'Ho Chi Minh',
    dep: '2026-12-27T22:35:00Z',
    arr: '2026-12-28T16:15:00Z',
    participants: [pierre.id, marie.id, leo.id, emma.id],
  });

  await createFlight({
    airline: 'Singapore Airlines',
    flightNumber: 'SQ 176',
    from: 'Singapour',
    to: 'Paris CDG',
    dep: '2027-01-08T00:35:00Z',
    arr: '2027-01-08T07:15:00Z',
    participants: [yann.id, claire.id, hugo.id, lina.id, noe.id],
  });

  console.log('Created demo flights.');

  await prisma.activity.createMany({
    data: [
      {
        stopoverId: phnomPenh.id,
        title: 'Visite du Palais Royal',
        type: 'VISIT',
        location: 'Phnom Penh',
        startDateTime: day('2026-12-26T02:00:00Z'),
        endDateTime: day('2026-12-26T05:00:00Z'),
      },
      {
        stopoverId: phnomPenh.id,
        title: 'Dîner au bord du Tonlé Sap',
        type: 'RESTAURANT',
        location: 'Phnom Penh',
        startDateTime: day('2026-12-26T11:00:00Z'),
        endDateTime: day('2026-12-26T13:00:00Z'),
      },
      {
        stopoverId: hoChiMinh.id,
        title: 'Tour des tunnels de Cu Chi',
        type: 'EXCURSION',
        location: 'Ho Chi Minh',
        startDateTime: day('2026-12-29T01:00:00Z'),
        endDateTime: day('2026-12-29T07:00:00Z'),
      },
      {
        stopoverId: conDao.id,
        title: 'Snorkeling & plage de Dam Trau',
        type: 'EXCURSION',
        location: 'Con Dao',
        startDateTime: day('2027-01-01T02:00:00Z'),
        endDateTime: day('2027-01-01T08:00:00Z'),
      },
      {
        stopoverId: singapore.id,
        title: 'Gardens by the Bay',
        type: 'VISIT',
        location: 'Singapour',
        startDateTime: day('2027-01-05T10:00:00Z'),
        endDateTime: day('2027-01-05T13:00:00Z'),
      },
      {
        stopoverId: beijing.id,
        title: 'La Grande Muraille - Mutianyu',
        type: 'EXCURSION',
        location: 'Pékin',
        startDateTime: day('2027-01-09T01:00:00Z'),
        endDateTime: day('2027-01-09T08:00:00Z'),
      },
    ],
  });

  console.log('Created demo activities.');

  await prisma.link.createMany({
    data: [
      {
        title: 'Hôtel Raffles Le Royal (Phnom Penh)',
        url: 'https://www.booking.com/hotel/kh/raffles-le-royal.html',
        type: 'HOTEL',
        stopoverId: phnomPenh.id,
        visibility: 'YGOUF',
        familyId: ygouf.id,
        createdById: yann.id,
      },
      {
        title: 'Hôtel Ho Chi Minh (Booking)',
        url: 'https://www.booking.com/searchresults.html?ss=Ho+Chi+Minh+City',
        type: 'HOTEL',
        stopoverId: hoChiMinh.id,
        visibility: 'BOTH',
        createdById: pierre.id,
      },
      {
        title: 'Six Senses Con Dao',
        url: 'https://www.agoda.com/six-senses-con-dao',
        type: 'HOTEL',
        stopoverId: conDao.id,
        visibility: 'BOTH',
        createdById: marie.id,
      },
      {
        title: 'Marina Bay Sands (Singapour)',
        url: 'https://www.marinabaysands.com/',
        type: 'HOTEL',
        stopoverId: singapore.id,
        visibility: 'BOTH',
        createdById: claire.id,
      },
      {
        title: 'Guide Grande Muraille Mutianyu',
        url: 'https://www.mutianyugreatwall.com/',
        type: 'INFO',
        stopoverId: beijing.id,
        visibility: 'BACK',
        familyId: back.id,
        createdById: pierre.id,
      },
    ],
  });

  console.log('Created demo links.');

  const [general, logistique, idees, restos] = await Promise.all([
    prisma.forumCategory.create({ data: { name: 'Général', orderIndex: 1 } }),
    prisma.forumCategory.create({ data: { name: 'Logistique', orderIndex: 2 } }),
    prisma.forumCategory.create({ data: { name: 'Idées de visites', orderIndex: 3 } }),
    prisma.forumCategory.create({ data: { name: 'Restaurants', orderIndex: 4 } }),
  ]);

  await prisma.forumThread.create({
    data: {
      categoryId: general.id,
      title: 'Bienvenue sur asia26 !',
      authorId: yann.id,
      messages: {
        create: [
          {
            authorId: yann.id,
            content: "Bienvenue sur le site du voyage Asie 2026-2027 ! Ajoutez vos idées d'activités et restos ici.",
          },
          {
            authorId: pierre.id,
            content: 'Hâte de découvrir Pékin avec vous tous, à bientôt sur place !',
          },
        ],
      },
    },
  });

  await prisma.forumThread.create({
    data: {
      categoryId: logistique.id,
      title: 'Valises et affaires à ne pas oublier',
      authorId: marie.id,
      messages: {
        create: [
          {
            authorId: marie.id,
            content: "Pensez à l'adaptateur électrique universel et à la crème anti-moustique.",
          },
        ],
      },
    },
  });

  console.log(`Created forum categories (${[general, logistique, idees, restos].length}) and starter threads.`);

  console.log('\nSeed complete.');
  console.log(`All demo accounts use the password: ${DEFAULT_PASSWORD}`);
  console.log('Admins: yann.ygouf@icloud.com (Ygouf), pierre.back@example.com (Back)');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
