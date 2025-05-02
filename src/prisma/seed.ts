import { PrismaClient } from '../generated/prisma/index';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import genres from './data/genres.json';
import tags from './data/tags.json';
import books from './data/books.json';
import { fetchGoogleThumbnail } from '../utils/fetchGoogleThumbnail';
const prisma = new PrismaClient();

async function main() {
  await prisma.userBook.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Book_id_seq" RESTART WITH 1`);
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE "Genre_id_seq" RESTART WITH 1`
  );
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Tag_id_seq" RESTART WITH 1`);

  // Create Admin user with hashed password
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
  await prisma.user.create({
    data: {
      username: process.env.ADMIN_USERNAME!,
      password: hashedPassword,
    },
  });

  // Seed genres
  await Promise.all(
    genres.map((genre) =>
      prisma.genre.create({
        data: { name: genre },
      })
    )
  );

  // Seed tags
  await Promise.all(
    tags.map((tag) =>
      prisma.tag.create({
        data: { name: tag },
      })
    )
  );

  await Promise.all(
    books.map(async (book) => {
      try {
        const imageUrl = await fetchGoogleThumbnail(book.title, book.author);

        const genreRecords = await prisma.genre.findMany({
          where: { name: { in: book.genres } },
        });

        const tagRecords = await prisma.tag.findMany({
          where: { name: { in: book.tags } },
        });

        await prisma.book.create({
          data: {
            title: book.title,
            author: book.author,
            description: book.description,
            price: book.price,
            imageUrl,
            genres: {
              connect: genreRecords.map((g) => ({ id: g.id })),
            },
            tags: {
              connect: tagRecords.map((t) => ({ id: t.id })),
            },
          },
        });
      } catch (error) {
        console.error(`Error creating book ${book.title}:`, error);
      }
    })
  );

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
