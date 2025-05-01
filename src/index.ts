import express, { Request, Response } from "express";

import cors from "cors";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;

// CORS 설정 추가
app.use(
  cors({
    origin: "http://localhost:5173", // React 프론트가 동작하는 URL
    methods: ["GET", "POST", "DELETE"], // 허용할 HTTP 메서드
  })
);

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 파일 경로
const dataPath = path.resolve(__dirname, "../data.json");

// 미들웨어
app.use(express.json());

// 링크 데이터 불러오기
let links: { id: number; url: string }[] = [];
let nextId = 1;

function loadLinks() {
  if (fs.existsSync(dataPath)) {
    const file = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(file);
    links = data.links || [];
    nextId = links.length > 0 ? Math.max(...links.map((l) => l.id)) + 1 : 1;
  }
}

function saveLinks() {
  fs.writeFileSync(dataPath, JSON.stringify({ links }, null, 2));
}

loadLinks();

// GET
app.get("/api/links", (req: Request, res: Response) => {
  res.json(links);
});

// POST
app.post("/api/links", (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "url이 필요해요" });

  const newLink = { id: nextId++, url };
  links.push(newLink);
  saveLinks(); // 저장
  res.status(201).json(newLink);
});

// DELETE
app.delete("/api/links/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  links = links.filter((link) => link.id !== id);
  saveLinks(); // 삭제 후 저장
  res.json({ message: "삭제 완료", id });
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
