import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

const Home = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6 font-mono">AI-Powered Disease Detection</h1>
      <div className="flex space-x-4">
        {/* <Link to="/page1" className="px-6 py-3 bg-blue-600 rounded-lg text-white text-lg font-semibold shadow-lg hover:bg-blue-700 transition">Crops Disease</Link>
        <Link to="/page2" className="px-6 py-3 bg-green-600 rounded-lg text-white text-lg font-semibold shadow-lg hover:bg-green-700 transition">live Stock </Link> */}

        <Link to="/page2"><div className="flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-74 h-48 border rounded-lg bg-red-900 overflow-hidden relative">
            <img src="src\assets\DALL·E 2025-02-23 15.12.39 - A high-quality, detailed image of a group of healthy farm animals, including cows, goats, and chickens, standing on a green pasture with a barn in the.webp" alt="" />
          </div>
          <label className="text-xl font-mono">Livestock Disease Detection</label>
          
        </div></Link>
        <Link to="/page1"><div className="flex flex-col items-center"> 
          <div className="flex flex-col items-center justify-center w-74 h-48 border rounded-lg bg-red-900 overflow-hidden relative">
            <img src="src\assets\DALL·E 2025-02-23 15.12.45 - A high-quality, detailed image of a healthy green farm field with various crops growing, including wheat, corn, and vegetables, under a bright blue sk.webp" alt="" />
          </div>
          <label className="text-xl font-mono">Crops Disease Detection</label>
        </div></Link>
      </div>
    </div>
  );
};



