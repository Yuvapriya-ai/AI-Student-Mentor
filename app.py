from flask import Flask, render_template, request, jsonify, session, redirect, g
import mysql.connector
import os
import json
import re
from dotenv import load_dotenv
from google import genai


# =========================================================
# MENTOR RESPONSE CLEANER
# =========================================================

def clean_mentor_response(text):
    if not text:
        return ""

    cleaned = text.strip()

    # Normalize line endings
    cleaned = cleaned.replace("\r\n", "\n")
    cleaned = cleaned.replace("\r", "\n")

    # Remove one or more backslashes before punctuation.
    # Examples:
    # \-  -> -
    # \\- -> -
    # \.  -> .
    # \*  -> *
    # \_  -> _
    # \`  -> `
    # \#  -> #
    # \:  -> :
    # \(  -> (
    # \)  -> )
    # \[  -> [
    # \]  -> ]
    # \{  -> {
    # \}  -> }
    # \!  -> !
    # \?  -> ?
    # \/  -> /
    cleaned = re.sub(
        r"\\+([\-.*_`#:()\[\]{}!?/])",
        r"\1",
        cleaned
    )

    # Remove Markdown bold markers
    cleaned = cleaned.replace("**", "")

    # Remove any remaining escaped punctuation
    cleaned = re.sub(
        r"\\+([^\w\s])",
        r"\1",
        cleaned
    )

    return cleaned.strip()


# =========================================================
# ENVIRONMENT / GEMINI
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=GEMINI_API_KEY
)

print("GEMINI KEY LOADED:", bool(GEMINI_API_KEY))

PRIMARY_GEMINI_MODEL = "gemini-3.5-flash-lite"
FALLBACK_GEMINI_MODEL = "gemini-3.5-flash-lite"

def generate_gemini_content(prompt):
    max_attempts = 3

    for attempt in range(1, max_attempts + 1):
        print(
            f"GEMINI REQUEST: {PRIMARY_GEMINI_MODEL} "
            f"(attempt {attempt}/{max_attempts})"
        )

        try:
            response = client.models.generate_content(
                model=PRIMARY_GEMINI_MODEL,
                contents=prompt
            )

            if response and response.text:
                print(
                    "GEMINI RESPONSE:",
                    PRIMARY_GEMINI_MODEL
                )
                return response

            raise RuntimeError(
                "Gemini returned an empty response."
            )

        except Exception as error:
            print(
                f"GEMINI ATTEMPT {attempt} ERROR:",
                repr(error)
            )

            if attempt < max_attempts:
                import time
                time.sleep(2)
            else:
                print(
                    "GEMINI FAILED AFTER",
                    max_attempts,
                    "ATTEMPTS"
                )
                raise error


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)

app.secret_key = "ai_student_mentor_secret_key"


# =========================================================
# MYSQL DATABASE
# =========================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "yuvapriya@1617",
    "database": "ai_student_mentor"
}


def get_db():

    if "db" not in g:

        g.db = mysql.connector.connect(
            **DB_CONFIG
        )

    return g.db


@app.teardown_appcontext
def close_db(exception=None):

    db_connection = g.pop("db", None)

    if db_connection is not None:

        try:
            db_connection.close()

        except Exception:
            pass


class DatabaseProxy:

    def connect(self):
        return get_db()

    def cursor(self, *args, **kwargs):
        return get_db().cursor(*args, **kwargs)

    def commit(self):
        return get_db().commit()

    def rollback(self):
        return get_db().rollback()


db = DatabaseProxy()


# =========================================================
# AUTHENTICATION
# =========================================================

