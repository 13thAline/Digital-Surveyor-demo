import express from "express";
import multer from "multer";
import axios from "axios";
import { PrismaClient } from "@prisma/client"; 

const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.diskStorage({
  destination: "../uploads/",
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/", upload.array("images", 6), async (req, res) => {
  const files = req.files.map(f => `/uploads/${f.filename}`);

  const aiResponse = await axios.post("http://localhost:8000/analyze", {
    images: files
  });

  const report = await prisma.report.create({
    data: {
      costMin: aiResponse.data.costMin,
      costMax: aiResponse.data.costMax,
      damages: {
        create: aiResponse.data.damages
      },
      images: {
        create: files.map(url => ({ url }))
      }
    }
  });

  res.json(report);
});

export default router;
