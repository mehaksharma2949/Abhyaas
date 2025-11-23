from flask import Flask, render_template_string, request, jsonify
import google.generativeai as genai
from PIL import Image, ImageDraw, ImageFont
import io
import base64

app = Flask(__name__)

API_KEY = "AIzaSyA4WPa1uBr6YlzgOOpFCGfWr2w8fZ8UP_0"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>🎨 Board Drawing Buddy - Teacher Assistant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header h1 { font-size: 48px; margin-bottom: 10px; }
        .header p { font-size: 18px; opacity: 0.9; }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        
        .section {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 24px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .form-group {
            margin: 20px 0;
        }
        
        label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
        
        textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            font-family: Arial;
            resize: vertical;
            min-height: 120px;
        }
        
        textarea:focus {
            border-color: #667eea;
            outline: none;
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 15px 0;
        }
        
        input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
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
            transition: transform 0.2s;
        }
        
        button:hover { transform: translateY(-2px); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .clear-btn {
            background: #999;
        }
        
        .loader {
            text-align: center;
            display: none;
            margin: 20px 0;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .result-box {
            background: #f8f9ff;
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #667eea;
            margin-top: 20px;
            display: none;
        }
        
        .result-box.show { display: block; }
        
        .result-box h3 {
            color: #667eea;
            margin: 15px 0 10px 0;
            font-size: 18px;
        }
        
        .diagram-display {
            background: white;
            border: 2px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
            overflow-x: auto;
            color: #333;
            white-space: pre;
            margin: 10px 0;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .steps-list {
            background: white;
            border: 2px solid #667eea;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        
        .steps-list ol {
            margin-left: 20px;
            color: #555;
        }
        
        .steps-list li {
            margin: 10px 0;
            line-height: 1.6;
        }
        
        .title-display {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin: 15px 0;
        }
        
        .error-message {
            background: #ffe0e0;
            color: #d32f2f;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #d32f2f;
            display: none;
        }
        
        .error-message.show { display: block; }
        
        .info-box {
            background: #e3f2fd;
            color: #1976d2;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #1976d2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Board Drawing Buddy</h1>
            <p>AI-Powered Diagram Generator for Teachers</p>
        </div>
        
        <div class="grid">
            <!-- Input Section -->
            <div class="section">
                <h2>📝 Draw Request</h2>
                
                <div class="info-box">
                    💡 Tell me what diagram you want. I'll create ASCII art with step-by-step drawing instructions!
                </div>
                
                <div class="form-group">
                    <label>📚 What diagram do you need?</label>
                    <textarea id="promptInput" placeholder="Example: Draw a triangle ABC with 30-60-90 angles. Or: Show the water cycle with evaporation, condensation, precipitation."></textarea>
                </div>
                
                <div class="checkbox-group">
                    <input type="checkbox" id="stepsOnly" checked>
                    <label for="stepsOnly" style="margin: 0; cursor: pointer;">Include drawing steps</label>
                </div>
                
                <div class="button-group">
                    <button onclick="generateDiagram()">✨ Generate Diagram</button>
                    <button class="clear-btn" onclick="clearAll()">🔄 Clear</button>
                </div>
                
                <div class="loader" id="loader">
                    <div class="spinner"></div>
                    <p style="color: #667eea; font-weight: 600;">Creating diagram...</p>
                </div>
                
                <div class="error-message" id="errorMsg"></div>
            </div>
            
            <!-- Output Section -->
            <div class="section">
                <h2>🎯 Diagram & Steps</h2>
                
                <div class="result-box" id="resultBox">
                    <div class="title-display" id="diagramTitle"></div>
                    
                    <h3>📐 ASCII Diagram with Labels (Copy & Paste on Board):</h3>
                    <div class="diagram-display" id="diagramDisplay"></div>
                    <button style="width: 100%; background: #4CAF50; margin-top: 10px;" onclick="copyDiagram()">
                        📋 Copy ASCII Diagram
                    </button>
                    
                    <div id="stepsSection" style="margin-top: 20px;">
                        <h3>📋 Drawing Steps (Read to Students):</h3>
                        <div class="steps-list" id="stepsList"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function generateDiagram() {
            const prompt = document.getElementById('promptInput').value.trim();
            const includeSteps = document.getElementById('stepsOnly').checked;
            
            if (!prompt) {
                showError('Please enter a diagram request');
                return;
            }
            
            document.getElementById('loader').style.display = 'block';
            document.getElementById('errorMsg').classList.remove('show');
            
            fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    include_steps: includeSteps
                })
            })
            .then(r => r.json())
            .then(data => {
                document.getElementById('loader').style.display = 'none';
                
                if (data.error) {
                    showError(data.error);
                    return;
                }
                
                displayResults(data);
            })
            .catch(err => {
                document.getElementById('loader').style.display = 'none';
                showError('Error: ' + err.message);
            });
        }
        
        function displayResults(data) {
            const resultBox = document.getElementById('resultBox');
            
            document.getElementById('diagramTitle').textContent = data.title || 'Diagram';
            document.getElementById('diagramDisplay').textContent = data.diagram;
            
            if (data.steps) {
                const stepsHtml = data.steps
                    .split('\\n')
                    .filter(s => s.trim())
                    .map(s => '<li>' + s.replace(/^\\d+\\.\\s*/, '') + '</li>')
                    .join('');
                document.getElementById('stepsList').innerHTML = '<ol>' + stepsHtml + '</ol>';
                document.getElementById('stepsSection').style.display = 'block';
            } else {
                document.getElementById('stepsSection').style.display = 'none';
            }
            
            resultBox.classList.add('show');
        }
        
        function showError(msg) {
            const errorEl = document.getElementById('errorMsg');
            errorEl.textContent = msg;
            errorEl.classList.add('show');
        }
        
        function copyDiagram() {
            const text = document.getElementById('diagramDisplay').textContent;
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ ASCII Diagram copied to clipboard!');
            });
        }
        
        function clearAll() {
            document.getElementById('promptInput').value = '';
            document.getElementById('resultBox').classList.remove('show');
            document.getElementById('errorMsg').classList.remove('show');
        }
        
        // Allow Ctrl+Enter to generate
        document.getElementById('promptInput').addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') generateDiagram();
        });
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_PAGE)

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        include_steps = data.get('include_steps', True)
        
        if not prompt:
            return jsonify({'error': 'Empty prompt'}), 400
        
        system_prompt = (
            "You are a simple diagram maker for school students (Class 3-12).\n\n"
            "Create SIMPLE, CLEAN ASCII diagrams that are EASY TO UNDERSTAND.\n\n"
            "Format:\n"
            "Title\n"
            "------\n"
            "[Simple ASCII diagram with basic labels]\n\n"
            "Steps:\n"
            "1. [Simple instruction]\n"
            "2. [Simple instruction]\n\n"
            "IMPORTANT:\n"
            "- Keep it VERY SIMPLE and basic\n"
            "- Use only a few lines (8-12 lines max)\n"
            "- Label only the most important parts\n"
            "- Make each step 1-2 sentences only\n"
            "- Use simple words kids understand\n"
            "- No complex technical terms\n"
            "- Make it easy to draw and copy\n"
            "- Each step should be one simple action"
        )
        
        user_msg = prompt
        if not include_steps:
            user_msg += "\n\nReturn ONLY the diagram without steps."
        
        response = model.generate_content([system_prompt, user_msg])
        text = response.text.strip()
        
        # Parse response
        result = {'title': 'Diagram', 'diagram': text, 'steps': ''}
        
        try:
            lines = text.splitlines()
            title_line = lines[0].strip() if lines else 'Diagram'
            
            # Find divider line (-------)
            divider_index = -1
            for i, line in enumerate(lines):
                if '------' in line or '-----' in line:
                    divider_index = i
                    break
            
            if divider_index >= 0:
                result['title'] = title_line
                
                # Collect diagram lines (from divider+1 upto first empty line or "Steps:")
                diagram_lines = []
                for line in lines[divider_index+1:]:
                    if line.strip() == "" or line.strip().lower().startswith("steps"):
                        break
                    diagram_lines.append(line.rstrip())
                
                result['diagram'] = '\n'.join(diagram_lines).rstrip()
            
            # Collect steps lines starting from line containing "Steps:"
            steps_start = None
            for i, line in enumerate(lines):
                if line.strip().lower() == "steps:":
                    steps_start = i
                    break
            
            if steps_start is not None and not False:  # not short_only
                steps_lines = lines[steps_start+1:]
                result['steps'] = '\n'.join(steps_lines).rstrip() if steps_lines else None
        
        except Exception:
            # Return raw text if format parsing fails
            result['diagram'] = text
            result['steps'] = None
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
