from flask import Flask, render_template

app = Flask(__name__)

# 1. Main Dashboard
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

# 2. Profile
@app.route('/profile')
def profile():
    return render_template('profile.html')

# 3. Learning Roadmap
@app.route('/roadmap')
def roadmap():
    return render_template('roadmap.html')

# 4. AI Project Mentor
@app.route('/mentor')
def mentor():
    return render_template('mentor.html')

# 5. Documentation Assistant
@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

# 6. Project Viva Assistant
@app.route('/viva')
def viva():
    return render_template('viva.html')

# 7. AI Study Assistant
@app.route('/study_assist')
def study_assist():
    return render_template('study_assist.html')

# 8. Project Progress Tracker
@app.route('/progress')
def progress():
    return render_template('progress.html')

# 9. AI Project Idea Evaluator
@app.route('/evaluator')
def evaluator():
    return render_template('evaluator.html')


if __name__ == '__main__':
    # Run the Flask application in debug mode
    app.run(debug=True, port=5000)