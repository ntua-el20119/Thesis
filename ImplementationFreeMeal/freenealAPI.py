from flask import Flask, request, jsonify

app = Flask(__name__)

# Sample eligibility function based on provided criteria
def check_eligibility(data):
    # Extract data from request
    marital_status = data.get('marital_status')  # 'single' or 'married'
    age = data.get('age')
    annual_income = data.get('annual_income')
    family_income = data.get('family_income')
    number_of_children = data.get('number_of_children', 0)
    siblings_in_university = data.get('siblings_in_university', 0)
    unemployment_benefit = data.get('unemployment_benefit', False)
    permanent_residence = data.get('permanent_residence')  # 'same_city' or 'different_city'

    # Eligibility conditions
    if unemployment_benefit:
        return True

    if marital_status == 'single':
        if age > 25:
            return annual_income <= 25000
        else:
            income_limit = 45000 + (5000 * max(0, number_of_children - 1)) + (3000 * siblings_in_university)
            if permanent_residence == 'same_city':
                income_limit *= 0.9
            return family_income <= income_limit

    elif marital_status == 'married':
        income_limit = 45000 + (5000 * number_of_children)
        if permanent_residence == 'same_city':
            income_limit *= 0.9
        return family_income <= income_limit

    return False

@app.route('/check_eligibility', methods=['POST'])
def eligibility_api():
    data = request.get_json()
    is_eligible = check_eligibility(data)
    return jsonify({'eligible': is_eligible})

if __name__ == '__main__':
    app.run(debug=True)