@app.route("/welcome")
def welcome():

    return render_template("welcome.html")


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "GET":

        return render_template("register.html")

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid registration data."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not name or not email or not password:

        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    cursor = db.cursor()

    try:

        cursor.execute(
            """
            SELECT id
            FROM student_account
            WHERE email = %s
            """,
            (email,)
        )

        existing = cursor.fetchone()

        if existing:

            return jsonify({
                "success": False,
                "message":
                    "An account with this email already exists."
            }), 409

        cursor.execute(
            """
            INSERT INTO student_account
            (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (
                name,
                email,
                password
            )
        )

        db.commit()

        return jsonify({
            "success": True,
            "message":
                "Account created successfully."
        })

    except mysql.connector.Error as e:

        db.rollback()

        print(
            "REGISTER ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to create account."
        }), 500

    finally:

        cursor.close()


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "GET":

        return render_template("login.html")

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid login data."
        }), 400

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:

        return jsonify({
            "success": False,
            "message":
                "Email and password are required."
        }), 400

    cursor = db.cursor()

    try:

        cursor.execute(
            """
            SELECT id, name, email
            FROM student_account
            WHERE email = %s
            AND password = %s
            """,
            (
                email,
                password
            )
        )

        account = cursor.fetchone()

        if account:

            session["student_id"] = account[0]
            session["student_name"] = account[1]
            session["student_email"] = account[2]

            return jsonify({
                "success": True,
                "message":
                    "Login successful."
            })

        return jsonify({
            "success": False,
            "message":
                "Invalid email or password."
        }), 401

    finally:

        cursor.close()


@app.route("/logout")
def logout():

    session.clear()

    return redirect("/login")


def login_required():

    if "student_id" not in session:

        next_page = request.path

        return redirect(
            f"/login?next={next_page}"
        )

    return None


# =========================================================
# STUDENT PROFILE HELPER
# =========================================================

def get_student_profile():

    if "student_id" not in session:

        return None

    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                student_id,
                name,
                email,
                course,
                semester,
                skills,
                career_goal,
                phone,
                location
            FROM student_profile
            WHERE student_id = %s
            """,
            (
                session["student_id"],
            )
        )

        return cursor.fetchone()

    finally:

        cursor.close()


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/")
@app.route("/index")
def index():

    check = login_required()

    if check:
        return check

    return render_template("index.html")


# =========================================================
# PROFILE
# =========================================================

@app.route("/profile")
def profile():

    check = login_required()

    if check:
        return check

    return render_template("profile.html")


