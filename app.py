from flask import Flask, render_template, request, jsonify, session, redirect, g
import mysql.connector
import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()


# =========================================================
# GEMINI CONFIGURATION
# =========================================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

print(
    "GEMINI KEY LOADED:",
    bool(os.getenv("GEMINI_API_KEY"))
)


# =========================================================
# FLASK CONFIGURATION
# =========================================================

app = Flask(__name__)

app.secret_key = "ai_student_mentor_secret_key"


# =========================================================
# MYSQL DATABASE CONFIGURATION
# =========================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "yuvapriya@1617",
    "database": "ai_student_mentor"
}


# =========================================================
# GET DATABASE CONNECTION
#
# A fresh connection is used for each Flask request.
# This prevents MySQL "Commands out of sync" errors
# caused by sharing one connection between requests.
# =========================================================

def get_db_connection():

    if "db_connection" not in g:

        g.db_connection = mysql.connector.connect(
            **DB_CONFIG
        )

    return g.db_connection


# =========================================================
# CLOSE DATABASE CONNECTION AFTER REQUEST
# =========================================================

@app.teardown_appcontext
def close_db_connection(exception=None):

    db = g.pop(
        "db_connection",
        None
    )

    if db is not None:

        try:
            db.close()

        except mysql.connector.Error:
            pass


# =========================================================
# DATABASE PROXY
#
# Existing routes use:
#
#     db.cursor()
#     db.commit()
#
# This proxy allows us to keep those routes unchanged
# while using a separate connection for each request.
# =========================================================

class DatabaseProxy:

    def cursor(self, *args, **kwargs):

        return get_db_connection().cursor(
            *args,
            **kwargs
        )

    def commit(self):

        return get_db_connection().commit()

    def rollback(self):

        return get_db_connection().rollback()

    def close(self):

        return get_db_connection().close()

    def is_connected(self):

        return get_db_connection().is_connected()


db = DatabaseProxy()


# =========================================================
# WELCOME
# =========================================================

@app.route("/welcome")
def welcome():

    return render_template(
        "welcome.html"
    )


# =========================================================
# REGISTER
# =========================================================

@app.route(
    "/register",
    methods=["GET", "POST"]
)
def register():

    if request.method == "GET":

        return render_template(
            "register.html"
        )

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No registration data received."
        }), 400

    name = data.get(
        "name",
        ""
    ).strip()

    email = data.get(
        "email",
        ""
    ).strip()

    password = data.get(
        "password",
        ""
    )

    if not name or not email or not password:

        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    cursor = db.cursor()

    try:

        # Check whether email already exists

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
                "message": "An account with this email already exists."
            }), 409

        # Create account

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
            "message": "Account created successfully."
        })

    except mysql.connector.Error as e:

        db.rollback()

        print(
            "REGISTER DATABASE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Could not create account."
        }), 500

    finally:

        cursor.close()


# =========================================================
# LOGIN
# =========================================================

@app.route(
    "/login",
    methods=["GET", "POST"]
)
def login():

    if request.method == "GET":

        return render_template(
            "login.html"
        )

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No login data received."
        }), 400

    email = data.get(
        "email",
        ""
    ).strip()

    password = data.get(
        "password",
        ""
    )

    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Email and password are required."
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

    except mysql.connector.Error as e:

        print(
            "LOGIN DATABASE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Database error during login."
        }), 500

    finally:

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


# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():

    session.clear()

    return redirect("/login")


# =========================================================
# LOGIN CHECK
# =========================================================

def login_required():

    if "student_id" not in session:

        next_page = request.path

        return redirect(
            f"/login?next={next_page}"
        )

    return None


# =========================================================
# GET STUDENT PROFILE
# Used by AI Mentor
# =========================================================

