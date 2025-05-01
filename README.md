# Thesis
Διπλωματικη εργασία "RULES AS CODE στην ελληνικη νομοθεσία"

# Project Overview
This project is organized into the following directories:

## Directories

### `/ImplementationFreeMeal`
Τα διαφορετικά εργαλεία που χρησιμοποιήθηκαν για την υλοποίηση του άρθρου για την δωρεάν σίτιση πριν την καθιέρωση της μεθοδολογίας. 

Αναλυτικά: 
1) '/app': ερωτηματολόγιο για εξαγωγή απόφασης δικαιώματος δωρεάν σίτισης με εισόδους από τον χρήστη
2) '/catala': λογική του νόμου δωρεάν σίτισης γραμμένο στη γλώσσα catala
3) DAFreeMeal.yaml: File που κατασκευάζει συνέντευξη του εργαλείου DocAssemble 
4) freemeal.py: Συνάρτηση με την λογική του νόμου γραμμένη σε python
5) freemealAPI.py: 
6) run.py: το αρχείο για να τρέξει το ερωτηματολόγιο που βρίσκεται στο subdirectory /app
7) TreeForFreeMeal.py: Σχεσιακό δέντρο που απεικονίζει την λογική του νόμου (μη λειτουργικό)

### `/ImpementationSchoolDuration`
Τα διαφορετικά εργαλεία που χρησιμοποιήθηκαν για την υλοποίηση του άρθρου για την μέγιστη διάρκεια φοίτησης πριν την καθιέρωση της μεθοδολογίας 

Αναλυτικά
1) BlawxSchoolDuration.txt: Ο κώδικας δημιουργίας του νόμου χρησιμοποιώντας το εργαλείο blawx
2) DASchoolDuration.yaml: Κώδικας εξαγωγής συνέντευξης μέσω του εργαλείου DocAssemble
3) SchoolDuration.py: Συνάρτηση με την λογική του νόμου για εξαγωγή τελικής ημερομηνίας φοίτησης 

### `/MethodologyFreeMeal`
Το αρχείο integrated_llm_methodology_refined.md το οποίο αναλύει την μεθοδολογία
Παράδειγμα τρεξίματος όλων των στάδιων της μεθοδολογίας για την περίπτωση της δωρεάν φοίτησης χρησιμοποιώντας το Claude 3.7 Sonnet

### `/OpenFisca`
Παράδειγμα χρήσης του εργαλείου OpenFisca

### `/gorules`
1) curl.txt: αρχείο για την δοκιμή του online api 
2) student_meal_eligibility.json: αρχείο json που επιστρέφει τα δεδομένα που είχαν εισαχθεί ως input στο αρχείο test_student_meal_eligibility.ts
3) test_student_meal_eligibility.ts: αρχείο για τρέξιμο τοπικά

### `/myenv`
Virtual environment που περιέχει όλα τα dependencies για να τρέξουν οι εφαρμογές του directory (πρίν από την web εφαρμογή βασισμένη στη μεθοδολογία)

### `/node_modules`
Automatically generated directory containing all dependencies installed via npm. **Do not modify this directory manually.**

### `/Εκφώνηση`
1) '/ΣΧΕΤΙΚΟ ΥΛΙΚΟ': αποθετήριο με μελέτες και άρθρα για το Rules as Code
2) 'fek_a_25_2021.pdf': Νόμος για την διαγραφή φοιτητών 
        Άρθρο 34: Ρυθμίσεις θεμάτων διάρκειας φοίτησης
3) 'fek_a_141_2022.pdf': Nόμος για την διαγραφή φοιτητών 
        Άρθρο 75: Χρονική Διάρκεια σπουδών
        Άρθρο 76: Άνωτατη Διάρκεια φοίτησης και μερική φοίτηση
4) ΔΕ RULES AS CODE.pdf: Εκφώνηση της διπλωματικής
5) ΕΜΠ-ΠΛΗΡΟΦΟΡΙΕΣ ΓΙΑ ΔΙΠΛΩΜΑΤΙΚΗ ΕΡΓΑΣΙΑ.docx: 




---