@app.route("/api/profile", methods=["GET", "POST"])
def profile_api():

    check = login_required()

    if check:
        return check

    student_id = session["student_id"]

    if request.method == "GET":

        profile = get_student_profile()

        return jsonify({
            "success": True,
            "profile": profile
        })

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message":
                "No profile data received."
        }), 400

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    location = data.get("location", "").strip()
    course = data.get("course", "").strip()
    semester = data.get("semester")
    skills = data.get("skills", "").strip()
    career_goal = data.get("career_goal", "").strip()

    email = session["student_email"]

    cursor = db.cursor()

    try:

        cursor.execute(
            """
            SELECT id
            FROM student_profile
            WHERE student_id = %s
            """,
            (student_id,)
        )

        existing = cursor.fetchone()

        if existing:

            cursor.execute(
                """
                UPDATE student_profile
                SET
                    name = %s,
                    email = %s,
                    phone = %s,
                    location = %s,
                    course = %s,
                    semester = %s,
                    skills = %s,
                    career_goal = %s
                WHERE student_id = %s
                """,
                (
                    name,
                    email,
                    phone,
                    location,
                    course,
                    semester,
                    skills,
                    career_goal,
                    student_id
                )
            )

        else:

            cursor.execute(
                """
                INSERT INTO student_profile
                (
                    student_id,
                    name,
                    email,
                    phone,
                    location,
                    course,
                    semester,
                    skills,
                    career_goal
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    student_id,
                    name,
                    email,
                    phone,
                    location,
                    course,
                    semester,
                    skills,
                    career_goal
                )
            )

        db.commit()

        return jsonify({
            "success": True,
            "message":
                "Profile saved successfully."
        })

    except mysql.connector.Error as e:

        db.rollback()

        print(
            "PROFILE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to save profile."
        }), 500

    finally:

        cursor.close()


# =========================================================
# ROADMAP
# =========================================================

@app.route("/roadmap")
def roadmap():

    check = login_required()

    if check:
        return check

    return render_template("roadmap.html")


@app.route("/api/roadmap", methods=["GET", "POST"])
def roadmap_api():

    check = login_required()

    if check:
        return check

    student_id = session["student_id"]

    cursor = db.cursor()

    if request.method == "GET":

        try:

            cursor.execute(
                """
                SELECT
                    module_number,
                    topic_name,
                    completed
                FROM roadmap_progress
                WHERE student_id = %s
                AND completed = 1
                """,
                (student_id,)
            )

            rows = cursor.fetchall()

            completed_topics = []

            for row in rows:

                completed_topics.append({
                    "module_number": row[0],
                    "topic_name": row[1],
                    "completed": row[2]
                })

            return jsonify({
                "success": True,
                "completed_topics":
                    completed_topics
            })

        finally:

            cursor.close()

    data = request.get_json()

    if not data:

        cursor.close()

        return jsonify({
            "success": False,
            "message":
                "No roadmap data received."
        }), 400

    module_number = data.get("module_number")
    topic_name = data.get("topic_name")

    if (
        module_number is None
        or not topic_name
    ):

        cursor.close()

        return jsonify({
            "success": False,
            "message":
                "Module number and topic name are required."
        }), 400

    try:

        cursor.execute(
            """
            SELECT id
            FROM roadmap_progress
            WHERE student_id = %s
            AND module_number = %s
            AND topic_name = %s
            """,
            (
                student_id,
                module_number,
                topic_name
            )
        )

        existing = cursor.fetchone()

        if existing:

            cursor.execute(
                """
                UPDATE roadmap_progress
                SET completed = 1
                WHERE id = %s
                """,
                (existing[0],)
            )

        else:

            cursor.execute(
                """
                INSERT INTO roadmap_progress
                (
                    student_id,
                    module_number,
                    topic_name,
                    completed
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    1
                )
                """,
                (
                    student_id,
                    module_number,
                    topic_name
                )
            )

        db.commit()

        return jsonify({
            "success": True,
            "message":
                "Roadmap progress saved successfully."
        })

    except mysql.connector.Error as e:

        db.rollback()

        print(
            "ROADMAP ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message":
                "Could not save roadmap progress."
        }), 500

    finally:

        cursor.close()


# =========================================================
# AI ROADMAP MENTOR
# =========================================================

@app.route("/api/roadmap-ai", methods=["POST"])
def roadmap_ai_api():

    check = login_required()

    if check:
        return check

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "error":
                "No roadmap AI data received."
        }), 400

    user_message = data.get(
        "message",
        ""
    ).strip()

    if not user_message:

        return jsonify({
            "success": False,
            "error":
                "Question is required."
        }), 400

    student_id = session["student_id"]

    profile = get_student_profile()

    student_context = (
        "Student profile information is not available."
    )

    if profile:

        student_context = f"""
Student Name:

{profile.get("name", "Student")}

Course:

{profile.get("course", "BCA")}

Semester:

{profile.get("semester", "Not specified")}

Skills:

{profile.get("skills", "Not specified")}

Career Goal:

{profile.get("career_goal", "Not specified")}

"""

    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                module_number,
                topic_name,
                completed
            FROM roadmap_progress
            WHERE student_id = %s
            AND completed = 1
            ORDER BY
                module_number,
                topic_name
            """,
            (student_id,)
        )

        completed_topics = cursor.fetchall()

    except mysql.connector.Error as e:

        print(
            "ROADMAP AI DB ERROR:",
            repr(e)
        )

        completed_topics = []

    finally:

        cursor.close()

    if completed_topics:

        roadmap_context = "\n".join(
            [
                f"- Module {item['module_number']}: "
                f"{item['topic_name']}"
                for item in completed_topics
            ]
        )

    else:

        roadmap_context = (
            "No roadmap topics have been marked completed yet."
        )

    prompt = f"""

You are the AI Roadmap Mentor in an AI Student Mentor system.

{student_context}

CURRENT ROADMAP PROGRESS:

{roadmap_context}

STUDENT'S ROADMAP QUESTION:

{user_message}

IMPORTANT RULES:

- Answer specifically in the context of the student's learning roadmap.

- Use the student's actual completed topics when relevant.

- Do not invent completed topics.

- Do not claim that a roadmap module is completed unless the provided
  progress information shows it.

- If the student asks what to learn next, suggest a logical next step
  based on the available roadmap progress.

- Keep the answer clear and reasonably short.

- Use simple language suitable for a BCA student.

- If giving a learning plan, use simple bullet points.

- Do not discuss unrelated topics unless necessary to answer the question.

"""

    try:

        response = generate_gemini_content(prompt)

        mentor_response = clean_mentor_response(
            response.text
        )

        return jsonify({
            "success": True,
            "response": mentor_response
        })

    except Exception as e:

        print(
            "ROADMAP AI ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error":
                "AI Roadmap Mentor is temporarily unavailable."
        }), 500


# =========================================================
# MENTOR PAGE
# =========================================================