def get_student_profile():

    student_id = session.get(
        "student_id"
    )

    if not student_id:

        return None

    cursor = db.cursor(
        dictionary=True
    )

    try:

        cursor.execute(
            """
            SELECT
                p.name,
                p.email,
                p.phone,
                p.location,
                p.course,
                p.semester,
                p.skills,
                p.career_goal
            FROM student_profile p
            WHERE p.student_id = %s
            """,
            (
                student_id,
            )
        )

        profile = cursor.fetchone()

        return profile

    finally:

        cursor.close()


# =========================================================
# 1. MAIN DASHBOARD
# =========================================================

@app.route("/")
@app.route("/index")
def index():

    check = login_required()

    if check:

        return check

    return render_template(
        "index.html"
    )


# =========================================================
# 2. PROFILE PAGE
# =========================================================

@app.route("/profile")
def profile():

    check = login_required()

    if check:

        return check

    return render_template(
        "profile.html"
    )


# =========================================================
# PROFILE API
# =========================================================

@app.route(
    "/api/profile",
    methods=["GET", "POST"]
)
def profile_api():

    check = login_required()

    if check:

        return check

    student_id = session["student_id"]


    # =====================================================
    # GET → LOAD PROFILE
    # =====================================================

    if request.method == "GET":

        cursor = db.cursor(
            dictionary=True
        )

        try:

            cursor.execute(
                """
                SELECT
                    p.id,
                    COALESCE(p.name, a.name) AS name,
                    COALESCE(p.email, a.email) AS email,
                    p.phone,
                    p.location,
                    p.course,
                    p.semester,
                    p.skills,
                    p.career_goal
                FROM student_account a
                LEFT JOIN student_profile p
                    ON p.student_id = a.id
                WHERE a.id = %s
                """,
                (
                    student_id,
                )
            )

            profile = cursor.fetchone()

        finally:

            cursor.close()

        if not profile:

            return jsonify({
                "success": False,
                "message": "Student account not found."
            }), 404

        profile.pop(
            "id",
            None
        )

        return jsonify({
            "success": True,
            "profile": profile
        })


    # =====================================================
    # POST → CREATE OR UPDATE PROFILE
    # =====================================================

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No profile data received."
        }), 400


    name = data.get(
        "name",
        ""
    ).strip()

    phone = data.get(
        "phone",
        ""
    ).strip()

    location = data.get(
        "location",
        ""
    ).strip()

    course = data.get(
        "course",
        ""
    ).strip()

    semester = data.get(
        "semester"
    )

    skills = data.get(
        "skills",
        ""
    ).strip()

    career_goal = data.get(
        "career_goal",
        ""
    ).strip()


    # =====================================================
    # BASIC VALIDATION
    # =====================================================

    if not name:

        return jsonify({
            "success": False,
            "message": "Name is required."
        }), 400


    # Email comes from logged-in account

    email = session["student_email"]


    cursor = db.cursor()

    try:

        # =================================================
        # CHECK WHETHER PROFILE EXISTS
        # =================================================

        cursor.execute(
            """
            SELECT id
            FROM student_profile
            WHERE student_id = %s
            """,
            (
                student_id,
            )
        )

        existing = cursor.fetchone()


        # =================================================
        # UPDATE EXISTING PROFILE
        # =================================================

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


        # =================================================
        # CREATE NEW PROFILE
        # =================================================

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


        # =================================================
        # GET SAVED PROFILE
        # =================================================

        cursor.execute(
            """
            SELECT
                name,
                email,
                phone,
                location,
                course,
                semester,
                skills,
                career_goal
            FROM student_profile
            WHERE student_id = %s
            """,
            (
                student_id,
            )
        )

        saved_profile = cursor.fetchone()


    except mysql.connector.Error as e:

        db.rollback()

        print(
            "PROFILE DATABASE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Could not save profile."
        }), 500

    finally:

        cursor.close()


    return jsonify({
        "success": True,
        "message": "Profile saved successfully.",
        "profile": saved_profile
    })


# =========================================================
# 3. LEARNING ROADMAP
# =========================================================

