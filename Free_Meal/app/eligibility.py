def check_eligibility(data):
    # Extract data from input
    age = data.get('age')
    marital_status = data.get('marital_status')  # "single" or "married"
    annual_income = data.get('annual_income')
    family_income = data.get('family_income')
    number_of_children = data.get('number_of_children', 0)
    siblings_in_university = data.get('siblings_in_university', 0)
    unemployment_benefit = data.get('unemployment_benefit', False)
    permanent_residence = data.get('permanent_residence')  # "same_city" or "different_city"
    family_member_disability = data.get('family_member_disability', False)
    orphan_status = data.get('orphan_status', False)
    large_family_status = data.get('large_family_status', False)
    terrorism_victim_child = data.get('terrorism_victim_child', False)

    # 1. Automatic eligibility for unemployment benefit holders (Article 1, Paragraph 5)
    if unemployment_benefit:
        return True, "Δικαιούστε δωρεάν σίτιση λόγω επιδόματος ανεργίας."

    # 2. Automatic eligibility for specific categories (Article 1, Paragraph 9)
    
    if large_family_status:
        return True, "Δικαιούστε δωρεάν σίτιση λόγω πολύτεκνης οικογένειας."
    
    if orphan_status:
        return True, "Δικαιούστε δωρεάν σίτιση λόγω ορφάνιας."
    
    if family_member_disability:
        return True, "Δικαιούστε δωρεάν σίτιση λόγω αναπηρίας μέλους της οικογένειας."
    
    if terrorism_victim_child:
        if age < 25:
            return True, "Δικαιούστε δωρεάν σίτιση λόγω ιδιότητας τέκνου θύματος τρομοκρατίας και ηλικίας μικρότερης των 25 ετών"


    # 3. Income-based eligibility for single students (Article 1, Paragraph 2α and 2γ)
    if marital_status == "single":
        if age > 25:
            # Single students over 25 years old (Article 1, Paragraph 2γ)
            if annual_income <= 25000:
                return True, "Δικαιούστε δωρεάν σίτιση λόγω χαμηλού ατομικού εισοδήματος."
            else:
                return False, "Δεν δικαιούστε δωρεάν σίτιση λόγω υψηλού ατομικού εισοδήματος."
        else:
            # Single students under 25 years old (Article 1, Paragraph 2α)
            income_limit = 45000 + (5000 * max(0, number_of_children - 1)) + (3000 * siblings_in_university)
            if permanent_residence == "same_city":
                income_limit *= 0.9  # 10% reduction for same-city residence (Article 1, Paragraph 4)
            if family_income <= income_limit:
                return True, "Δικαιούστε δωρεάν σίτιση λόγω χαμηλού οικογενειακού εισοδήματος."
            else:
                return False, "Δεν δικαιούστε δωρεάν σίτιση λόγω υψηλού οικογενειακού εισοδήματος."

    # 4. Income-based eligibility for married students (Article 1, Paragraph 2β)
    if marital_status == "married":
        income_limit = 45000 + (5000 * number_of_children)
        if permanent_residence == "same_city":
            income_limit *= 0.9  # 10% reduction for same-city residence (Article 1, Paragraph 4)
        if family_income <= income_limit:
            return True, "Δικαιούστε δωρεάν σίτιση λόγω χαμηλού οικογενειακού εισοδήματος."
        else:
            return False, "Δεν δικαιούστε δωρεάν σίτιση λόγω υψηλού οικογενειακού εισοδήματος."

    # 5. Default case: Not eligible
    return False, "Δεν πληροίτε τις προϋποθέσεις για δωρεάν σίτιση."


