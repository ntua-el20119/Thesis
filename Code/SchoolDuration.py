from datetime import datetime, timedelta
import pandas as pd
# Σταθερές για τη διάρκεια των σπουδών
EXTRA_SEMESTERS_STANDARD = 4  # Πρόσθετα εξάμηνα για 4ετή προγράμματα
EXTRA_SEMESTERS_LONG = 6       # Πρόσθετα εξάμηνα για μεγαλύτερα προγράμματα
MAX_BREAK_YEARS = 2            # Μέγιστη περίοδος διακοπής σπουδών

def calculate_completion_date(start_date, min_semesters, part_time=False, break_years=0, health_extension=False):
    """
    Υπολογίζει την καταληκτική ημερομηνία περάτωσης σπουδών.
    
    :param start_date: Ημερομηνία πρώτης εγγραφής (string YYYY-MM-DD)
    :param min_semesters: Ελάχιστη διάρκεια προγράμματος σε εξάμηνα
    :param part_time: Αν ο φοιτητής είναι σε μερική φοίτηση (boolean)
    :param break_years: Έτη διακοπής σπουδών (int)
    :param health_extension: Αν υπάρχει παράταση λόγω υγείας (boolean)
    :return: Ημερομηνία λήξης φοίτησης (string YYYY-MM-DD)
    """
    start_date = datetime.strptime(start_date, "%Y-%m-%d")

    # Υπολογισμός ανώτατης διάρκειας
    if min_semesters == 8:
        max_semesters = min_semesters + EXTRA_SEMESTERS_STANDARD
    else:
        max_semesters = min_semesters + EXTRA_SEMESTERS_LONG

    # Αν είναι μερική φοίτηση, τα εξάμηνα διπλασιάζονται
    if part_time:
        max_semesters *= 2

    # Μετατροπή εξαμήνων σε έτη (1 έτος = 2 εξάμηνα)
    max_years = max_semesters / 2

    # Αν ο φοιτητής έχει διακοπή, προσθέτουμε την περίοδο διακοπής (μέχρι 2 έτη)
    if break_years > MAX_BREAK_YEARS:
        break_years = MAX_BREAK_YEARS
    max_years += break_years

    # Αν υπάρχει παράταση λόγω υγείας, προσθέτουμε έξτρα 1 έτος (ενδεικτικά)
    if health_extension:
        max_years += 1

    # Υπολογισμός ημερομηνίας ολοκλήρωσης
    completion_date = start_date.replace(year=start_date.year + int(max_years))

    return completion_date.strftime("%Y-%m-%d")

# Δημιουργία δεδομένων δοκιμών
students_data = [
    {"name": "Φοιτητής 1", "start_date": "2020-09-01", "min_semesters": 8, "part_time": False, "break_years": 0, "health_extension": False},
    {"name": "Φοιτητής 2", "start_date": "2019-09-01", "min_semesters": 8, "part_time": True, "break_years": 1, "health_extension": False},
    {"name": "Φοιτητής 3", "start_date": "2021-09-01", "min_semesters": 10, "part_time": False, "break_years": 2, "health_extension": True},
    {"name": "Φοιτητής 4", "start_date": "2018-09-01", "min_semesters": 12, "part_time": True, "break_years": 0, "health_extension": False},
]

# Υπολογισμός καταληκτικής ημερομηνίας για κάθε φοιτητή
results = []
for student in students_data:
    completion_date = calculate_completion_date(
        student["start_date"], student["min_semesters"],
        student["part_time"], student["break_years"], student["health_extension"]
    )
    results.append({
        "Όνομα": student["name"],
        "Ημερομηνία Έναρξης": student["start_date"],
        "Ελάχιστη Διάρκεια (Εξάμηνα)": student["min_semesters"],
        "Μερική Φοίτηση": student["part_time"],
        "Διακοπή (Έτη)": student["break_years"],
        "Παράταση λόγω Υγείας": student["health_extension"],
        "Καταληκτική Ημερομηνία": completion_date
    })

# Μετατροπή σε DataFrame και εμφάνιση
df_results = pd.DataFrame(results)
print(df_results)