@app.route("/roadmap")
def roadmap():

    check = login_required()

    if check:

        return check

    return render_template(
        "roadmap.html"
    )


# =========================================================
# ROADMAP PROGRESS API
# =========================================================

@app.route(
    "/api/roadmap",
    methods=["GET", "POST"]
)
def roadmap_api():

    check = login_required()

    if check:

        return check

    student_id = session["student_id"]


    # =====================================================
    # GET → LOAD ROADMAP PROGRESS
    # =====================================================

    if request.method == "GET":

        cursor = db.cursor()

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
                (
                    student_id,
                )
            )

            rows = cursor.fetchall()

        finally:

            cursor.close()


        completed_topics = []

        for row in rows:

            completed_topics.append({
                "module_number": row[0],
                "topic_name": row[1],
                "completed": row[2]
            })


        return jsonify({
            "success": True,
            "completed_topics": completed_topics
        })


    # =====================================================
    # POST → SAVE COMPLETED TOPIC
    # =====================================================

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No roadmap data received."
        }), 400


    module_number = data.get(
        "module_number"
    )

    topic_name = data.get(
        "topic_name"
    )


    if module_number is None or not topic_name:

        return jsonify({
            "success": False,
            "message": "Module number and topic name are required."
        }), 400


    cursor = db.cursor()

    try:

        # =================================================
        # CHECK WHETHER TOPIC ALREADY EXISTS
        # =================================================

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

            # =============================================
            # MARK EXISTING TOPIC COMPLETED
            # =============================================

            cursor.execute(
                """
                UPDATE roadmap_progress
                SET completed = 1
                WHERE id = %s
                """,
                (
                    existing[0],
                )
            )

        else:

            # =============================================
            # CREATE NEW PROGRESS RECORD
            # =============================================

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


    except mysql.connector.Error as e:

        db.rollback()

        print(
            "ROADMAP DATABASE ERROR:",
            repr(e)
        )

        return jsonify({
            "success": False,
            "message": "Could not save roadmap progress."
        }), 500

    finally:

        cursor.close()


    return jsonify({
        "success": True,
        "message": "Roadmap progress saved successfully."
    })


# =========================================================
# 4. AI PROJECT MENTOR PAGE
# =========================================================

@app.route("/mentor")
def mentor():

    check = login_required()

    if check:

        return check

    return render_template(
        "mentor.html"
    )


# =========================================================
# 5. DOCUMENTATION ASSISTANT PAGE
# =========================================================

@app.route("/documentation")
def documentation():

    check = login_required()

    if check:

        return check

    return render_template(
        "documentation.html"
    )


# =========================================================
# 6. PROJECT VIVA ASSISTANT PAGE
# =========================================================

@app.route("/viva")
def viva():

    check = login_required()

    if check:

        return check

    return render_template(
        "viva.html"
    )


# =========================================================
# 7. AI STUDY ASSISTANT PAGE
# =========================================================

@app.route("/study_assist")
def study_assist():

    check = login_required()

    if check:

        return check

    return render_template(
        "study_assist.html"
    )


# =========================================================
# 8. PROJECT PROGRESS TRACKER PAGE
# =========================================================

@app.route("/progress")
def progress():

    check = login_required()

    if check:

        return check

    return render_template(
        "progress.html"
    )


# =========================================================
# PROGRESS TRACKER API
# =========================================================

