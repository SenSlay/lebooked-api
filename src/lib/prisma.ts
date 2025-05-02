import { PrismaClient } from '../generated/prisma/index';
import 'dotenv/config';

const url =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: { url },
  },
});

export default prisma;