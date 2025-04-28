import 'dotenv/config'; 
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

type GoogleBookItem = {
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
};

export const fetchGoogleThumbnail = async (title: string, author: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}&key=${GOOGLE_BOOKS_API_KEY}`,
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return '/placeholder.jpg'; // Default placeholder if no image found
    }

    const matchedBook = 
      data.items.find(
        (item: GoogleBookItem) =>
          item.volumeInfo.title.toLowerCase().includes(title.toLowerCase()) &&
          (author
            ? item.volumeInfo.authors?.some((a) =>
                a.toLowerCase().includes(author.toLowerCase()),
              )
            : true),
      ) || data.items[0];

    const thumbnail = matchedBook.volumeInfo.imageLinks?.thumbnail;

    return thumbnail || '/placeholder.jpg'; 
  } catch (error) {
    console.error('Error fetching Google Books API:', error);
    return '/placeholder.jpg'; 
  }
};