@app.route("/mentor")
def mentor():

    check = login_required()

    if check:
        return check

    return render_template("mentor.html")


# =========================================================
# DOCUMENTATION
# =========================================================

@app.route("/documentation")
def documentation():

    check = login_required()

    if check:
        return check

    return render_template("documentation.html")


# =========================================================
# VIVA
# =========================================================

@app.route("/viva")
def viva():

    check = login_required()

    if check:
        return check

    return render_template("viva.html")


# =========================================================
# STUDY ASSISTANT PAGE
# =========================================================

@app.route("/study_assist")
def study_assist():

    check = login_required()

    if check:
        return check

    return render_template("study_assist.html")


# =========================================================
# AI STUDY ASSISTANT API
# =========================================================

@app.route("/api/study-assist", methods=["POST"])
def study_assistant_api():

    check = login_required()

    if check:
        return check

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "error":
                "No study assistant data received."
        }), 400

    question = data.get(
        "question",
        ""
    ).strip()

    category = data.get(
        "category",
        "general"
    ).strip()

    difficulty = data.get(
        "difficulty",
        "basic"
    ).strip()

    answer_style = data.get(
        "answer_style",
        "brief"
    ).strip()

    explanation_type = data.get(
        "explanation_type",
        "simple"
    ).strip()

    if not question:

        return jsonify({
            "success": False,
            "error":
                "Question is required."
        }), 400

    profile = get_student_profile()

    if profile:

        student_context = f"""

Student Profile:

Name:

{profile.get("name", "Student")}

Course:

{profile.get("course", "BCA")}

Semester:

{profile.get("semester", "Not specified")}

Skills:

{profile.get("skills", "Not specified")}

Career Goal:

{profile.get("career_goal", "Not specified")}

"""

    else:

        student_context = """

Student Profile:

No additional profile information is available.

The student is a BCA student.

"""

    project_context = """

PROJECT TITLE:

AI Student Mentor: An Intelligent Learning and Project Guidance System

PROJECT TYPE:

AI-powered centralized web application for BCA students.

ACTUAL TECHNOLOGY STACK:

- Frontend: HTML, CSS, JavaScript

- Backend: Python

- Web Framework: Flask

- Database: MySQL

- AI Integration: Gemini API

- Development Methodology: Waterfall SDLC

ACTUAL PROJECT MODULES:

1. Student Profile Management

2. Learning Roadmap

3. AI Project Mentor

4. Documentation Assistant

5. Project Viva Assistant

6. AI Study Assistant

7. Project Progress Tracker

8. AI Project Idea Evaluator

"""

    category_description = {

        "general":
            "General project-related understanding.",

        "module":
            "Understanding one of the actual project modules.",

        "technology":
            "Understanding the technologies actually used in the project.",

        "database":
            "Understanding MySQL and database-related concepts in the project.",

        "ai":
            "Understanding AI, Gemini API, LLM concepts, and their role in this project.",

        "implementation":
            "Understanding how project features are implemented.",

        "architecture":
            "Understanding the project structure, workflow, frontend, backend, database, and AI interaction.",

        "learning":
            "Helping the student learn a project-related technical concept."

    }

    difficulty_description = {

        "basic":
            "Use simple concepts and beginner-friendly language.",

        "intermediate":
            "Explain the concept with moderate technical detail suitable for a BCA student.",

        "advanced":
            "Give deeper technical reasoning while remaining understandable to a BCA student."

    }

    style_description = {

        "brief":
            "Keep the answer short and focused.",

        "detailed":
            "Give a more complete explanation with useful details.",

        "step_by_step":
            "Explain the answer using clear numbered steps."

    }

    explanation_description = {

        "simple":
            "Use simple everyday language and easy examples when useful.",

        "academic":
            "Use clear academic language suitable for college project preparation.",

        "technical":
            "Use technically precise terminology while keeping the explanation understandable."

    }

    prompt = f"""

You are the AI Study Assistant inside the following BCA project:

AI Student Mentor:

An Intelligent Learning and Project Guidance System

Your purpose is to help the student learn and understand
their actual project and its technologies.

{project_context}

{student_context}

STUDENT'S QUESTION:

{question}

QUESTION CATEGORY:

{category_description.get(
    category,
    category_description["general"]
)}

DIFFICULTY:

{difficulty_description.get(
    difficulty,
    difficulty_description["basic"]
)}

ANSWER STYLE:

{style_description.get(
    answer_style,
    style_description["brief"]
)}

EXPLANATION TYPE:

{explanation_description.get(
    explanation_type,
    explanation_description["simple"]
)}

IMPORTANT RULES:

1. Answer the student's actual question directly.

2. Keep the answer relevant to the AI Student Mentor project
   whenever the question is project-related.

3. Use only the actual technologies listed in the project context.

4. The actual implementation uses:

   Python, Flask, MySQL, HTML, CSS, JavaScript and Gemini API.

5. Do not claim that the project uses:

   OpenAI, FastAPI, Django, React, Node.js, MongoDB,
   PostgreSQL, LangChain, RAG, or any other technology
   unless the student explicitly asks about it as a comparison.

6. Do not invent project features, modules, APIs, tables,
   database fields, algorithms, or implementation details.

7. If the student asks about a concept such as Python,
   SQL, Flask, JavaScript, AI, ML, APIs, databases,
   or web development, explain it and connect it to
   the project when appropriate.

8. If the question is completely unrelated to the project,
   briefly explain that the Study Assistant is focused on
   project-related learning and redirect the student toward
   a relevant project-learning explanation.

9. Match the requested difficulty.

10. Match the requested answer style.

11. Match the requested explanation type.

12. Keep the answer reasonably concise unless the student
    explicitly asks for a detailed explanation.

13. You may use Markdown.

14. Use Markdown headings and bullet points when they improve
    readability.

15. Do not use HTML tags.

16. Do not wrap the response inside a code block.

17. Do not start with unnecessary greetings.

18. Give practical explanations suitable for a BCA student.

Now answer the student's question.

"""

    try:

        response = generate_gemini_content(prompt)

        if not response or not response.text:

            raise RuntimeError(
                "Gemini returned an empty response."
            )

        return jsonify({
            "success": True,
            "answer":
                response.text.strip()
        })

    except Exception as e:

        print(
            "STUDY ASSISTANT GEMINI ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error":
                "AI Study Assistant is temporarily unavailable. Please try again."
        }), 500


