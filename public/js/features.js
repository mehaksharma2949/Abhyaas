// public/js/features.js
// हर feature में: id, title, desc, status: "live" | "upcoming", link (if live -> path)
window.EDULEARN_TEACHER_FEATURES = [
  { id: "worksheet-gen", title: "Worksheet - Generator", desc: "AI-driven worksheet generator (populate questions by topic).", status: "live", link: "/teacher/worksheet" },
  { id: "auto-eval", title: "Worksheet Auto-evaluator (photo)", desc: "Students upload photos – auto-evaluate answers.", status: "live", link: "/teacher/auto-eval" },
  { id: "board-diagram", title: "Board Diagram Creator", desc: "Create printable board diagrams for lessons.", status: "live", link: "/teacher/board-diagram" },

  { id: "lesson-plan", title: "AI Lesson Plan Generator", desc: "Auto-generate lesson plans tuned to grade & topic.", status: "upcoming", link: "#" },
  { id: "text-simplify", title: "Text Simplifier (multilingual)", desc: "Simplify textbook text to child-friendly language.", status: "upcoming", link: "#" },
  { id: "smart-timetable", title: "Smart Timetable Scheduler", desc: "Generate class timetables automatically.", status: "upcoming", link: "#" },
  { id: "Transparent-Mode", title: "Transparent-Mode", desc: "Teacher can checkout the query of students.", status: "upcoming", link: "#" },
];
