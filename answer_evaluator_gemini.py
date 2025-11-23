# answer_evaluator_gemini.py
import google.generativeai as genai
from PIL import Image
import json
import os

# ================== Gemini Answer Evaluator ==================
class AnswerEvaluator:
    """Gemini se answer evaluation - No training needed!"""
    
    def __init__(self):
        # Tumhari API key
        API_KEY = "AIzaSyA4WPa1uBr6YlzgOOpFCGfWr2w8fZ8UP_0"
        
        # Gemini configure karo
        genai.configure(api_key=API_KEY)
        
        # Model initialize karo
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        print("✅ Gemini API Ready!")
    
    def evaluate_answer_from_image(self, image_path, correct_answer, max_marks=10, question=""):
        """
        Image upload karke automatic evaluation
        
        Args:
            image_path: Answer sheet ki image ka path
            correct_answer: Correct answer from answer key
            max_marks: Maximum marks (default 10)
            question: Question text (optional)
        
        Returns:
            Complete evaluation with marks, feedback, mistakes
        """
        try:
            print(f"\n{'='*60}")
            print(f"📸 Processing Image: {image_path}")
            print(f"{'='*60}")
            
            # Image load karo
            img = Image.open(image_path)
            print("✅ Image loaded successfully!")
            
            # Gemini ko prompt do
            prompt = f"""
You are an experienced teacher evaluating a student's handwritten answer from the uploaded image.

QUESTION: {question if question else "Not provided"}

CORRECT/MODEL ANSWER:
{correct_answer}

MAXIMUM MARKS: {max_marks}

TASK:
1. First, carefully read and extract the handwritten text from the image
2. Then compare it with the correct answer
3. Evaluate the student's response fairly but strictly

Provide your evaluation in this EXACT JSON format:
{{
    "extracted_text": "The complete handwritten text you read from the image",
    "correctness": "Correct/Partially Correct/Incorrect",
    "marks_obtained": <number between 0 and {max_marks}>,
    "similarity_percentage": <0-100>,
    "spelling_mistakes": ["list", "of", "spelling", "errors"],
    "missing_points": ["key", "points", "student", "missed"],
    "strengths": ["what", "student", "did", "well"],
    "suggestions": ["specific", "improvement", "suggestions"],
    "feedback": "A brief 2-3 sentence teacher-style feedback for the student"
}}

EVALUATION CRITERIA:
- Check meaning/concept understanding, not just exact word matching
- Identify spelling and grammar mistakes
- Note missing key concepts
- Award marks proportional to correctness (85%+ similarity = full marks, 60-85% = 60% marks, <60% = 20% marks)
- Be fair but maintain academic standards
"""
            
            print("🔍 Analyzing answer...")
            
            # Gemini se evaluation karwao
            response = self.model.generate_content([prompt, img])
            result_text = response.text
            
            print("✅ Evaluation completed!")
            
            # JSON extract karo
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            # Parse karo
            result = json.loads(result_text.strip())
            
            # Extra info add karo
            result['image_path'] = image_path
            result['correct_answer'] = correct_answer
            result['max_marks'] = max_marks
            result['question'] = question
            
            return result
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {
                "error": str(e),
                "image_path": image_path
            }
    
    def evaluate_multiple_answers(self, questions_list):
        """
        Multiple questions ka evaluation
        
        Args:
            questions_list: List of dictionaries with format:
                [
                    {
                        "question_number": 1,
                        "question": "What is photosynthesis?",
                        "image_path": "answer1.jpg",
                        "correct_answer": "Plants make food...",
                        "max_marks": 10
                    },
                    ...
                ]
        
        Returns:
            Complete report with individual results + overall summary
        """
        print("\n" + "="*60)
        print("🎓 FULL ANSWER SHEET EVALUATION")
        print("="*60)
        
        results = []
        total_marks = 0
        total_max_marks = 0
        
        for q_data in questions_list:
            q_num = q_data['question_number']
            
            print(f"\n📝 Evaluating Question {q_num}...")
            
            result = self.evaluate_answer_from_image(
                image_path=q_data['image_path'],
                correct_answer=q_data['correct_answer'],
                max_marks=q_data['max_marks'],
                question=q_data.get('question', '')
            )
            
            if 'error' not in result:
                result['question_number'] = q_num
                results.append(result)
                total_marks += result['marks_obtained']
                total_max_marks += result['max_marks']
                
                # Quick preview
                print(f"   ✅ Marks: {result['marks_obtained']}/{result['max_marks']}")
                print(f"   📊 Status: {result['correctness']}")
        
        # Overall summary
        percentage = (total_marks / total_max_marks * 100) if total_max_marks > 0 else 0
        
        # Grade calculate karo
        if percentage >= 90:
            grade = 'A+'
        elif percentage >= 80:
            grade = 'A'
        elif percentage >= 70:
            grade = 'B+'
        elif percentage >= 60:
            grade = 'B'
        elif percentage >= 50:
            grade = 'C'
        elif percentage >= 40:
            grade = 'D'
        else:
            grade = 'F'
        
        report = {
            'individual_results': results,
            'total_marks': total_marks,
            'max_possible_marks': total_max_marks,
            'percentage': round(percentage, 2),
            'grade': grade,
            'total_questions': len(results)
        }
        
        return report
    
    def print_result(self, result):
        """Result ko beautifully print karo"""
        if 'error' in result:
            print(f"\n❌ ERROR: {result['error']}\n")
            return
        
        print(f"\n{'='*60}")
        print(f"📋 QUESTION {result.get('question_number', 'N/A')} - DETAILED RESULT")
        print(f"{'='*60}")
        
        if result.get('question'):
            print(f"\n❓ Question:")
            print(f"   {result['question']}")
        
        print(f"\n📝 Student's Handwritten Answer (Extracted from Image):")
        print(f"   {result['extracted_text'][:300]}...")
        
        print(f"\n📚 Model Answer:")
        print(f"   {result['correct_answer'][:200]}...")
        
        print(f"\n{'='*60}")
        print(f"📊 EVALUATION SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Correctness: {result['correctness']}")
        print(f"🎯 Marks: {result['marks_obtained']}/{result['max_marks']}")
        print(f"📈 Similarity: {result['similarity_percentage']}%")
        
        if result.get('spelling_mistakes') and len(result['spelling_mistakes']) > 0:
            print(f"\n❌ Spelling Mistakes Found:")
            for i, mistake in enumerate(result['spelling_mistakes'][:5], 1):
                print(f"   {i}. {mistake}")
        else:
            print(f"\n✅ No spelling mistakes found!")
        
        if result.get('missing_points') and len(result['missing_points']) > 0:
            print(f"\n⚠️  Missing Key Points:")
            for i, point in enumerate(result['missing_points'][:5], 1):
                print(f"   {i}. {point}")
        
        if result.get('strengths') and len(result['strengths']) > 0:
            print(f"\n✨ Strengths:")
            for i, strength in enumerate(result['strengths'][:3], 1):
                print(f"   {i}. {strength}")
        
        if result.get('suggestions') and len(result['suggestions']) > 0:
            print(f"\n💡 Suggestions for Improvement:")
            for i, suggestion in enumerate(result['suggestions'][:3], 1):
                print(f"   {i}. {suggestion}")
        
        print(f"\n🎓 Teacher's Feedback:")
        print(f"   {result['feedback']}")
        print(f"\n{'='*60}\n")
    
    def print_overall_report(self, report):
        """Overall summary print karo"""
        print(f"\n{'='*70}")
        print(f"📊 OVERALL ANSWER SHEET SUMMARY")
        print(f"{'='*70}")
        print(f"📝 Total Questions Evaluated: {report['total_questions']}")
        print(f"🎯 Total Marks Obtained: {report['total_marks']}/{report['max_possible_marks']}")
        print(f"📈 Percentage: {report['percentage']}%")
        print(f"🏆 Grade: {report['grade']}")
        print(f"{'='*70}\n")