# =========================================================
# PROGRESS TRACKER
# =========================================================

@app.route("/progress")
def progress():

    check = login_required()

    if check:
        return check

    return render_template("progress.html")


@app.route(
    "/api/progress",
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE"
    ]
)
def progress_api():

    check = login_required()

    if check:
        return check

    student_id = session["student_id"]

    if request.method == "GET":

        cursor = db.cursor(dictionary=True)

        try:

            cursor.execute(
                """
                SELECT
                    id,
                    task_name,
                    milestone,
                    priority,
                    due_date,
                    completed,
                    completed_at,
                    created_at
                FROM progress_tasks
                WHERE student_id = %s
                ORDER BY created_at ASC
                """,
                (student_id,)
            )

            tasks = cursor.fetchall()

            return jsonify({
                "success": True,
                "tasks": tasks
            })

        finally:

            cursor.close()

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Request data is required."
        }), 400

    if request.method == "POST":

        task_name = data.get("task_name")
        milestone = data.get("milestone")
        priority = data.get("priority")
        due_date = data.get("due_date")

        if (
            not task_name
            or not milestone
            or not priority
        ):

            return jsonify({
                "success": False,
                "message":
                    "Required fields are missing."
            }), 400

        cursor = db.cursor()

        try:

            cursor.execute(
                """
                INSERT INTO progress_tasks
                (
                    student_id,
                    task_name,
                    milestone,
                    priority,
                    due_date,
                    completed
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    FALSE
                )
                """,
                (
                    student_id,
                    task_name,
                    milestone,
                    priority,
                    due_date if due_date else None
                )
            )

            db.commit()

            task_id = cursor.lastrowid

            return jsonify({
                "success": True,
                "message":
                    "Task added successfully.",
                "task_id":
                    task_id
            })

        except mysql.connector.Error as e:

            db.rollback()

            print(
                "PROGRESS POST ERROR:",
                repr(e)
            )

            return jsonify({
                "success": False,
                "message":
                    "Unable to add task."
            }), 500

        finally:

            cursor.close()

    if request.method == "PUT":

        task_id = data.get("id")
        completed = data.get("completed")

        if (
            task_id is None
            or completed is None
        ):

            return jsonify({
                "success": False,
                "message":
                    "Task ID and completion status are required."
            }), 400

        cursor = db.cursor()

        try:

            if completed:

                cursor.execute(
                    """
                    UPDATE progress_tasks
                    SET
                        completed = TRUE,
                        completed_at = NOW()
                    WHERE id = %s
                    AND student_id = %s
                    """,
                    (
                        task_id,
                        student_id
                    )
                )

            else:

                cursor.execute(
                    """
                    UPDATE progress_tasks
                    SET
                        completed = FALSE,
                        completed_at = NULL
                    WHERE id = %s
                    AND student_id = %s
                    """,
                    (
                        task_id,
                        student_id
                    )
                )

            db.commit()

            return jsonify({
                "success": True,
                "message":
                    "Task updated successfully."
            })

        finally:

            cursor.close()

    if request.method == "DELETE":

        task_id = data.get("id")

        if task_id is None:

            return jsonify({
                "success": False,
                "message":
                    "Task ID is required."
            }), 400

        cursor = db.cursor()

        try:

            cursor.execute(
                """
                DELETE FROM progress_tasks
                WHERE id = %s
                AND student_id = %s
                """,
                (
                    task_id,
                    student_id
                )
            )

            db.commit()

            return jsonify({
                "success": True,
                "message":
                    "Task deleted successfully."
            })

        finally:

            cursor.close()


