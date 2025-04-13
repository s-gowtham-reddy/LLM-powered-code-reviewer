const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Allow frontend from localhost:3000
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Review API Endpoint
app.post("/api/review", async (req, res) => {
  const { code } = req.body;

  try {
    // Validate the request to ensure code is provided
    if (!code) {
      console.log("No code provided");
      return res.status(400).json({ error: "No code provided" });
    }

    console.log("Received code:", code);

    // Call to AIML API for code review
    const response = await axios.post(
      "https://api.aimlapi.com/v1/chat/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          {
            role: "system",
            content: `You are a coding assistant. Analyze the code and:
1. Identify the programming language.
2. Check for errors, bugs, or bad practices.
3. Suggest improvements or optimizations.
4. Provide corrected or optimized code if needed.
5. Explain the changes clearly.
6. If the code is executable, simulate and show the expected OUTPUT.

Respond in this format:

**Corrected Code:**
\`\`\`
<corrected code>
\`\`\`

**Suggestions:**
<suggestions for improvements>

**Explanations:**
<explanation of changes>

**Expected Output:**
<expected output of the code>`
          },
          {
            role: "user",
            content: `Code:\n\n${code}`
          }
        ],
        max_tokens: 800
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AIML_API_KEY}`
        }
      }
    );

    console.log("AI/ML API response:", response.data);

    // Get the review from the AI/ML API
    const review = response.data.choices[0].message.content.trim();

    // Respond with the review
    res.json({ review });
  } catch (error) {
    console.error("Error:", {
      message: error.message,
      response: error.response ? error.response.data : null
    });
    
    // Enhanced error handling and response
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: "Error analyzing code", details: error.message });
    }
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
