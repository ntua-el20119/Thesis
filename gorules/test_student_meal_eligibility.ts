import { ZenEngine } from '@gorules/zen-engine';
import fs from 'fs/promises';

const main = async () => {
  const content = await fs.readFile('student_meal_eligibility.json');
  const engine = new ZenEngine();
  console.error("json content", content.toString());
  const decision = engine.createDecision(content);
  
  // Test case 1: Eligible student with priority (orphan)
  const result1 = await decision.evaluate({
    "student": {
      "isActive": true,
      "institution": {
        "isEligible": true
      },
      "hasForeignScholarship": false,
      "maritalStatus": "SINGLE",
      "age": 20,
      "isOrphan": true,
      "isChildOfTerrorismVictim": false,
      "hasSeriousIllness": false,
      "hasFamilyDisability": false,
      "isSingleParent": false,
      "isChildOfUnmarriedMother": false,
      "isFromLargeFamily": false,
      "isFromMultiChildFamily": false,
      "hasStudentSiblings": false
    },
    "family": {
      "childCount": 1,
      "income": 30000
    },
    "documents": {
      "hasIdDocument": true,
      "hasEnrollmentCertificate": true,
      "hasIncomeDocumentation": true
    }
  });
  console.error("Test Case 1 (Eligible with Orphan Priority):", result1);
  
  // Test case 2: Eligible student with no priority
  const result2 = await decision.evaluate({
    "student": {
      "isActive": true,
      "institution": {
        "isEligible": true
      },
      "hasForeignScholarship": false,
      "maritalStatus": "SINGLE",
      "age": 20,
      "isOrphan": false,
      "isChildOfTerrorismVictim": false,
      "hasSeriousIllness": false,
      "hasFamilyDisability": false,
      "isSingleParent": false,
      "isChildOfUnmarriedMother": false,
      "isFromLargeFamily": false,
      "isFromMultiChildFamily": false,
      "hasStudentSiblings": false
    },
    "family": {
      "childCount": 1,
      "income": 30000
    },
    "documents": {
      "hasIdDocument": true,
      "hasEnrollmentCertificate": true,
      "hasIncomeDocumentation": true
    }
  });
  console.error("Test Case 2 (Eligible with No Priority):", result2);
  
  // Test case 3: Not eligible due to income
  const result3 = await decision.evaluate({
    "student": {
      "isActive": true,
      "institution": {
        "isEligible": true
      },
      "hasForeignScholarship": false,
      "maritalStatus": "SINGLE",
      "age": 20,
      "isOrphan": false,
      "isChildOfTerrorismVictim": false,
      "hasSeriousIllness": false,
      "hasFamilyDisability": false,
      "isSingleParent": false,
      "isChildOfUnmarriedMother": false,
      "isFromLargeFamily": false,
      "isFromMultiChildFamily": false,
      "hasStudentSiblings": false
    },
    "family": {
      "childCount": 1,
      "income": 60000
    },
    "documents": {
      "hasIdDocument": true,
      "hasEnrollmentCertificate": true,
      "hasIncomeDocumentation": true
    }
  });
  console.error("Test Case 3 (Not Eligible Due to Income):", result3);
  
  // Test case 4: Not eligible due to missing documents
  const result4 = await decision.evaluate({
    "student": {
      "isActive": true,
      "institution": {
        "isEligible": true
      },
      "hasForeignScholarship": false,
      "maritalStatus": "SINGLE",
      "age": 20,
      "isOrphan": false,
      "isChildOfTerrorismVictim": false,
      "hasSeriousIllness": false,
      "hasFamilyDisability": false,
      "isSingleParent": false,
      "isChildOfUnmarriedMother": false,
      "isFromLargeFamily": false,
      "isFromMultiChildFamily": false,
      "hasStudentSiblings": false
    },
    "family": {
      "childCount": 1,
      "income": 30000
    },
    "documents": {
      "hasIdDocument": true,
      "hasEnrollmentCertificate": false,
      "hasIncomeDocumentation": true
    }
  });
  console.error("Test Case 4 (Missing Documents):", result4);
  
  // Test case 5: Not eligible due to foreign scholarship
  const result5 = await decision.evaluate({
    "student": {
      "isActive": true,
      "institution": {
        "isEligible": true
      },
      "hasForeignScholarship": true,
      "maritalStatus": "SINGLE",
      "age": 20,
      "isOrphan": false,
      "isChildOfTerrorismVictim": false,
      "hasSeriousIllness": false,
      "hasFamilyDisability": false,
      "isSingleParent": false,
      "isChildOfUnmarriedMother": false,
      "isFromLargeFamily": false,
      "isFromMultiChildFamily": false,
      "hasStudentSiblings": false
    },
    "family": {
      "childCount": 1,
      "income": 30000
    },
    "documents": {
      "hasIdDocument": true,
      "hasEnrollmentCertificate": true,
      "hasIncomeDocumentation": true
    }
  });
  console.error("Test Case 5 (Foreign Scholarship):", result5);
};

main();
