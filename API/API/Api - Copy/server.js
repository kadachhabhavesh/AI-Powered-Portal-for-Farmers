// Required packages: express, axios, form-data, multer
const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors = require("cors")
const { GoogleGenerativeAI  } = require("@google/generative-ai") 
const app = express();

app.use(express.json())
app.use(cors())

const PORT = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}


const GEMINI_API_KEY = "AIzaSyBtyOx5ImPSsAkrSkPPZzWJCOcsAN9dafo";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=AIzaSyCNB27jWGhCl11uy4Izj-HJxky8Bm4ZxJA";




async function getDiseasePrediction(symptoms,animal) {
  const prompt = `You are an AI assistant for farmers. Your task is to diagnose livestock diseases based on symptoms and animal type provided by the user.  

- Give a *simple and clear* response, avoiding complex medical terms.  
- Keep sentences *short and easy to understand*.  
- Use *bullet points* for readability.    
- Provide the output in this format(JSON):

---
{
  "DiseaseName": "Coccidiosis",
  "Animal": "Poultry",
  "Description": "A common poultry disease caused by parasites in the gut.",
  "Symptoms": [
    "Watery diarrhea"
  ],
  "Preventive Measures": [
    "Keep the poultry house clean and dry.",
    "Use coccidiostats in feed.",
    "Ensure proper sanitation."
  ],
  "Treatment Suggestions": [
    "Use coccidiocidal drugs in water or feed.",
    "Provide supportive care, like electrolytes.",
    "Isolate affected birds."
  ],
  "Important": [
    "Always consult a veterinarian for proper treatment."
  ]
}  
---

Now, diagnose the disease based on these symptoms and animal type:  
symptoms : ${symptoms} 
animal type : ${animal}
`;

  try {

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // const response = await axios.post(GEMINI_URL, {
      //     prompt: { text: prompt },
      // });

      const result = await model.generateContent(prompt);
      console.log(result.response.text());

      return result.response.text() || "No disease found.";
  } catch (error) {
      console.error("Error:", error);
      return "Failed to get a response from AI.";
  }
}

// API Route
app.post("/predictLiveStock", async (req, res) => {
  console.log(req.body);
  const { symptoms,animal } = req.body;
  if (!symptoms) {
      return res.status(400).json({ error: "Please provide symptoms." });
  }

  const diseasePrediction = await getDiseasePrediction(symptoms,animal);
  console.log(diseasePrediction);
  const treatmentText = diseasePrediction.replace(/```json|```/g, "").trim();

  res.json({ possible_diseases: treatmentText });
});





app.post("/predict", upload.single("file"), async (req, res) => {

  console.log(req.file,21)

  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join(__dirname, "uploads/", req.file.filename);
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    
    const flaskResponse = await axios.post("http://localhost:5000/predict", form, {
      headers: form.getHeaders(), // Correct headers from form-data
    });


    const prompt = `I am providing an image of a crop leaf along with the disease name. Your task is to:
      Disease Name: ${ flaskResponse.data.class }
      Confirm the disease based on the provided image and disease name.
      Provide detailed treatment suggestions, including:
      Organic and chemical treatment methods.
      Recommended fertilizers or pesticides (with proper usage instructions).
      Suggest medicines or chemical sprays commonly used for this disease.
      Share preventive measures to avoid future infections.
      Keep explanations simple and clear so that farmers can easily understand them.
      provide response in json formate.
      json formate
      {
      "diseaseName":"",
      "diseaseDescripton":"",
  "OrganicTreatment": [
    {
      "title": "Improve Air Circulation",
      "description": [
        "Remove lower leaves that touch the soil.",
        "Space plants further apart to allow better airflow."
      ]
    }
  ],
  "ChemicalTreatment": [
    {
      "title": "Chlorothalonil",
      "description": [
        "A broad-spectrum fungicide that is effective against Leaf Mold.",
        "Follow label instructions carefully for mixing and application rates.",
        "Important: Do not apply within the pre-harvest interval (PHI) specified on the label."
      ]
    }
  ],
  "ImportantNotesforChemicalTreatments": [
    "Always read and follow the instructions on the product label. This is crucial for your safety and the effectiveness of the treatment.",
    "Wear appropriate protective gear (gloves, mask, eye protection) when applying any chemical.",
    "Apply fungicides early in the morning or late in the evening to avoid harming beneficial insects and to reduce the risk of leaf burn.",
    "Alternate between different fungicides to prevent the fungus from developing resistance."
  ],
  "Medicines-ChemicalSprays": [
    "See the chemical treatments listed above. Always consult with your local agricultural extension agent for the most appropriate and locally approved fungicides."
  ],
  "PreventiveMeasures": [
  "Use disease-free seeds and transplants.",
    "Practice crop rotation. Avoid planting tomatoes in the same location year after year.",
    "Water plants at the base to avoid wetting the foliage.",
    "Monitor plants regularly for early signs of disease."
  ],
  "ImportantConsiderations": [
    "Local Regulations: Always check with your local agricultural extension office for specific recommendations and regulations regarding pesticide use in your area.",
    "Professional Advice: If you are unsure about the best course of action, consult with a certified crop advisor or plant pathologist."
  ]
}

      `;
    const imagePart = fileToGenerativePart(filePath);

    

    try {

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // const response = await axios.post(GEMINI_URL, {
      //     prompt: { text: prompt },
      // });

      const imagePart = fileToGenerativePart(filePath, "image/jpeg");
      const result = await model.generateContent([{ text: prompt }, imagePart]);;
      console.log(result.response.text());

      const treatmentText = result.response.text().replace(/```json|```/g, "").trim();
      res.status(200).json({ treatment: treatmentText });
      // res.status(200).json({treatment : result.response.text()});
  } catch (error) {
      console.error("Error:", error);
      res.status(400).json({message : "ML Model Error"})
  }
    
    

    
  } catch (error) {
    console.error("Error calling Flask API:", error.response ? error.response.data : error.message);
    res.status(500).json({
      error: "Failed to get prediction",
      details: error.response ? error.response.data : error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