# =========================================================
# IDEA EVALUATOR PAGE
# =========================================================

@app.route("/evaluator")
def evaluator():

    check = login_required()

    if check:
        return check

    return render_template("evaluator.html")


# =========================================================
# GLOBAL AI MENTOR
# =========================================================

@app.route("/api/mentor", methods=["POST"])
def mentor_api():

    check = login_required()

    if check:
        return check

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400

    user_message = data.get(
        "message",
        ""
    ).strip()

    if not user_message:

        return jsonify({
            "success": False,
            "error":
                "Message is required."
        }), 400

    profile = get_student_profile()

    student_context = ""

    if profile:

        student_context = f"""

CURRENT STUDENT PROFILE:

Name:

{profile.get("name", "Student")}

Course:

{profile.get("course", "BCA")}

Semester:

{profile.get("semester", "Not specified")}

Skills:

{profile.get("skills", "Not specified")}

Career Goal:

{profile.get("career_goal", "Not specified")}

"""

    project_context = """

CURRENT PROJECT:

Project Title:

AI Student Mentor: An Intelligent Learning and Project Guidance System

Project Type:

AI-powered centralized web application for BCA students.

ACTUAL TECHNOLOGY STACK:

- Python

- Flask

- MySQL

- HTML

- CSS

- JavaScript

- Gemini API

ACTUAL FLASK APPLICATION:

- app.py

ACTUAL HTML FILES:

- index.html

- profile.html

- roadmap.html

- mentor.html

- documentation.html

- viva.html

- study_assist.html

- progress.html

- evaluator.html

ACTUAL CSS FILES:

- style.css

- profile.css

- roadmap.css

- mentor.css

- documentation.css

- viva.css

- study_assist.css

- progress.css

- evaluator.css

ACTUAL JAVASCRIPT FILES:

- script.js

- profile.js

- roadmap.js

- mentor.js

- documentation.js

- viva.js

- study_assist.js

- progress.js

- evaluator.js

ACTUAL PROJECT MODULES:

1. Student Profile Management

2. Learning Roadmap

3. AI Project Mentor

4. Documentation Assistant

5. Project Viva Assistant

6. AI Study Assistant

7. Project Progress Tracker

8. AI Project Idea Evaluator

DATABASE:

- MySQL

- Database: ai_student_mentor

CURRENT BACKEND:

- Flask routes are handled in app.py.

- MySQL is connected from the Flask application.

- Student profile information is stored in MySQL.

- Roadmap progress is stored in MySQL.

- Project progress tasks are stored in MySQL.

- Gemini is used for AI functionality.

FRONTEND:

- HTML pages are stored in templates.

- CSS files are stored in static/css.

- JavaScript files are stored in static/js.

- The pages communicate with Flask API routes using JavaScript fetch requests.

"""

    mentor_rules = """

IMPORTANT MENTOR RULES:

1. You are mentoring the student's EXISTING AI Student Mentor project.

2. Always answer based on the ACTUAL PROJECT CONTEXT provided above.

3. Do not invent files, folders, technologies, modules, APIs,
   database tables, database fields, or features.

4. When the student asks about the project structure, explain ONLY
   the CURRENT project structure that is actually provided above.

5. Use these actual project files when explaining the structure:

   Backend:

   app.py

   HTML:

   index.html
   profile.html
   roadmap.html
   mentor.html
   documentation.html
   viva.html
   study_assist.html
   progress.html
   evaluator.html

   CSS:

   style.css
   profile.css
   roadmap.css
   mentor.css
   documentation.css
   viva.css
   study_assist.css
   progress.css
   evaluator.css

   JavaScript:

   script.js
   profile.js
   roadmap.js
   mentor.js
   documentation.js
   viva.js
   study_assist.js
   progress.js
   evaluator.js

6. Do not introduce files such as:

   config.py
   base.html
   db.py
   utils/
   gemini_helper.py
   schema.sql
   database/
   study.html
   tracker.html

7. Do not suggest creating new files when the student is asking
   about the CURRENT project structure.

8. Do not turn a current-structure question into a future
   architecture recommendation.

9. The current project uses:

   Python
   Flask
   MySQL
   HTML
   CSS
   JavaScript
   Gemini API

10. Do not say that the current implemented project uses OpenAI.

11. Do not replace Flask with Django, FastAPI, Node.js, or another
    backend framework.

12. Do not replace MySQL with MongoDB, PostgreSQL, SQLite, or another
    database.

13. Do not claim that React, Angular, Vue, Bootstrap, Tailwind,
    LangChain, RAG, or other technologies are currently used.

14. If the student asks for an improvement, first explain the
    current implementation and clearly label new ideas as:

    Optional future enhancement.

15. Keep answers practical and suitable for a BCA final-year project.

16. Answer the student's exact question directly.

17. Do not add unnecessary greetings.

18. Do not ask unnecessary follow-up questions.

19. Keep answers reasonably short unless the student asks for more detail.

20. Return clean plain text only.

21. Do NOT use Markdown formatting.

22. Do NOT use bold markers such as **.

23. Do NOT use backticks.

24. Do NOT use Markdown code fences.

25. Do NOT use Markdown tables.

26. Use normal hyphens for bullet points.

27. Use normal numbers followed by a period for numbered lists.

28. NEVER put a backslash before a hyphen or period.

29. NEVER output escaped punctuation.

30. Never escape normal punctuation with a backslash.

31. If you need a bullet, write exactly:

    - item

32. If you need a numbered item, write exactly:

    1. item
    2. item

33. If showing the project structure, use normal indentation,
    normal hyphens, and normal punctuation.

34. Do not output escaped Markdown characters.

35. Do not output explanations about these formatting rules.

36. Return only the actual answer to the student's question.

"""

    prompt = f"""

You are the AI Project Mentor inside:

AI Student Mentor:

An Intelligent Learning and Project Guidance System.

Your job is to help the student build, understand, debug,
and improve their EXISTING project.

{project_context}

{student_context}

{mentor_rules}

STUDENT QUESTION:

{user_message}

Answer the student's question now.

IMPORTANT:

- Use the actual project context above.

- Personalize the answer using the student's profile when useful.

- Do not invent project files.

- Do not invent technologies.

- Do not invent modules.

- Do not invent database details.

- Do not redesign the project unless explicitly requested.

- If the student asks about the current structure, describe
  the CURRENT structure first.

- If something is only a suggestion, clearly identify it as
  an optional improvement.

- Keep the answer practical and beginner-friendly.

- Never escape hyphens, periods, asterisks, backticks, or other punctuation with backslashes.

- Use normal hyphens for bullet points.

- Use normal periods after numbered lists.

- Return clean plain text that can be displayed directly in the chat.

"""

    try:

        response = generate_gemini_content(prompt)

        if not response or not response.text:

            raise RuntimeError(
                "Gemini returned an empty response."
            )

        mentor_response = clean_mentor_response(
            response.text
        )

        print("CLEANED MENTOR RESPONSE:")
        print(mentor_response)

        return jsonify({
            "success": True,
            "response": mentor_response
        })

    except Exception as e:

        print(
            "MENTOR GEMINI ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error":
                "AI Mentor is temporarily unavailable."
        }), 500


