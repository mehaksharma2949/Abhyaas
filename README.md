# Abhyaas

Abhyaas – AI-Powered Active Learning Ecosystem

Abhyaas is an AI-driven learning platform built using the MERN stack and OpenAI’s multimodal models.
It is designed to reduce teacher workload and enable deeper, concept-based learning for students through smart automation and personalised AI support.

🚀 Overview

Abhyaas solves the biggest issue in Indian classrooms:
Teachers are overloaded. Students memorize without understanding.

This platform provides AI tools for:

Teachers → faster planning, worksheet generation, evaluation

Students → active learning, instant understanding, doubt solving

🧑‍🏫 Teacher Tools

AI Lesson Planner – Curriculum-aligned, activity-based plans

Instant Worksheet Generator – MCQs, fill-ups, short answers, match-the-pairs

Auto Worksheet Evaluator – Upload image → AI checks answers

Text Simplifier – Converts complex text into simple form

Multilingual Support – English + Indian languages

Flowcharts & Diagrams – Automatically generated

🧒 Student Tools

Active Concept Learning

Gamified Micro-Learning

Instant Doubt Solver (Text/Voice/Image)

Simplified Explanations in Multiple Languages

Adaptive Learning Levels

💡 Key Features

MERN + AI integrated system

Real-time streaming AI responses

Clean modern UI

Multimodal inputs (text, images)

Role-based dashboards

Fast, scalable, modular codebase

🛠️ Tech Stack

Frontend: React.js, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB
AI Engine: OpenAI (GPT-4.1 / GPT-4o), DeepSeek
Other: Cloudinary, JWT Auth, Axios, DevvAI SDK

📦 Project Structure
/client        → React frontend
/server        → Express backend
/models        → Database models
/routes        → API routes
/components    → UI components
/utils         → Helpers + AI functions

📘 How It Works

User selects a tool (Lesson Planner, Worksheet Generator, Evaluator, Doubt Solver).

User enters a topic or uploads an image

Backend creates a custom prompt

AI model generates output (worksheet, plan, evaluation, explanation)

Frontend displays clean structured results

🧪 Setup Instructions
Clone the repo:
git clone <your-repo-link>
cd abhyaas

Install dependencies:

Frontend

cd client
npm install
npm start


Backend

cd server
npm install
npm run dev
