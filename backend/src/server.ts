import express from "express";
import cors from "cors";
import priceRoutes from "./routes/prices";


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", priceRoutes);

app.get("/", (req, res) => {
  res.send("Factor Flow backend is running");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