# =========================================================
# DOCUMENTATION API
# =========================================================

@app.route("/api/documentation", methods=["POST"])
def documentation_api():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400

    document_type = data.get(
        "type",
        ""
    ).strip()

    description = data.get(
        "description",
        ""
    ).strip()

    style = data.get(
        "style",
        ""
    ).strip()

    length = data.get(
        "length",
        ""
    ).strip()

    if not description:

        return jsonify({
            "error":
                "Project description is required"
        }), 400

    prompt = f"""

You are the Documentation Assistant for this specific BCA project.

Project Title:

AI Student Mentor: An Intelligent Learning and Project Guidance System

Actual Technology Stack:

- Frontend: HTML, CSS, JavaScript

- Backend: Python with Flask

- Database: MySQL

- AI Integration: Gemini API

Development Methodology:

- Waterfall Software Development Life Cycle (SDLC)

Actual Project Modules:

1. Student Profile Management

2. Learning Roadmap

3. AI Project Mentor

4. Documentation Assistant

5. Project Viva Assistant

6. AI Study Assistant

7. Project Progress Tracker

8. AI Project Idea Evaluator

Document Type:

{document_type}

Project Description:

{description}

Writing Style:

{style}

Document Length:

{length}

IMPORTANT RULES:

- Use ONLY the actual project technologies and modules given above.

- Do not invent technologies or features.

- Do not use Agile methodology.

- Do not replace Flask with another backend.

- Do not replace MySQL with another database.

- Do not replace HTML/CSS/JavaScript with another frontend framework.

- Do not mention OpenAI as the implemented AI provider.

- Keep the documentation suitable for a BCA academic project.

- Use clear professional academic language.

- Use Markdown headings and bullet points.

- Do not use HTML tags.

"""

    try:

        response = generate_gemini_content(prompt)

        return jsonify({
            "success": True,
            "response":
                response.text
        })

    except Exception as e:

        print(
            "DOCUMENTATION GEMINI ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error":
                "Documentation AI is temporarily unavailable."
        }), 500


