# Rule Implementation for Student Meal Eligibility

This directory contains the implementation of the student meal eligibility rules using the GoRules Zen engine format.

## Files Overview

### Implementation Files

- **[student_meal_eligibility_updated.json](../../../student_meal_eligibility_updated.json)**: The actual implementation of the rules in GoRules Zen engine format. This file contains the decision model with decision tables and a function node that determine a student's eligibility for meal benefits.

### Documentation Files

- **[3.3.1_decision_tables.md](3.3.1_decision_tables.md)**: Documentation of the decision tables used in the implementation.
- **[3.3.2_decision_trees.md](3.3.2_decision_trees.md)**: Documentation of the decision model structure and flow, explaining how the decision tables and function node work together.

## Implementation Approach

The implementation uses a parallel decision table approach rather than traditional decision trees. This approach offers several advantages:

1. **Modularity**: Each decision table focuses on a specific aspect of eligibility
2. **Efficiency**: Parallel processing allows for more efficient evaluation of eligibility criteria
3. **Clarity**: The separation of concerns makes the model easier to reason about and debug
4. **Maintainability**: Changes to one aspect of eligibility can be made without affecting others
5. **Scalability**: New decision tables can be added to handle additional eligibility criteria

## Testing

The implementation is tested using the [test_student_meal_eligibility_updated.ts](../../../test_student_meal_eligibility_updated.ts) file, which evaluates various scenarios:

1. Eligible student with priority (orphan)
2. Eligible student with no priority
3. Not eligible due to income
4. Not eligible due to missing documents
5. Not eligible due to foreign scholarship

To run the tests:

```bash
cd example_2
npm test
```

## Decision Model Structure

The decision model consists of the following components:

1. **Input Node**: Receives the student data, family information, and documentation status
2. **Decision Tables**:
   - Basic Eligibility: Determines whether a student meets the basic eligibility criteria
   - Income Threshold: Determines whether a student meets the income threshold criteria
   - Document Verification: Determines whether a student has submitted all required documents
   - Priority Categories: Determines a student's priority category and score
3. **Function Node**: Collects results from the decision tables and formats the final output
4. **Output Node**: Returns the final eligibility determination

For more details on the decision model structure and flow, see [3.3.2_decision_trees.md](3.3.2_decision_trees.md).
