# Advanced Answer Sheet Evaluator with Detailed Analysis
from flask import Flask, request, jsonify, render_template_string
from werkzeug.utils import secure_filename
import os
import google.generativeai as genai
from PIL import Image
import json

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

API_KEY = "AIzaSyA4WPa1uBr6YlzgOOpFCGfWr2w8fZ8UP_0"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>Advanced Answer Sheet Evaluator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { 
            text-align: center; 
            color: white; 
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header h1 { font-size: 40px; margin-bottom: 10px; }
        .header p { font-size: 18px; opacity: 0.9; }
        
        .main-section { 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            margin-bottom: 20px;
        }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        
        .upload-box {
            border: 3px dashed #667eea;
            border-radius: 10px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            background: #f8f9ff;
        }
        .upload-box:hover { background: #eef0ff; }
        .upload-box input { display: none; }
        .upload-box p { color: #667eea; font-weight: 600; margin-top: 10px; }
        
        .image-preview { 
            margin: 20px 0; 
            text-align: center;
            max-height: 400px;
            overflow: hidden;
        }
        .image-preview img { 
            max-width: 100%; 
            max-height: 400px; 
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .form-group { margin: 15px 0; }
        label { 
            display: block; 
            font-weight: 600; 
            color: #333; 
            margin-bottom: 8px;
        }
        input, textarea { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #e0e0e0; 
            border-radius: 8px; 
            font-family: Arial;
            font-size: 14px;
        }
        input:focus, textarea:focus {
            border-color: #667eea;
            outline: none;
        }
        
        .button-group { display: flex; gap: 10px; }
        button {
            flex: 1;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
        button:hover { transform: translateY(-2px); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .processing {
            text-align: center;
            padding: 20px;
            display: none;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .results-section {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            display: none;
        }
        .results-section.show { display: block; }
        
        .result-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .marks-display {
            font-size: 36px;
            font-weight: bold;
        }
        
        .marks-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        .mark-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #e0e0e0;
        }
        .mark-card strong { 
            display: block; 
            color: #667eea;
            font-size: 24px;
            margin: 10px 0;
        }
        
        .result-box {
            background: #f8f9ff;
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
            border-left: 5px solid #667eea;
        }
        .result-box h3 { 
            color: #667eea; 
            margin-bottom: 12px;
            font-size: 18px;
        }
        .result-box ul { margin-left: 20px; }
        .result-box li { 
            margin: 8px 0; 
            color: #555;
            line-height: 1.6;
        }
        
        .extracted-box { background: #fffbf0; border-left-color: #ffa500; }
        .errors-box { background: #ffe0e0; border-left-color: #d32f2f; }
        .missing-box { background: #f3e5f5; border-left-color: #7b1fa2; }
        .strength-box { background: #e8f5e9; border-left-color: #388e3c; }
        .weakness-box { background: #fff3e0; border-left-color: #e65100; }
        .feedback-box { background: #e0f2f1; border-left-color: #00897b; }
        
        .download-buttons {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        .download-btn {
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
        }
        .download-btn:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Advanced Answer Sheet Evaluator</h1>
            <p>80%+ Accuracy • Detailed Analysis • Download Reports</p>
        </div>
        
        <div class="main-section">
            <div class="grid">
                <div>
                    <h2 style="color: #667eea; margin-bottom: 20px;">📷 Upload Worksheet</h2>
                    <div class="upload-box" onclick="document.getElementById('imageInput').click()">
                        <p>📸 Click to upload</p>
                        <p style="font-size: 12px; color: #999;">JPG, PNG</p>
                        <input type="file" id="imageInput" accept="image/*">
                    </div>
                    <div class="image-preview" id="imagePreview"></div>
                    <div class="processing" id="extractionLoader">
                        <div class="spinner"></div>
                        <p style="color: #667eea; font-weight: 600;">Analyzing...</p>
                    </div>
                </div>
                
                <div>
                    <h2 style="color: #667eea; margin-bottom: 20px;">⚙️ Settings</h2>
                    
                    <div class="form-group">
                        <label>📊 Total Marks:</label>
                        <input type="number" id="totalMarks" value="100" min="1">
                    </div>
                    
                    <div class="form-group">
                        <label>👤 Student Name:</label>
                        <input type="text" id="studentName" placeholder="Student name">
                    </div>
                    
                    <div class="form-group">
                        <label>📅 Subject/Topic:</label>
                        <input type="text" id="subject" placeholder="e.g., Biology">
                    </div>
                    
                    <div class="button-group">
                        <button id="evaluateBtn" onclick="evaluateAnswers()">🚀 Analyze</button>
                        <button id="clearBtn" onclick="clearForm()" style="background: #999;">🔄 Clear</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Results Section -->
        <div class="results-section" id="resultsSection">
            <div class="result-header">
                <h2>✅ Detailed Evaluation Report</h2>
                <div class="marks-display" id="marksDisplay">0/100</div>
            </div>
            
            <div class="download-buttons" id="downloadButtons"></div>
            <div class="marks-section" id="marksSection"></div>
            
            <div class="result-box extracted-box" id="extractedBox" style="display: none;">
                <h3>📝 Extracted Answers</h3>
                <p id="extractedText"></p>
            </div>
            
            <div class="result-box errors-box" id="errorsBox" style="display: none;">
                <h3>❌ Errors & Mistakes (80%+ Accuracy)</h3>
                <ul id="errorsList"></ul>
            </div>
            
            <div class="result-box missing-box" id="missingBox" style="display: none;">
                <h3>📌 Missing Points</h3>
                <ul id="missingList"></ul>
            </div>
            
            <div class="result-box strength-box" id="strengthBox" style="display: none;">
                <h3>✨ Strengths</h3>
                <ul id="strengthList"></ul>
            </div>
            
            <div class="result-box weakness-box" id="weaknessBox" style="display: none;">
                <h3>⚠️ Weaknesses</h3>
                <ul id="weaknessList"></ul>
            </div>
            
            <div class="result-box feedback-box" id="feedbackBox" style="display: none;">
                <h3>🎓 Detailed Feedback</h3>
                <p id="feedbackText"></p>
            </div>
        </div>
    </div>

    <script>
        let uploadedFile = null;
        let lastResults = null;

        document.getElementById('imageInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            uploadedFile = file;
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('imagePreview').innerHTML = '<img src="' + event.target.result + '">';
            };
            reader.readAsDataURL(file);
        });

        function evaluateAnswers() {
            if (!uploadedFile) {
                alert('Upload image first');
                return;
            }
            
            const formData = new FormData();
            formData.append('image', uploadedFile);
            formData.append('total_marks', document.getElementById('totalMarks').value);
            formData.append('student_name', document.getElementById('studentName').value || 'Student');
            formData.append('subject', document.getElementById('subject').value || 'Assessment');
            
            document.getElementById('evaluateBtn').disabled = true;
            document.getElementById('evaluateBtn').textContent = '⏳ Analyzing...';
            document.getElementById('extractionLoader').style.display = 'block';
            
            fetch('/analyze-worksheet', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    document.getElementById('evaluateBtn').disabled = false;
                    document.getElementById('evaluateBtn').textContent = '🚀 Analyze';
                    document.getElementById('extractionLoader').style.display = 'none';
                    lastResults = data;
                    displayResults(data);
                })
                .catch(err => {
                    document.getElementById('evaluateBtn').disabled = false;
                    document.getElementById('evaluateBtn').textContent = '🚀 Analyze';
                    document.getElementById('extractionLoader').style.display = 'none';
                    alert('Error: ' + err);
                });
        }

        function displayResults(data) {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            
            document.getElementById('marksDisplay').innerHTML = data.marks_obtained + '/' + data.total_marks;
            
            document.getElementById('marksSection').innerHTML = `
                <div class="mark-card">
                    <small>Marks</small>
                    <strong style="color: #d32f2f;">${data.marks_obtained}/${data.total_marks}</strong>
                </div>
                <div class="mark-card">
                    <small>Percentage</small>
                    <strong style="color: #667eea;">${data.percentage}%</strong>
                </div>
                <div class="mark-card">
                    <small>Grade</small>
                    <strong style="color: #388e3c;">${data.grade}</strong>
                </div>
                <div class="mark-card">
                    <small>Status</small>
                    <strong style="color: #f57f17;">${data.correctness}</strong>
                </div>
            `;
            
            document.getElementById('downloadButtons').innerHTML = `
                <button class="download-btn" onclick="downloadReport('text')">📄 Download TXT</button>
                <button class="download-btn" onclick="downloadReport('json')">📊 Download JSON</button>
            `;
            
            if (data.extracted_text) {
                document.getElementById('extractedBox').style.display = 'block';
                document.getElementById('extractedText').innerHTML = '<pre style="white-space: pre-wrap; word-wrap: break-word; color: #555; font-size: 13px; background: #fafafa; padding: 10px; border-radius: 5px; max-height: 300px; overflow-y: auto;">' + data.extracted_text + '</pre>';
            }
            
            if (data.errors_mistakes && data.errors_mistakes.length > 0) {
                document.getElementById('errorsBox').style.display = 'block';
                document.getElementById('errorsList').innerHTML = data.errors_mistakes.map(e => '<li>' + e + '</li>').join('');
            }
            
            if (data.missing_points && data.missing_points.length > 0) {
                document.getElementById('missingBox').style.display = 'block';
                document.getElementById('missingList').innerHTML = data.missing_points.map(p => '<li>' + p + '</li>').join('');
            }
            
            if (data.strengths && data.strengths.length > 0) {
                document.getElementById('strengthBox').style.display = 'block';
                document.getElementById('strengthList').innerHTML = data.strengths.map(s => '<li>' + s + '</li>').join('');
            }
            
            if (data.weaknesses && data.weaknesses.length > 0) {
                document.getElementById('weaknessBox').style.display = 'block';
                document.getElementById('weaknessList').innerHTML = data.weaknesses.map(w => '<li>' + w + '</li>').join('');
            }
            
            if (data.detailed_feedback) {
                document.getElementById('feedbackBox').style.display = 'block';
                document.getElementById('feedbackText').innerHTML = data.detailed_feedback;
            }
            
            document.getElementById('resultsSection').classList.add('show');
        }

        function downloadReport(format) {
            if (!lastResults) return;
            
            if (format === 'text') {
                const timestamp = new Date().toLocaleString();
                let report = `================================================================================\\nANSWER SHEET EVALUATION REPORT\\n================================================================================\\n\\nDate: ${timestamp}\\nStudent: ${lastResults.student_name}\\nSubject: ${lastResults.subject}\\n\\n================================================================================\\nMARKS & PERFORMANCE\\n================================================================================\\nMarks: ${lastResults.marks_obtained}/${lastResults.total_marks}\\nPercentage: ${lastResults.percentage}%\\nGrade: ${lastResults.grade}\\nStatus: ${lastResults.correctness}\\n\\n================================================================================\\nEXTRACTED ANSWERS\\n================================================================================\\n${lastResults.extracted_text}\\n\\n================================================================================\\nERRORS & MISTAKES (80%+ Accuracy)\\n================================================================================\\n${lastResults.errors_mistakes && lastResults.errors_mistakes.length > 0 ? lastResults.errors_mistakes.map((e, i) => (i+1) + '. ' + e).join('\\n') : 'None'}\\n\\n================================================================================\\nMISSING POINTS\\n================================================================================\\n${lastResults.missing_points && lastResults.missing_points.length > 0 ? lastResults.missing_points.map((p, i) => (i+1) + '. ' + p).join('\\n') : 'None'}\\n\\n================================================================================\\nSTRENGTHS\\n================================================================================\\n${lastResults.strengths && lastResults.strengths.length > 0 ? lastResults.strengths.map((s, i) => (i+1) + '. ' + s).join('\\n') : 'None'}\\n\\n================================================================================\\nWEAKNESSES\\n================================================================================\\n${lastResults.weaknesses && lastResults.weaknesses.length > 0 ? lastResults.weaknesses.map((w, i) => (i+1) + '. ' + w).join('\\n') : 'None'}\\n\\n================================================================================\\nFEEDBACK\\n================================================================================\\n${lastResults.detailed_feedback}\\n\\n================================================================================\\n`;
                
                const element = document.createElement('a');
                element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(report);
                element.download = `Report_${lastResults.student_name}_${Date.now()}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            } else {
                const element = document.createElement('a');
                element.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lastResults, null, 2));
                element.download = `Report_${lastResults.student_name}_${Date.now()}.json`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        }

        function clearForm() {
            document.getElementById('imageInput').value = '';
            document.getElementById('totalMarks').value = '100';
            document.getElementById('studentName').value = '';
            document.getElementById('subject').value = '';
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('resultsSection').classList.remove('show');
            uploadedFile = null;
            lastResults = null;
        }
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_PAGE)

@app.route('/analyze-worksheet', methods=['POST'])
def analyze_worksheet():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image'}), 400
        
        file = request.files['image']
        total_marks = int(request.form.get('total_marks', 100))
        student_name = request.form.get('student_name', 'Student')
        subject = request.form.get('subject', 'Assessment')
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        img = Image.open(filepath)
        
        # Extract text from image
        extraction_prompt = "Extract ALL handwritten text from this worksheet. Return only the exact text."
        extraction_response = model.generate_content([extraction_prompt, img])
        extracted_text = extraction_response.text.strip()
        
        # Detailed analysis
        analysis_prompt = f"""You are an expert teacher analyzing a student's worksheet with 80%+ accuracy.

EXTRACTED ANSWERS:
{extracted_text}

TOTAL MARKS: {total_marks}

Analyze and provide in JSON format:
- Identify ALL errors, mistakes, spelling issues
- Identify missing points and incomplete answers
- Note strengths and what was good
- Note weaknesses and areas to improve
- Give detailed feedback
- Calculate marks (90%+ = full marks, 70-89% = 70%, <70% = 30%, 0% = no marks)
- Assign grade (A+/A/B/C/D/F)

RETURN ONLY THIS JSON:
{{
    "errors_mistakes": ["error1", "error2"],
    "missing_points": ["missing1", "missing2"],
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1"],
    "marks_obtained": {total_marks},
    "percentage": 85,
    "correctness": "Correct/Partially Correct/Incorrect",
    "grade": "A",
    "detailed_feedback": "Comprehensive feedback..."
}}"""
        
        analysis_response = model.generate_content([analysis_prompt, img])
        result_text = analysis_response.text
        img.close()
        
        # Clean JSON
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0]
        
        result = json.loads(result_text.strip())
        
        # Ensure all fields
        result['student_name'] = student_name
        result['subject'] = subject
        result['extracted_text'] = extracted_text
        result['total_marks'] = total_marks
        
        for key in ['errors_mistakes', 'missing_points', 'strengths', 'weaknesses']:
            if key not in result or not result[key]:
                result[key] = []
        
        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
