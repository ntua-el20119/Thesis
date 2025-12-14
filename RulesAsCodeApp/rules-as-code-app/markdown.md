# Αρχιτεκτονική του Εργαλείου "Rules as Code App"

## Εισαγωγή

Το εργαλείο "Rules as Code App" αποτελεί μια διαδικτυακή εφαρμογή που υλοποιεί μια μεθοδολογία μετατροπής νομικών κειμένων σε κώδικα (Rules as Code). Η εφαρμογή επιτρέπει στους χρήστες να εισάγουν νομικά κείμενα, να τα επεξεργάζονται μέσω διαδοχικών βημάτων και να παράγουν δομημένο κώδικα που μπορεί να εκτελεστεί αυτόματα. Η αρχιτεκτονική της εφαρμογής βασίζεται σε σύγχρονες τεχνολογίες web development, με έμφαση στην αλληλεπίδραση με μοντέλα γλώσσας μεγάλης κλίμακας (LLM) για την επεξεργασία κειμένου.

## Γενική Αρχιτεκτονική

Η εφαρμογή ακολουθεί μια αρχιτεκτονική τριών επιπέδων (three-tier architecture):

1. **Παρουσίαση (Presentation Layer)**: Το frontend που αλληλεπιδρά με τον χρήστη.
2. **Επιχειρησιακή Λογική (Business Logic Layer)**: Η επεξεργασία των δεδομένων και η αλληλεπίδραση με εξωτερικά APIs.
3. **Δεδομένα (Data Layer)**: Η αποθήκευση και ανάκτηση δεδομένων.

Η εφαρμογή χρησιμοποιεί το Next.js ως full-stack framework, επιτρέποντας την υλοποίηση τόσο του frontend όσο και του backend σε ένα ενιαίο project. Η κατάσταση της εφαρμογής διαχειρίζεται με το Zustand, ενώ η βάση δεδομένων χειρίζεται μέσω του Prisma ORM.

## Λειτουργία των Επιπέδων (Operation of Layers)

### Επίπεδο Παρουσίασης (Presentation Layer)

Το επίπεδο παρουσίασης είναι υπεύθυνο για την αλληλεπίδραση με τον χρήστη και την απεικόνιση των δεδομένων. Χρησιμοποιεί το React για τη δημιουργία δυναμικών UI components και το Next.js για την απόδοση των σελίδων.

#### Λειτουργία του Frontend

- **Αρχικοποίηση**: Όταν ο χρήστης επισκέπτεται την εφαρμογή, το Next.js φορτώνει την κύρια σελίδα (`page.tsx`), η οποία εμφανίζει τον "Text Wizard" και πιθανώς μια αναδιπλούμενη λίστα με τα βήματα της μεθοδολογίας.
- **Αλληλεπίδραση Χρήστη**: Ο χρήστης εισάγει κείμενο σε ένα TextArea component. Η κατάσταση ενημερώνεται μέσω του Zustand store, χρησιμοποιώντας actions όπως `setCurrentStep`.
- **Προβολή Βημάτων**: Το StepEditor component εμφανίζει το περιεχόμενο του τρέχοντος βήματος. Για παράδειγμα, μετά την κλήση του LLM για "Segment Text", το component αναλύει το JSON response και εμφανίζει τις ενότητες σε μορφή λίστας ή κειμένου.
- **Ενημέρωση UI**: Όταν αλλάζει η κατάσταση (π.χ. μετά από έγκριση βήματος), τα components επανα-αποδίδονται αυτόματα λόγω του reactive nature του React και του Zustand.

#### Παράδειγμα Ροής

1. Χρήστης εισάγει κείμενο και πατάει "Start".
2. Το store ενημερώνεται με το νέο βήμα.
3. Το UI εμφανίζει το StepEditor με το περιεχόμενο από το store ή την API.

### Επίπεδο Επιχειρησιακής Λογικής (Business Logic Layer)

