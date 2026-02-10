const express = require("express");
const cors = require("cors");
const axios = require("axios");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EMAIL = process.env.OFFICIAL_EMAIL;


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});


function fibonacci(n) {
  const result = [];
  let a = 0, b = 1;

  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
}

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(arr) {
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

async function askAI(question) {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
      {
        contents: [{ parts: [{ text: question }] }]
      },
      {
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?.trim()
        .split(" ")[0] || "Unknown"
    );
  } catch (error) {
    console.error("AI Error:", error.message);
    return "Unknown";
  }
}


app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

  
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        if (typeof body.fibonacci !== "number" || body.fibonacci < 0) {
          return res.status(400).json({
            is_success: false,
            official_email: EMAIL,
            error: "fibonacci must be a non-negative number"
          });
        }
        data = fibonacci(body.fibonacci);
        break;

      case "prime":
        if (!Array.isArray(body.prime)) {
          return res.status(400).json({
            is_success: false,
            official_email: EMAIL,
            error: "prime must be an array"
          });
        }
        data = body.prime.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body.lcm)) {
          return res.status(400).json({
            is_success: false,
            official_email: EMAIL,
            error: "lcm must be an array"
          });
        }
        data = lcm(body.lcm);
        break;

      case "hcf":
        if (!Array.isArray(body.hcf)) {
          return res.status(400).json({
            is_success: false,
            official_email: EMAIL,
            error: "hcf must be an array"
          });
        }
        data = hcf(body.hcf);
        break;

      case "AI":
        if (typeof body.AI !== "string") {
          return res.status(400).json({
            is_success: false,
            official_email: EMAIL,
            error: "AI must be a string"
          });
        }
        data = await askAI(body.AI);
        break;

      default:
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    res.status(500).json({
      is_success: false,
      official_email: EMAIL,
      error: "Internal Server Error"
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