@app.route(
    "/api/progress",
    methods=["GET", "POST", "PUT", "DELETE"]
)
def progress_api():

    check = login_required()

    if check:

        return check

    student_id = session["student_id"]


    # =====================================================
    # GET TASKS
    # =====================================================

    if request.method == "GET":

        cursor = db.cursor(
            dictionary=True
        )

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
                (
                    student_id,
                )
            )

            tasks = cursor.fetchall()

        finally:

            cursor.close()


        return jsonify({
            "success": True,
            "tasks": tasks
        })


    # =====================================================
    # ADD NEW TASK
    # =====================================================

    if request.method == "POST":

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "No task data received."
            }), 400


        task_name = data.get(
            "task_name"
        )

        milestone = data.get(
            "milestone"
        )

        priority = data.get(
            "priority"
        )

        due_date = data.get(
            "due_date"
        )


        if not task_name or not milestone or not priority:

            return jsonify({
                "success": False,
                "message": "Required fields are missing."
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


        except mysql.connector.Error as e:

            db.rollback()

            print(
                "PROGRESS ADD DATABASE ERROR:",
                repr(e)
            )

            return jsonify({
                "success": False,
                "message": "Could not add task."
            }), 500

        finally:

            cursor.close()


        return jsonify({
            "success": True,
            "message": "Task added successfully.",
            "task_id": task_id
        })


    # =====================================================
    # UPDATE TASK / MARK COMPLETE
    # =====================================================

    if request.method == "PUT":

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "No task data received."
            }), 400


        task_id = data.get(
            "id"
        )

        completed = data.get(
            "completed"
        )


        if task_id is None or completed is None:

            return jsonify({
                "success": False,
                "message": "Task ID and completion status are required."
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


        except mysql.connector.Error as e:

            db.rollback()

            print(
                "PROGRESS UPDATE DATABASE ERROR:",
                repr(e)
            )

            return jsonify({
                "success": False,
                "message": "Could not update task."
            }), 500

        finally:

            cursor.close()


        return jsonify({
            "success": True,
            "message": "Task updated successfully."
        })


    # =====================================================
    # DELETE TASK
    # =====================================================

    if request.method == "DELETE":

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "No task data received."
            }), 400


        task_id = data.get(
            "id"
        )


        if task_id is None:

            return jsonify({
                "success": False,
                "message": "Task ID is required."
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


        except mysql.connector.Error as e:

            db.rollback()

            print(
                "PROGRESS DELETE DATABASE ERROR:",
                repr(e)
            )

            return jsonify({
                "success": False,
                "message": "Could not delete task."
            }), 500

        finally:

            cursor.close()


        return jsonify({
            "success": True,
            "message": "Task deleted successfully."
        })


# =========================================================
# 9. AI PROJECT IDEA EVALUATOR PAGE
# =========================================================

@app.route("/evaluator")
def evaluator():

    check = login_required()

    if check:

        return check

    return render_template(
        "evaluator.html"
    )


# =========================================================
# TEST GEMINI
# =========================================================

@app.route("/test-gemini")
def test_gemini():

    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=(
                "Say hello to my AI Student Mentor "
                "project in one short sentence."
            )
        )

        return response.text

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# AI PROJECT MENTOR API
# =========================================================

@app.route(
    "/api/mentor",
    methods=["POST"]
)
def mentor_api():

    check = login_required()

    if check:

        return check


    data = request.get_json()

    if not data:

        return jsonify({
            "error": "No data received."
        }), 400


    user_message = data.get(
        "message",
        ""
    ).strip()


    if not user_message:

        return jsonify({
            "error": "Message is required."
        }), 400


    profile = get_student_profile()


    if profile:

        student_context = f"""
Student Profile:

- Name: {profile['name']}
- Course: {profile['course']}
- Semester: {profile['semester']}
- Skills: {profile['skills']}
- Career Goal: {profile['career_goal']}
"""

    else:

        student_context = """
Student Profile:

No profile information is available yet.
"""


    prompt = f"""
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

{student_context}

Student's question:

{user_message}
"""


    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )


        if not response or not response.text:

            return jsonify({
                "error": "Gemini returned an empty response. Please try again."
            }), 503


        return jsonify({
            "response": response.text
        })


    except Exception as e:

        error_message = str(e)

        print(
            "MENTOR GEMINI ERROR:",
            repr(e)
        )


        if (
            "503" in error_message
            or
            "UNAVAILABLE" in error_message
        ):

            return jsonify({
                "error": (
                    "The AI Mentor is temporarily unavailable "
                    "because Gemini is experiencing high demand. "
                    "Please try again in a moment."
                )
            }), 503


        return jsonify({
            "error": (
                "The AI Mentor could not process your request "
                "right now."
            )
        }), 500