const Page1 = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate preview URL
    }
  };

  const handlePredict = async () => {
    if (!image) return alert("Please select an image first.");

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("http://10.120.16.143:3000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const treatmentData = typeof data.treatment === "string" ? JSON.parse(data.treatment) : data.treatment;
      if (!treatmentData || typeof treatmentData !== "object") {
        throw new Error("Invalid treatment data format");
      }

      setResult(treatmentData);
    } catch (error) {
      console.error("Error predicting:", error);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white p-10 overflow-y-scroll">
      <h1 className="text-3xl font-bold mb-4">AI Disease Detection</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4 text-lg p-2 bg-gray-700 rounded"
      />

      {imagePreview && (
        <div className="mt-4">
          <img
            src={imagePreview}
            alt="Selected"
            className="w-64 h-64 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      <button
        onClick={handlePredict}
        className="px-6 py-3 mt-4 bg-blue-600 rounded-lg text-white text-lg font-semibold shadow-lg hover:bg-blue-700 transition"
      >
        {loading ? "Analyzing..." : "Predict"}
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {result && (
        <div className="mt-10 p-6 bg-gray-900 rounded-lg w-full max-w-3xl text-left">
          <h2 className="text-xl font-semibold mb-3">{result.diseaseName || "Unknown Disease"}</h2>
          <p className="text-gray-300 mb-4">{result.diseaseDescripton || "No description available."}</p>

          {/* Organic Treatments */}
          <h3 className="text-lg font-semibold text-green-400">Organic Treatments</h3>
          <ul className="list-disc ml-5">
            {(result.OrganicTreatment && Array.isArray(result.OrganicTreatment)) &&
              result.OrganicTreatment.map((treatment, index) => (
                <li key={index} className="mb-2">
                  <strong>{treatment?.title || "No title"}:</strong>{" "}
                  {Array.isArray(treatment?.description)
                    ? treatment.description.join(", ")
                    : String(treatment?.description || "No description")}
                </li>
              ))}
          </ul>

          {/* Chemical Treatments */}
          <h3 className="text-lg font-semibold text-red-400 mt-4">Chemical Treatments</h3>
          <ul className="list-disc ml-5">
            {(result.ChemicalTreatment && Array.isArray(result.ChemicalTreatment)) &&
              result.ChemicalTreatment.map((treatment, index) => (
                <li key={index} className="mb-2">
                  <strong>{treatment?.title || "No title"}:</strong>{" "}
                  {Array.isArray(treatment?.description)
                    ? treatment.description.join(", ")
                    : String(treatment?.description || "No description")}
                </li>
              ))}
          </ul>

          {/* Preventive Measures */}
          <h3 className="text-lg font-semibold text-yellow-400 mt-4">Preventive Measures</h3>
          <ul className="list-disc ml-5">
            {(result.PreventiveMeasures && Array.isArray(result.PreventiveMeasures)) &&
              result.PreventiveMeasures.map((measure, index) => (
                <li key={index} className="mb-2">{measure || "No measure provided"}</li>
              ))}
          </ul>

          {/* Important Considerations */}
          <h3 className="text-lg font-semibold text-blue-400 mt-4">Important Considerations</h3>
          <ul className="list-disc ml-5">
            {(result.ImportantConsiderations && Array.isArray(result.ImportantConsiderations)) &&
              result.ImportantConsiderations.map((note, index) => (
                <li key={index} className="mb-2">{note || "No note provided"}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};





const animalData = {
  "Cattle": [
    "Sudden death", "Blood oozing from body openings", "Fever", "Swelling", "Abortion in late pregnancy", "Retained placenta", "Swollen joints", "Swollen, hot, and painful udders", "Clotted or bloody milk", "Lameness", "Blisters in mouth and hooves", "Excessive drooling", "Mouth ulcers", "Diarrhea", "Anemia", "Jaundice", "Weakness", "Difficulty standing", "Cold ears", "Sweet-smelling breath", "Weight loss", "Distended left abdomen", "Difficulty breathing", "Restlessness"
  ],
  "Sheep & Goats": [
    "Sudden death", "Convulsions", "Bloated stomach", "Abortions", "Swollen lymph nodes", "Weight loss", "High fever", "Nasal discharge", "Diarrhea", "Pneumonia", "Swelling of tongue", "Ulcers in mouth", "Lameness", "Scabby lesions on lips and nostrils", "Bloody diarrhea", "Dehydration", "Bottle jaw", "Difficulty standing", "Wool loss", "Weak bones", "Anemia"
  ],
  "Pigs": ["Bloody diarrhea", "Joint swelling", "Skin lesions", "Breathing difficulty", "High fever", "Hemorrhages", "Coughing", "Stillbirths", "Poor growth", "Potbelly", "Itching", "Skin thickening", "Hair loss"],
  "Poultry": ["Swollen wattles", "Nasal discharge", "Breathing issues", "Weakness", "Twisting of the neck", "Greenish diarrhea", "Swollen head", "Respiratory distress", "Sudden death", "Trembling", "Watery diarrhea", "Ruffled feathers", "Feather loss", "Lethargy", "Poor egg production"],
  "Horses": ["Muscle stiffness", "Difficulty eating", "Locked jaw", "Swollen lymph nodes", "Nodules in nostrils", "Coughing", "Ataxia", "Muscle tremors", "Colic", "Stomach ulcers", "Poor condition"]
};



const Page2 = () => {
  const [selectedAnimal, setSelectedAnimal] = useState("Cattle");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedSymptoms([]);
  }, [selectedAnimal]);

  const handleSymptomSelect = (symptom) => {
    setSelectedSymptoms((prev) => prev.includes(symptom) ? prev : [...prev, symptom]);
    console.log(selectedSymptoms.join(","));
    
  };

  const removeSymptom = (index) => {
    setSelectedSymptoms((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://10.120.16.143:3000/predictLiveStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          animal: selectedAnimal,
          symptoms: selectedSymptoms.join(",")
        })
      });
      const data = await res.json();
      const newData = await JSON.parse(data.possible_diseases);
      console.log(newData);
      
      setResponse(newData ?? {});
    } catch (error) {
      console.error("Error fetching data:", error);
      setResponse({ error: "Error fetching data. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white text-lg font-semibold p-4 overflow-y-scroll">
      <h1 className="text-2xl font-bold mb-6">Livestock Disease Prediction</h1>
      <div className="flex flex-col space-y-4 mb-6 items-center">
        <select
          className="p-2 bg-gray-700 border border-gray-600 rounded lg:w-1/2"
          value={selectedAnimal}
          onChange={(e) => setSelectedAnimal(e.target.value)}
        >
          {Object.keys(animalData).map((animal) => (
            <option key={animal} value={animal}>{animal}</option>
          ))}
        </select>

        <h3 className="text-lg font-semibold mb-2">Symptoms</h3>
        <div className="flex flex-wrap gap-2 border rounded-lg p-3 lg:w-1/2">
          {animalData[selectedAnimal].map((symptom, index) => (
            <div
              key={index}
              className="cursor-pointer flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs"
              onClick={() => handleSymptomSelect(symptom)}
            >
              <span>{symptom}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border rounded-lg p-3 mt-2 lg:w-1/2">
          {selectedSymptoms.map((symptom, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs"
            >
              <span>{symptom}</span>
              <X className="w-4 h-4 cursor-pointer" onClick={() => removeSymptom(index)} />
            </div>
          ))}
        </div>
      </div>
      
      <button
        className={`px-4 py-2 rounded text-white font-bold ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        onClick={handlePredict}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Predict"}
      </button>


      {response && (
        <div className="mt-6 p-6 bg-gray-900 rounded-lg w-full max-w-3xl text-left">
          <h2 className="text-xl font-semibold mb-3"><strong>DiseaseName : </strong>{response.DiseaseName ?? "Unknown Disease"}</h2>
          <p className="text-gray-300 mb-4"><strong>Description : </strong>{response.Description ?? "No description available."}</p>

          <h3 className="text-lg font-semibold text-green-400">Symptoms</h3>
          <ul className="list-disc ml-5">
            {(response.Symptoms ?? []).map((Symptom, index) => (
              <li key={index}>{Symptom}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-red-400 mt-4">Treatment Suggestions</h3>
          <ul className="list-disc ml-5">
            {(response["Treatment Suggestions"] ?? []).map((treatment, index) => (
              <li key={index}>{treatment}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-yellow-400 mt-4">Preventive Measures</h3>
          <ul className="list-disc ml-5">
          {(response["Preventive Measures"] ?? []).map((Preventive, index) => (
              <li key={index}>{Preventive}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-blue-400 mt-4">Important</h3>
          <ul className="list-disc ml-5">
            {(response["Important"] ?? []).map((Important, index) => (
              <li key={index}>{Important}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
      </Routes>
    </Router>
  );
};

export default App;
