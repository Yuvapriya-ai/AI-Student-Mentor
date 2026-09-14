from flask import Flask, render_template, request, jsonify, session, redirect
import mysql.connector
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
app.secret_key = "ai_student_mentor_secret_key"

# MySQL Database Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="yuvapriya@1617",
    database="ai_student_mentor"
)

@app.route("/welcome")
def welcome():
    return render_template("welcome.html")

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "GET":
        return render_template("register.html")

    data = request.get_json()

    name = data.get("name", "")
    email = data.get("email", "")
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    cursor = db.cursor()

    # Check whether the email already exists
    cursor.execute(
        "SELECT id FROM student_account WHERE email = %s",
        (email,)
    )

    existing = cursor.fetchone()

    if existing:
        cursor.close()

        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    # Create new account
    cursor.execute("""
        INSERT INTO student_account (name, email, password)
        VALUES (%s, %s, %s)
    """, (
        name,
        email,
        password
    ))

    db.commit()
    cursor.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully."
    })

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "GET":
        return render_template("login.html")

    data = request.get_json()

    email = data.get("email", "")
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    cursor = db.cursor()

    cursor.execute(
        "SELECT id, name, email FROM student_account WHERE email = %s AND password = %s",
        (email, password)
    )

    account = cursor.fetchone()

    cursor.close()

    if account:
        session["student_id"] = account[0]
        session["student_name"] = account[1]
        session["student_email"] = account[2]

        return jsonify({
            "success": True,
            "message": "Login successful."
        })

    return jsonify({
        "success": False,
        "message": "Invalid email or password."
    }), 401

@app.route("/logout")
def logout():

    session.clear()

    return redirect("/login")
    
def login_required():
    if "student_id" not in session:
        return redirect("/login")
    return None

# 1. Main Dashboard
@app.route('/')
@app.route('/index')
def index():

    check = login_required()

    if check:
        return check

    return render_template('index.html')

# 2. Profile
@app.route('/profile')
def profile():
    check = login_required()

    if check:
        return check

    return render_template('profile.html')

@app.route('/api/profile', methods=['POST'])
def save_profile():

    # Check whether the student is logged in
    check = login_required()

    if check:
        return check

    data = request.get_json()

    # Get the logged-in student's email from the session
    email = session["student_email"]

    name = data.get('name', '')
    phone = data.get('phone', '')
    location = data.get('location', '')
    course = data.get('course', '')
    semester = data.get('semester')
    skills = data.get('skills', '')
    career_goal = data.get('career_goal', '')

    cursor = db.cursor()

    # Check whether this logged-in student already has a profile
    cursor.execute(
        "SELECT id FROM student_profile WHERE email = %s",
        (email,)
    )

    existing = cursor.fetchone()

    if existing:

        # Update existing student's profile
        cursor.execute("""
            UPDATE student_profile
            SET name=%s,
                phone=%s,
                location=%s,
                course=%s,
                semester=%s,
                skills=%s,
                career_goal=%s
            WHERE id=%s
        """, (
            name,
            phone,
            location,
            course,
            semester,
            skills,
            career_goal,
            existing[0]
        ))

    else:

        # Create a new profile for this student
        cursor.execute("""
            INSERT INTO student_profile
            (name, email, phone, location, course, semester, skills, career_goal)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            name,
            email,
            phone,
            location,
            course,
            semester,
            skills,
            career_goal
        ))

    db.commit()
    cursor.close()

    return jsonify({
        "success": True,
        "message": "Profile saved successfully."
    })


# 3. Learning Roadmap
@app.route('/roadmap')
def roadmap():

    check = login_required()

    if check:
        return check

    return render_template('roadmap.html')

# 4. AI Project Mentor
@app.route('/mentor')
def mentor():

    check = login_required()

    if check:
        return check

    return render_template('mentor.html')

# 5. Documentation Assistant
@app.route('/documentation')
def documentation():

    check = login_required()

    if check:
        return check

    return render_template('documentation.html')

# 6. Project Viva Assistant
@app.route('/viva')
def viva():

    check = login_required()

    if check:
        return check

    return render_template('viva.html')

# 7. AI Study Assistant
@app.route('/study_assist')
def study_assist():

    check = login_required()

    if check:
        return check

    return render_template('study_assist.html')

# 8. Project Progress Tracker
@app.route('/progress')
def progress():

    check = login_required()

    if check:
        return check

    return render_template('progress.html')

# 9. AI Project Idea Evaluator
@app.route('/evaluator')
def evaluator():

    check = login_required()

    if check:
        return check

    return render_template('evaluator.html')

@app.route("/test-gemini")
def test_gemini():
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents="Say hello to my AI Student Mentor project in one short sentence."
    )
    return response.text

@app.route("/api/mentor", methods=["POST"])
def mentor_api():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=f"""
You are the AI Project Mentor in an AI Student Mentor system.

Help BCA students with:
- software projects
- programming
- databases
- web development
- AI/ML
- project planning
- debugging
- documentation
- viva preparation

Give clear, practical, beginner-friendly answers.
If the student asks for code, explain the code briefly.
Do not make answers unnecessarily long.

Student's question:
{user_message}
"""
        )

        return jsonify({"response": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)