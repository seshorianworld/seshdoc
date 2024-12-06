// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
require("dotenv").config();
const helmet = require("helmet");
const { OpenAIApi, Configuration } = require("openai");

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Initializing Express
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
console.log(`Serving static files from: ${path.join(__dirname, "public")}`);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "sessions"),
      retries: 5,
      logFn: console.error,
    }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Helmet for security
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

// Dummy database
let logs = [];

// Submit log API
app.post("/submit-log", (req, res) => {
  const { shiftDate, shiftPeriod, logEntry, clientName } = req.body;

  if (!shiftDate || !shiftPeriod || !logEntry || !clientName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newLog = { shiftDate, shiftPeriod, logEntry, clientName };
  logs.push(newLog);

  // Redirect to final-report.html after submission
  res.redirect("/final-report.html");
});

// Fetch final report data API
app.get("/api/final-report-data", async (req, res) => {
  if (logs.length === 0) {
    return res.status(404).json({ error: "No logs available" });
  }

  const latestLog = logs[logs.length - 1];

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Rewrite the following log entry for clarity and professionalism:\n\n"${latestLog.logEntry}"`,
        },
      ],
    });

    const rewrittenLog = response.data.choices[0].message.content;

    res.status(200).json({
      clientName: latestLog.clientName,
      shiftDate: latestLog.shiftDate,
      shiftPeriod: latestLog.shiftPeriod,
      rewrittenLog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rewrite report API (for resubmission)
app.post("/api/rewrite-report", async (req, res) => {
  const { editedReport } = req.body;

  if (!editedReport) {
    return res.status(400).json({ error: "Edited report is required" });
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Rewrite the following log entry for clarity and professionalism:\n\n"${editedReport}"`,
        },
      ],
    });

    const rewrittenLog = response.data.choices[0].message.content;

    // Respond with the rewritten log
    res.status(200).json({ rewrittenLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch the EmailJS Public Key
app.get("/api/emailjs-public-key", (req, res) => {
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: "EmailJS Public Key not found" });
  }
  res.json({ publicKey });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