Το επίπεδο αυτό περιλαμβάνει την επεξεργασία των δεδομένων, την επικοινωνία με εξωτερικά APIs και την υλοποίηση της λογικής της μεθοδολογίας.

#### Λειτουργία των API Routes

- **Δομή**: Κάθε API route είναι μια serverless function στο `src/app/api/`. Για παράδειγμα, το `segment-text/route.ts` χειρίζεται POST requests για την τμηματοποίηση κειμένου.
- **Επεξεργασία Αιτήσεων**: Όταν λαμβάνεται μια αίτηση, η route εξάγει τα δεδομένα (π.χ. κείμενο και projectId), καλεί το LLM API και επεξεργάζεται την απάντηση.
- **Κλήση LLM**: Χρησιμοποιεί βιβλιοθήκες όπως το OpenAI SDK για να στείλει prompts στο μοντέλο. Το prompt περιλαμβάνει οδηγίες για την ανάλυση του κειμένου (π.χ. "Segment the text into sections with ID, title, content").
- **Parsing και Επικύρωση**: Η απάντηση του LLM μπορεί να είναι κείμενο με JSON. Η route χρησιμοποιεί `JSON.parse` για να εξάγει τα δεδομένα, και σε περίπτωση σφάλματος, επιστρέφει error response.
- **Αποθήκευση**: Τα αποτελέσματα αποθηκεύονται στη βάση δεδομένων μέσω Prisma, χρησιμοποιώντας `upsert` για να δημιουργήσει ή ενημερώσει εγγραφές.

#### Παράδειγμα Ροής για "Segment Text"

1. Frontend στέλνει POST στο `/api/llm/segment-text` με το κείμενο.
2. Η route δημιουργεί prompt: "Segment the following legal text into sections..."
3. Καλεί LLM API και λαμβάνει response με JSON ενότητες.
4. Parses το JSON και αποθηκεύει στο Prisma με `MethodologyStep.upsert`.
5. Επιστρέφει success response στο frontend.

#### Αλληλεπίδραση με Εξωτερικά APIs

- **LLM Integration**: Η εφαρμογή εξαρτάται από εξωτερικά μοντέλα για την επεξεργασία κειμένου. Χρησιμοποιεί environment variables για API keys.
- **Error Handling**: Αν το LLM αποτύχει, η route επιστρέφει error, και το frontend εμφανίζει μήνυμα.

### Επίπεδο Δεδομένων (Data Layer)

Το επίπεδο δεδομένων διαχειρίζεται την αποθήκευση και ανάκτηση πληροφοριών, χρησιμοποιώντας το Prisma ως ORM.

#### Λειτουργία της Βάσης Δεδομένων

- **Schema**: Το `schema.prisma` ορίζει το μοντέλο `MethodologyStep` με πεδία όπως `id`, `projectId`, `phase`, `stepName`, `content` (JSON), `approved`, `createdAt`, `updatedAt`.
- **Migrations**: Το Prisma δημιουργεί migrations για αλλαγές στο schema, εξασφαλίζοντας συνέπεια δεδομένων.
- **CRUD Operations**: Οι API routes χρησιμοποιούν τον Prisma client για queries. Για παράδειγμα, `prisma.methodologyStep.findMany` για ανάκτηση βημάτων ενός project.
- **Type Safety**: Το Prisma δημιουργεί TypeScript types αυτόματα, αποτρέποντας σφάλματα τύπων.

#### Παράδειγμα Ροής Αποθήκευσης

1. Μετά την επεξεργασία LLM, η route καλεί `prisma.methodologyStep.upsert`.
2. Το Prisma ελέγχει αν υπάρχει εγγραφή με το ίδιο `projectId`, `phase`, `stepName`.
3. Αν ναι, ενημερώνει το `content` και `updatedAt`; αλλιώς δημιουργεί νέα εγγραφή.
4. Τα δεδομένα αποθηκεύονται στην SQLite/PostgreSQL βάση.

#### Ανακτηση Δεδομένων

