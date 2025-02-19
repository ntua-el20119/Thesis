from flask import Blueprint, request, jsonify, render_template
from .eligibility import check_eligibility

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/check_eligibility', methods=['POST'])
def eligibility_api():
    data = request.get_json()
    is_eligible = check_eligibility(data)
    return jsonify({'eligible': is_eligible})
