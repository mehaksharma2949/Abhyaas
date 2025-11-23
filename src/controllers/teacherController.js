// simple controller that returns a static features list (you can hook real DB later)
exports.getFeatures = async (req, res, next) => {
  try {
    const features = [
      { id:'lessonplan', title:'AI Lesson Plan Generator', desc:'Auto-generate multi-day lesson plans with objectives, activities & assessments.', implemented:true, url:'/teacher/lesson-plan' },
      { id:'worksheet', title:'Instant Worksheet Generator', desc:'Create adaptive worksheets & auto-evaluate answers (photo/ocr later).', implemented:false },
      { id:'reading', title:'Reading Fluency Checker', desc:'Record & analyse student reading fluency scores.', implemented:false },
      { id:'doubt', title:'Instant Doubt Solver', desc:'AI-based doubt answers with step-by-step explanation.', implemented:true, url:'/teacher/doubts' },
      { id:'timetable', title:'Smart Timetable', desc:'Generate optimized timetable/schedules for classes.', implemented:false },
      { id:'multilang', title:'Multilingual Content', desc:'Auto-translate & localize content in multiple languages.', implemented:false }
    ];

    const stats = { students: 142, classesThisWeek: 4, pendingReviews: 2 };

    return res.json({ success:true, features, stats });
  } catch(err){ next(err); }
};
