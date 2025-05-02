import prisma from "../lib/prisma";

async function seedTestData() {
  await prisma.user.deleteMany();
  await prisma.book.deleteMany();

  await prisma.user.create({
    data: {
      username: 'testuser',
      password: 'hashedpass',
    },
  });

  await prisma.book.create({
    data: {
      title: 'Test Book',
      author: 'John Doe',
      description: 'A test book.',
      price: 9.99,
      imageUrl: 'http://example.com/cover.jpg',
    },
  });

  console.log('Seeded test data');
}

seedTestData().finally(() => prisma.$disconnect());