# ================== USAGE EXAMPLES ==================
if __name__ == "__main__":
    
    # Evaluator initialize karo
    evaluator = AnswerEvaluator()
    
    # ==========================================
    # EXAMPLE 1: SINGLE ANSWER EVALUATION
    # ==========================================
    print("\n" + "="*70)
    print("EXAMPLE 1: SINGLE ANSWER EVALUATION")
    print("="*70)
    
    # Single answer evaluate karo
    result = evaluator.evaluate_answer_from_image(
        image_path="answer1.jpg",  # 👈 YAHAN APNI IMAGE PATH DALO
        question="What is photosynthesis?",
        correct_answer="Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. It occurs in chloroplasts and involves light-dependent and light-independent reactions.",
        max_marks=10
    )
    
    # Result print karo
    evaluator.print_result(result)
    
    # ==========================================
    # EXAMPLE 2: MULTIPLE ANSWERS EVALUATION
    # ==========================================
    print("\n" + "="*70)
    print("EXAMPLE 2: FULL ANSWER SHEET EVALUATION (MULTIPLE QUESTIONS)")
    print("="*70)
    
    # Answer sheet ka pura data
    questions_data = [
        {
            "question_number": 1,
            "question": "What is photosynthesis?",
            "image_path": "answer1.jpg",  # 👈 APNE IMAGE PATHS YAHAN
            "correct_answer": "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.",
            "max_marks": 10
        },
        {
            "question_number": 2,
            "question": "Explain Newton's first law of motion.",
            "image_path": "answer2.jpg",
            "correct_answer": "An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an external unbalanced force.",
            "max_marks": 5
        },
        {
            "question_number": 3,
            "question": "What is the function of mitochondria?",
            "image_path": "answer3.jpg",
            "correct_answer": "Mitochondria is the powerhouse of the cell that produces ATP through cellular respiration, providing energy for cellular activities.",
            "max_marks": 8
        }
    ]
    
    # Full sheet evaluate karo
    full_report = evaluator.evaluate_multiple_answers(questions_data)
    
    # Individual results print karo
    print("\n" + "="*70)
    print("DETAILED QUESTION-WISE RESULTS")
    print("="*70)
    
    for result in full_report['individual_results']:
        evaluator.print_result(result)
    
    # Overall summary
    evaluator.print_overall_report(full_report)
    
    # ==========================================
    # EXAMPLE 3: QUICK SINGLE EVALUATION
    # ==========================================
    print("\n" + "="*70)
    print("EXAMPLE 3: QUICK EVALUATION")
    print("="*70)
    
    quick_result = evaluator.evaluate_answer_from_image(
        image_path="student_answer.jpg",  # 👈 APNI IMAGE
        correct_answer="The capital of France is Paris.",
        max_marks=5
    )
    
    evaluator.print_result(quick_result)
