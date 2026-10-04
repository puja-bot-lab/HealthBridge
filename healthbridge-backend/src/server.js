import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());

const hospitals = [
  {
    id: 1,
    name: "Care General Hospital",
    address: "MG Road",
    city: "Vijayawada",
    phone: "+91 90000 10001",
    distance: 1.2,
    openNow: true,
    open24x7: true,
    emergency: true,
    hours: "Open 24 hours",
    specialties: ["General Medicine", "Cardiology", "Emergency"]
  },
  {
    id: 2,
    name: "Health City Medical Center",
    address: "Benz Circle",
    city: "Vijayawada",
    phone: "+91 90000 10002",
    distance: 2.4,
    openNow: true,
    open24x7: false,
    emergency: true,
    hours: "8:00 AM - 10:00 PM",
    specialties: ["Orthopedics", "Pediatrics", "Emergency"]
  },
  {
    id: 3,
    name: "Sunrise Multispeciality Hospital",
    address: "Governorpet",
    city: "Vijayawada",
    phone: "+91 90000 10003",
    distance: 3.1,
    openNow: false,
    open24x7: false,
    emergency: false,
    hours: "9:00 AM - 8:00 PM",
    specialties: ["Dermatology", "ENT", "General Medicine"]
  },
  {
    id: 4,
    name: "LifeCare Hospital",
    address: "Ramachandra Nagar",
    city: "Vijayawada",
    phone: "+91 90000 10004",
    distance: 4.7,
    openNow: true,
    open24x7: true,
    emergency: true,
    hours: "Open 24 hours",
    specialties: ["Cardiology", "Neurology", "Emergency"]
  },
  {
    id: 5,
    name: "City Children's Hospital",
    address: "Mogalrajpuram",
    city: "Vijayawada",
    phone: "+91 90000 10005",
    distance: 5.2,
    openNow: true,
    open24x7: false,
    emergency: false,
    hours: "9:00 AM - 9:00 PM",
    specialties: ["Pediatrics", "Neonatology", "General Medicine"]
  }
];

const tokens = [];
let nextToken = 101;

app.get("/", (req, res) => {
  res.json({ message: "HealthBridge API is running", version: "1.0" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is working" });
});

app.get("/api/hospitals", (req, res) => {
  const { search, emergency, open24x7 } = req.query;
  let result = hospitals;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.specialties.some(s => s.toLowerCase().includes(q))
    );
  }
  if (emergency === "true") result = result.filter(h => h.emergency);
  if (open24x7 === "true") result = result.filter(h => h.open24x7);

  res.json(result);
});

app.get("/api/hospitals/:id", (req, res) => {
  const hospital = hospitals.find(h => h.id === Number(req.params.id));
  if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  res.json(hospital);
});

app.post("/api/tokens", (req, res) => {
  const { hospitalId, patientName, phone } = req.body;

  if (!hospitalId || !patientName || !phone) {
    return res.status(400).json({ message: "hospitalId, patientName and phone are required" });
  }

  const hospital = hospitals.find(h => h.id === Number(hospitalId));
  if (!hospital) return res.status(404).json({ message: "Hospital not found" });

  const token = {
    id: tokens.length + 1,
    tokenNumber: nextToken++,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    patientName,
    phone,
    status: "Booked",
    createdAt: new Date().toISOString()
  };

  tokens.push(token);
  res.status(201).json(token);
});

app.get("/api/tokens", (req, res) => {
  res.json(tokens);
});

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.listen(PORT, () => {
  console.log(`HealthBridge backend running on http://localhost:${PORT}`);
});