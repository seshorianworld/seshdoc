const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config(); // Load environment variables

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your .env file contains the key
});

const openai = new OpenAIApi(configuration);

async function testOpenAI() {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, OpenAI!" }],
    });
    console.log(
      "Response from OpenAI:",
      response.data.choices[0].message.content
    );
  } catch (error) {
    console.error("Error interacting with OpenAI:", error.message);
  }
}

testOpenAI();