# =========================================================
# VIVA API
# =========================================================

@app.route("/api/viva", methods=["POST"])
def viva_api():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "error":
                "Invalid request."
        }), 400

    category = data.get(
        "category",
        "mixed"
    )

    difficulty = data.get(
        "difficulty",
        "intermediate"
    )

    count = data.get(
        "count",
        "5"
    )

    project_info = data.get(
        "project_info",
        ""
    ).strip()

    if not project_info:

        return jsonify({
            "success": False,
            "error":
                "Project information is required."
        }), 400

    prompt = f"""

You are an AI Viva Assistant for a BCA student's project.

PROJECT INFORMATION:

{project_info}

VIVA REQUIREMENTS:

Category:

{category}

Difficulty:

{difficulty}

Number of questions:

{count}

Generate exactly {count} viva questions.

Cover appropriate areas such as:

- Project introduction

- Objectives

- Technologies used

- Project modules

- Implementation

- Database

- Frontend

- Backend

- AI/Gemini API

- Project workflow

- Testing

- Challenges

- Future enhancements

IMPORTANT:

- Use only facts provided in PROJECT INFORMATION.

- Do not invent technologies.

- Do not invent database tables or fields.

- Do not invent APIs or features.

- Do not claim unsupported implementation details.

- Actual project stack:

  HTML, CSS, JavaScript, Python Flask, MySQL, Gemini API.

For every question provide:

1. Question

2. Model answer

Return ONLY valid JSON.

Format:

[
    {{
        "question": "Question text",
        "answer": "Model answer"
    }}
]

"""

    try:

        response = generate_gemini_content(prompt)

        response_text = response.text.strip()

        if response_text.startswith("```"):

            response_text = response_text.replace(
                "```json",
                ""
            )

            response_text = response_text.replace(
                "```",
                ""
            )

            response_text = response_text.strip()

        questions = json.loads(response_text)

        return jsonify({
            "success": True,
            "questions":
                questions
        })

    except Exception as e:

        print(
            "VIVA API ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error":
                "Viva AI is temporarily unavailable."
        }), 500


# =========================================================
# TEST GEMINI
# =========================================================

@app.route("/test-gemini")
def test_gemini():

    try:

        response = generate_gemini_content(
            """
            Say hello to my AI Student Mentor
            project in one short sentence.
            """
        )

        return response.text

    except Exception as e:

        print(
            "TEST GEMINI ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "error":
                "Gemini test failed."
        }), 500


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )