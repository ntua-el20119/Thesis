# Thesis: "RULES AS CODE στην ελληνική νομοθεσία"

## Project Overview

This project is organized into the following directories:

## Directory Structure

### ImplementationFreeMeal

Τα διαφορετικά εργαλεία που χρησιμοποιήθηκαν για την υλοποίηση του άρθρου για την δωρεάν σίτιση πριν την καθιέρωση της μεθοδολογίας.

**Contents:**

- `/app`: ερωτηματολόγιο για εξαγωγή απόφασης δικαιώματος δωρεάν σίτισης με εισόδους από τον χρήστη
- `/catala`: λογική του νόμου δωρεάν σίτισης γραμμένο στη γλώσσα catala
- `DAFreeMeal.yaml`: File που κατασκευάζει συνέντευξη του εργαλείου DocAssemble
- `freemeal.py`: Συνάρτηση με την λογική του νόμου γραμμένη σε python
- `freemealAPI.py`: [description]
- `run.py`: το αρχείο για να τρέξει το ερωτηματολόγιο που βρίσκεται στο subdirectory /app
- `TreeForFreeMeal.py`: Σχεσιακό δέντρο που απεικονίζει την λογική του νόμου (μη λειτουργικό)

---

### ImpementationSchoolDuration

Τα διαφορετικά εργαλεία που χρησιμοποιήθηκαν για την υλοποίηση του άρθρου για την μέγιστη διάρκεια φοίτησης πριν την καθιέρωση της μεθοδολογίας.

**Contents:**

- `BlawxSchoolDuration.txt`: Ο κώδικας δημιουργίας του νόμου χρησιμοποιώντας το εργαλείο blawx
- `DASchoolDuration.yaml`: Κώδικας εξαγωγής συνέντευξης μέσω του εργαλείου DocAssemble
- `SchoolDuration.py`: Συνάρτηση με την λογική του νόμου για εξαγωγή τελικής ημερομηνίας φοίτησης

---

### MethodologyFreeMeal

- `integrated_llm_methodology_refined.md`: Αναλύει την μεθοδολογία
- Παράδειγμα τρεξίματος όλων των στάδιων της μεθοδολογίας για την περίπτωση της δωρεάν φοίτησης χρησιμοποιώντας το Claude 3.7 Sonnet

---

### OpenFisca

Παράδειγμα χρήσης του εργαλείου OpenFisca

---

### RulesAsCodeApp

Περιέχει την εφαρμογή που υλοποιεί την μεθοδολογία σε Next.js

- `.next/:` Contains Next.js build artifacts (auto-generated, ignore for now). -`node_modules/:` Dependency files (auto-managed by npm). -`public/:` Static assets (e.g., images, can be used later). -`src/:` Source code directory (recommended structure). -`app/:` App Router pages and layouts (e.g., page.tsx for the homepage). -`components/:` Reusable UI components (empty, to be populated). -`lib/:` Utility functions or configurations (empty, to be populated). -`pages/:` Legacy pages (likely empty since App Router is used). -`.gitignore:` Git ignore file. -`.eslintrc.js:` ESLint configuration. -`next-env.d.ts:` TypeScript environment definitions for Next.js. -`next.config.mjs:` Next.js configuration (JavaScript module format). -`package.json:` Project metadata and dependencies. -`postcss.config.mjs:` PostCSS configuration (likely for Tailwind CSS if enabled). -`README.md:` Project documentation. -`tsconfig.json:` TypeScript configuration.

---

### gorules

**Contents:**

- `curl.txt`: αρχείο για την δοκιμή του online api
- `student_meal_eligibility.json`: αρχείο json που επιστρέφει τα δεδομένα που είχαν εισαχθεί ως input στο αρχείο test_student_meal_eligibility.ts
- `test_student_meal_eligibility.ts`: αρχείο για τρέξιμο τοπικά

---

### myenv

Virtual environment που περιέχει όλα τα dependencies για να τρέξουν οι εφαρμογές του directory (πρίν από την web εφαρμογή βασισμένη στη μεθοδολογία)

---

### node_modules

_Automatically generated directory containing all dependencies installed via npm._  
**Do not modify this directory manually.**

---

### Εκφώνηση

**Contents:**

- `/ΣΧΕΤΙΚΟ ΥΛΙΚΟ`: αποθετήριο με μελέτες και άρθρα για το Rules as Code
- `fek_a_25_2021.pdf`:
  - Άρθρο 34: Ρυθμίσεις θεμάτων διάρκειας φοίτησης
- `fek_a_141_2022.pdf`:
  - Άρθρο 75: Χρονική Διάρκεια σπουδών
  - Άρθρο 76: Άνωτατη Διάρκεια φοίτησης και μερική φοίτηση
- `ΔΕ RULES AS CODE.pdf`: Εκφώνηση της διπλωματικής
- `ΕΜΠ-ΠΛΗΡΟΦΟΡΙΕΣ ΓΙΑ ΔΙΠΛΩΜΑΤΙΚΗ ΕΡΓΑΣΙΑ.docx`: [description]

---
