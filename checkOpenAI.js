require("dotenv").config(); // Add this at the very top of your file
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use the environment variable
});

(async () => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, OpenAI!" }],
    });

    console.log(response);
  } catch (error) {
    console.error("Error making OpenAI request:", error);
  }
})();