- Όταν το frontend χρειάζεται δεδομένα, καλεί API routes που query τη βάση και επιστρέφουν JSON.
- Η κατάσταση στο store συγχρονίζεται με τα δεδομένα από τη βάση.

## Frontend (Next.js και React Components)

### Next.js Framework

Το Next.js είναι το κύριο framework που χρησιμοποιείται για την ανάπτυξη της εφαρμογής. Παρέχει:

- **Server-Side Rendering (SSR)**: Για βελτιωμένη απόδοση και SEO.
- **API Routes**: Για την υλοποίηση του backend σε serverless functions.
- **File-based Routing**: Αυτόματη δημιουργία routes βάσει της δομής των φακέλων.

### React Components

Τα components βρίσκονται στον φάκελο `src/components/` και περιλαμβάνουν:

- **StepEditor.tsx**: Επεξεργαστής βημάτων, που επιτρέπει την προβολή και επεξεργασία του περιεχομένου κάθε βήματος.
- **TextArea.tsx**: Στοιχείο εισαγωγής κειμένου.
- **stages/**: Components ειδικά για κάθε στάδιο της μεθοδολογίας.

Τα components χρησιμοποιούν Tailwind CSS για styling, με global styles στο `src/app/globals.css`.

### Κύρια Σελίδα (page.tsx)

Η κύρια σελίδα (`src/app/page.tsx`) είναι το σημείο εισόδου της εφαρμογής, όπου ο χρήστης ξεκινά τον "Text Wizard". Εδώ μπορεί να προστεθεί η λίστα με τα διαθέσιμα βήματα της μεθοδολογίας.

## Διαχείριση Κατάστασης (State Management)

### Zustand Store

Το Zustand χρησιμοποιείται για την κεντρική διαχείριση της κατάστασης της εφαρμογής (`src/lib/store.ts`). Κύρια χαρακτηριστικά:

- **Wizard State**: Διαχείριση του τρέχοντος φάσης (phase) και βήματος (step).
- **Persistence**: Αποθήκευση της κατάστασης στο localStorage χρησιμοποιώντας το `persist` middleware.
- **Actions**: Συναρτήσεις όπως `setCurrentStep`, `setStepContent`, `approveStep` για την ενημέρωση της κατάστασης.

Η κατάσταση περιλαμβάνει:

- `currentPhase`: Η τρέχουσα φάση (π.χ. "Preparation").
- `currentStep`: Το τρέχον βήμα (π.χ. "Segment Text").
- `steps`: Αντικείμενο που αποθηκεύει το περιεχόμενο κάθε βήματος.

## Backend (API Routes και LLM Integration)

### Next.js API Routes

Οι API routes βρίσκονται στο `src/app/api/` και υλοποιούν serverless functions. Κύρια routes:

- **segment-text/route.ts**: Επεξεργασία κειμένου για τμηματοποίηση σε ενότητες.
- **normalize-terminology/route.ts**: Κανονικοποίηση ορολογίας στο κείμενο.

Κάθε route:

- Λαμβάνει δεδομένα από το frontend (π.χ. κείμενο προς επεξεργασία).
- Καλεί εξωτερικό LLM API (π.χ. OpenAI ή άλλο).
- Επεξεργάζεται την απάντηση και την αποθηκεύει στη βάση δεδομένων.

#### Λειτουργία των API Routes

Οι routes είναι ασύγχρονες functions που εκτελούνται στο server. Για παράδειγμα, στο `segment-text/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const { text, projectId } = await request.json();
  // Κλήση LLM
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: `Segment the text: ${text}` }],
    }),
  });
  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content); // Parsing LLM response
  // Αποθήκευση στο Prisma
  await prisma.methodologyStep.upsert({
    where: {
      projectId_phase_stepName: {
        projectId,
        phase: "Preparation",
        stepName: "Segment Text",
      },
    },
    update: { content: parsed, updatedAt: new Date() },
    create: {
      projectId,
      phase: "Preparation",
      stepName: "Segment Text",
      content: parsed,
      approved: false,
    },
  });
  return NextResponse.json({ success: true });
}
```

- **Επεξεργασία Εισόδου**: Εξαγωγή δεδομένων από το request body.
- **Prompt Engineering**: Δημιουργία κατάλληλου prompt για το LLM, π.χ. "Segment the following legal text into JSON sections with id, title, content, referenceId".
- **Κλήση API**: Ασύγχρονη κλήση στο LLM, με timeout και error handling.
- **Parsing Response**: Η απάντηση του LLM είναι συνήθως κείμενο που περιέχει JSON. Χρησιμοποιείται `JSON.parse` ή regex για εξαγωγή.
- **Αποθήκευση**: Χρήση Prisma για upsert στη βάση, εξασφαλίζοντας ότι δεν δημιουργούνται διπλότυπα.
- **Response**: Επιστροφή JSON με status (success/error).

#### Αλληλεπίδραση με LLM

- **Προκλήσεις**: Τα LLM μπορεί να επιστρέφουν επιπλέον κείμενο (π.χ. εξηγήσεις), οπότε απαιτείται καθαρισμός της απάντησης.
- **Παραδείγματα Prompts**: Για "Normalize Terminology": "Identify and normalize terms in the text, return JSON with sections and normalizations array".
- **Rate Limiting**: Διαχείριση ορίων κλήσεων στο LLM API για αποφυγή υπερφόρτωσης.

### Αλληλεπίδραση με Εξωτερικά APIs

- **Authentication**: Χρήση API keys από environment variables.
- **Error Handling**: Try-catch blocks για handling network errors ή invalid responses.
- **Fallbacks**: Αν το LLM αποτύχει, η route μπορεί να επιστρέψει cached δεδομένα ή error message.

## Βάση Δεδομένων (Prisma ORM)

### Prisma Schema

Το Prisma χρησιμοποιείται για την αλληλεπίδραση με τη βάση δεδομένων (`prisma/schema.prisma`):

- **MethodologyStep Model**: Αποθηκεύει κάθε βήμα της μεθοδολογίας, με πεδία όπως `projectId`, `phase`, `stepName`, `content`, `approved`.

### Πλεονεκτήματα

- **Type Safety**: Αυτόματη δημιουργία τύπων TypeScript.
- **Migrations**: Διαχείριση αλλαγών στο schema.
- **Client**: Εύκολη ανάκτηση και ενημέρωση δεδομένων.

Η βάση δεδομένων είναι πιθανώς SQLite για ανάπτυξη, αλλά μπορεί να αλλάξει σε PostgreSQL για παραγωγή.

#### Λειτουργία της Βάσης Δεδομένων

- **Σύνδεση**: Ο Prisma client (`src/lib/prisma.ts`) συνδέεται στη βάση χρησιμοποιώντας connection string από `.env`.
- **Queries**: Οι API routes χρησιμοποιούν τον client για CRUD operations. Για παράδειγμα:
  ```typescript
  const steps = await prisma.methodologyStep.findMany({
    where: { projectId: projectId },
    orderBy: { createdAt: "asc" },
  });
  ```
- **Upsert Operations**: Για αποφυγή διπλότυπων, χρησιμοποιείται `upsert` με compound unique key (`projectId_phase_stepName`).
- **Transactions**: Για complex operations, το Prisma υποστηρίζει transactions για atomicity.
- **Generated Client**: Μετά από `prisma generate`, δημιουργούνται types όπως `MethodologyStep` για type-safe queries.

#### Παράδειγμα Ροής Αποθήκευσης Δεδομένων

1. Μετά την επεξεργασία LLM, η API route καλεί `prisma.methodologyStep.upsert`.
2. Το Prisma ελέγχει το unique constraint.
3. Αν υπάρχει εγγραφή, ενημερώνει τα πεδία `content`, `updatedAt`.
4. Αν όχι, δημιουργεί νέα εγγραφή με όλα τα πεδία.
5. Η βάση επιστρέφει confirmation, και η route στέλνει response στο frontend.

## Ροή Εργασίας (Workflow)

Η μεθοδολογία περιλαμβάνει τις εξής φάσεις (`src/lib/store.ts`):

1. **Preparation**:

   - Segment Text
   - Normalize Terminology
   - Key Sections
   - Inconsistency Scan
   - Initial Human Guidance

2. **Analysis**:

   - Extract Entities
   - Entity Refinement
   - Data Requirement Identification
   - Rule Extraction
   - Rule Formalisation
   - Decision Requirement Diagram Creation

3. **Implementation**:

   - Generate Code

4. **Testing**:

   - (Κενό προς το παρόν)

5. **Documentation**:
   - (Κενό προς το παρόν)

Κάθε βήμα:

- Επεξεργάζεται μέσω LLM.
- Αποθηκεύεται στη βάση δεδομένων.
- Μπορεί να εγκριθεί από τον χρήστη πριν προχωρήσει στο επόμενο.

#### Λειτουργία της Ροής Εργασίας

- **Αρχικοποίηση**: Ο χρήστης εισάγει κείμενο στην κύρια σελίδα και ξεκινά τον wizard. Το store ορίζει `currentPhase` σε "Preparation" και `currentStep` στο πρώτο βήμα ("Segment Text").
- **Επεξεργασία Βήματος**: Το frontend καλεί την αντίστοιχη API route (π.χ. `/api/llm/segment-text`). Η route επεξεργάζεται το κείμενο μέσω LLM και αποθηκεύει τα αποτελέσματα.
- **Ενημέρωση UI**: Μετά την αποθήκευση, το store ενημερώνεται με το νέο περιεχόμενο, και το StepEditor εμφανίζει τα δεδομένα (π.χ. λίστα ενότητων).
- **Έγκριση**: Ο χρήστης μπορεί να επεξεργάσει το περιεχόμενο και να πατήσει "Approve". Αυτό ενημερώνει το `approved` flag στη βάση και προχωρά στο επόμενο βήμα.
- **Πλοήγηση**: Το store διαχειρίζεται τη μετάβαση μεταξύ βημάτων, χρησιμοποιώντας actions όπως `nextStep()`.
- **Ολοκλήρωση**: Όταν όλα τα βήματα ολοκληρωθούν, η εφαρμογή παράγει τον τελικό κώδικα.

#### Παράδειγμα Ροής για Ένα Βήμα

1. Χρήστης βρίσκεται στο "Segment Text".
2. Πατάει "Process" → Κλήση API.
3. LLM τμηματοποιεί το κείμενο σε JSON ενότητες.
4. Αποθήκευση στη βάση.
5. UI ενημερώνεται με τις ενότητες.
6. Χρήστης εγκρίνει → Μετάβαση στο "Normalize Terminology".

## Τεχνολογίες που Χρησιμοποιούνται

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand με persist middleware
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Prisma ORM με SQLite/PostgreSQL
- **LLM Integration**: Εξωτερικά APIs (π.χ. OpenAI GPT)
- **Build Tools**: PostCSS, ESLint
- **Deployment**: Vercel ή παρόμοιο για serverless

## Συμπέρασμα

Η αρχιτεκτονική του "Rules as Code App" είναι σχεδιασμένη για ευελιξία και επεκτασιμότητα, επιτρέποντας την εύκολη προσθήκη νέων βημάτων στη μεθοδολογία και την ενσωμάτωση νέων LLM. Η χρήση του Next.js ως full-stack framework απλοποιεί την ανάπτυξη, ενώ το Prisma και το Zustand εξασφαλίζουν ασφαλή και αποδοτική διαχείριση δεδομένων και κατάστασης. Η εφαρμογή αποτελεί ένα ισχυρό εργαλείο για τη μετατροπή νομικών κειμένων σε εκτελέσιμο κώδικα, με πιθανές εφαρμογές σε νομικά συστήματα, ρυθμιστικές αρχές και αυτοματοποιημένες διαδικασίες λήψης αποφάσεων.