# =========================================================
# DOCUMENTATION ASSISTANT API
# =========================================================

@app.route(
    "/api/documentation",
    methods=["POST"]
)
def documentation_api():

    check = login_required()

    if check:

        return check


    data = request.get_json()

    if not data:

        return jsonify({
            "error": "No documentation data received."
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
            "error": "Project description is required"
        }), 400


    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=f"""
You are the Documentation Assistant for this specific BCA project:

Project Title:

AI Student Mentor: An Intelligent Learning and Project Guidance System


Actual Technology Stack:

- Frontend: HTML, CSS, JavaScript
- Backend: Python with Flask
- Database: MySQL
- AI Integration: Gemini API
- Development Environment: Visual Studio Code


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


Generate academic documentation based on the user's selected document type and project description.


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
- Never replace Flask with FastAPI, Node.js, or another backend.
- Never replace MySQL with PostgreSQL, MongoDB, or another database.
- Never replace HTML/CSS/JavaScript with React.js or another frontend framework.
- Never mention OpenAI, LangChain, RAG, or other AI technologies unless explicitly provided by the user.
- Never use Agile methodology.
- The project follows Waterfall SDLC.
- Do not invent technologies, modules, features, or architecture.
- Keep documentation suitable for a BCA academic project.
- Use clear professional academic language.
- Organize output with clear headings and sections.
- Return plain text or Markdown only.
- Do NOT use HTML tags.
- Use # or ## for headings.
- Use - for bullet points.
- Do not wrap the response in a code block.
- Return only the requested documentation content.
"""
        )


        return jsonify({
            "success": True,
            "response": response.text
        })


    except Exception as e:

        print(
            "DOCUMENTATION GEMINI ERROR:",
            repr(e)
        )

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# PROJECT VIVA ASSISTANT API
# =========================================================

@app.route(
    "/api/viva",
    methods=["POST"]
)
def viva_api():

    check = login_required()

    if check:

        return check


    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "error": "No viva data received."
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
            "error": "Project information is required."
        }), 400


    prompt = f"""
You are an AI Viva Assistant for a BCA student's project.

The student is preparing for their project viva.


PROJECT INFORMATION:

{project_info}


VIVA REQUIREMENTS:

- Category: {category}
- Difficulty: {difficulty}
- Number of questions: {count}


Generate exactly {count} viva questions.

The questions should be relevant to the student's actual project.


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


IMPORTANT ACCURACY RULES:

- Use ONLY facts explicitly provided in the PROJECT INFORMATION.
- Do NOT invent database tables, fields, APIs, modules, features, libraries, frameworks, algorithms, or implementation details.
- Do NOT assume that a feature exists just because it is common in similar projects.
- If a technical detail is not provided, do not mention it as an existing feature.
- Questions and answers must describe the student's actual project.
- Never claim that the project uses technologies other than HTML, CSS, JavaScript, Python Flask, MySQL, and Gemini API unless the PROJECT INFORMATION explicitly says so.


Difficulty rules:

- Basic: simple conceptual and project-understanding questions
- Intermediate: implementation and technical understanding
- Advanced: deeper technical reasoning and problem-solving


For every question provide:

1. The question
2. A clear model answer suitable for a BCA student


Return ONLY valid JSON.

Use exactly this format:

[
    {{
        "question": "Question text",
        "answer": "Model answer"
    }}
]
"""


    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )


        response_text = response.text.strip()


        # Remove Markdown code fences if Gemini adds them

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


        questions = json.loads(
            response_text
        )


        return jsonify({
            "success": True,
            "questions": questions
        })


    except Exception as e:

        print(
            "VIVA API ERROR:",
            e
        )

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )