from typing import Dict, Any

from typing import Dict, Any

def is_eligible_for_free_meal(student_info: Dict[str, Any]) -> bool:
    """
    Determines if a student is eligible for free meals based on the provided data.

    :param student_info: Dictionary containing student details.
    :return: Boolean indicating eligibility.
    """
    income = student_info.get('income', 0)
    total_children = student_info.get('total_children', 1)  
    siblings_in_university = student_info.get('siblings_in_university', 0)
    unemployment_benefit = student_info.get('unemployment_benefit', False)
    permanent_residence_same_city = student_info.get('permanent_residence_same_city', False)
    special_category = student_info.get('special_category', None)
    age = student_info.get('age', 0)
    marital_status = student_info.get('marital_status', 'single')

    # Income thresholds
    base_income_limit = 45000
    additional_child_increase = 5000
    sibling_bonus = 3000

    # Adjust income limit based on total number of children
    income_limit = base_income_limit + additional_child_increase * (total_children - 1)
    income_limit += sibling_bonus * siblings_in_university

    # Reduce limit if student lives in the same city as the institution
    if permanent_residence_same_city:
        income_limit *= 0.9

    # Automatic eligibility conditions
    if unemployment_benefit:
        return True

    if special_category in [
        'polytelos', 'trimelos', 'orphans', 'disabled_family', 'serious_disease', 'terrorism_victim_child'
    ]:
        return True

    # Income and age-based eligibility
    if marital_status == 'single' and age <= 25 and income <= income_limit:
        return True
    elif marital_status == 'married' and income <= income_limit:
        return True
    elif marital_status == 'single' and age > 25 and income <= 25000:
        return True

    return False

# Example usage
student = {
    'income': 46000,
    'total_children': 1,
    'siblings_in_university': 0,
    'unemployment_benefit': False,
    'permanent_residence_same_city': False,
    'special_category': None,
    'age': 23,
    'marital_status': 'single'
}

if is_eligible_for_free_meal(student):
    print("The student is eligible for free meals.")
else:
    print("The student is NOT eligible for free meals.")
