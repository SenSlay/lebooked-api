import { Request, Response } from 'express';
import 'dotenv/config';
import books from '../prisma/data/books.json';

export const handleAssistantQuery = async (req: Request, res: Response): Promise<any> => {
  const { messages } = req.body;

  if (!messages) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const aiResponse = await get_completion_from_messages(messages);

    res.json({ response: aiResponse });
  } catch (err) {
    console.error('AI assistant error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const get_completion_from_messages = async (messages: Message[]): Promise<any> => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for an online bookstore called LeBooked.
              - Keep your responses short and friendly.
              - Greet the user first and ask how you could help them.
              - Only include values to books when appropriate.
              - If user is looking for a book that is not in the inventory, suggest similar books from the inventory.
              - STRICTLY Only if the user's name is "Stink", include in your response "hope you're doing well stink :)".

              Strictly format your answer in JSON like this and only place your response to the user in the value of "message":
              {
                "message": "Your friendly response here",
                "books": ["Book1", "Book2"]
              }

              Only choose from the provided book inventory. Be strict and do not guess. Here's the inventory: <${books.map(book => book.title).join(", ")}>
            `
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const completion = await response.json();

    return completion.choices?.[0]?.message || { content: "No response from AI." };
  } catch (err) {
    console.error("Failed to fetch completion:", err);
    throw err;
  }
};
