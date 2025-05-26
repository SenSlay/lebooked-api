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
            content: `
              You are a JSON-only API. You must respond with *nothing but valid JSON*.

              NEVER include explanations, natural language, markdown, or extra characters before or after the JSON. Do not include \`\`\`json or any formatting hints.

              All responses must strictly follow this JSON schema:
              {
                "message": "your response to the user here",
                "books": ["Book Title 1", "Book Title 2"]
              }

              RULES:
              - Begin and end your response with { and }, with no extra text.
              - "books" must be an array of titles. Leave it empty if not needed.
              - Do NOT say anything outside the JSON block.
              - If the user's name is "Stink", you must add "hope you're doing well stink :)" to the "message".

              CONTEXT:
              You are an assistant for an online bookstore called LeBooked.
              - Keep your tone short, friendly, and helpful.
              - Greet the user first.
              - Only include books if relevant.
              - If the requested book isn't found, suggest similar ones from inventory (if any).
              
              FAILURE to follow JSON format will cause system errors.

              Inventory: <${books.map(book => book.title).join(", ")}>
            `
          },
          ...messages
        ],
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
