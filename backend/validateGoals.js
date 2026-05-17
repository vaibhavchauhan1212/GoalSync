// backend/validateGoals.js

const validateGoalSheet = (req, res, next) => {
    const { goals } = req.body; // We expect the frontend to send an array of goals

    // Rule 1: Validate that goals exist and do not exceed 8 goals
    if (!goals || !Array.isArray(goals) || goals.length === 0) {
        return res.status(400).json({ 
            status: "error", 
            message: "You must submit at least one goal." 
        });
    }

    if (goals.length > 8) {
        return res.status(400).json({ 
            status: "error", 
            message: `Constraint Violation: Maximum 8 goals allowed. You submitted ${goals.length}.` 
        });
    }

    let totalWeightage = 0;

    // Loop through each goal to check individual constraints
    for (let i = 0; i < goals.length; i++) {
        const goal = goals[i];
        
        // Rule 2: Each individual goal must have a minimum weightage of 10%
        if (!goal.weightage || goal.weightage < 10) {
            return res.status(400).json({ 
                status: "error", 
                message: `Constraint Violation: Goal '${goal.title || 'Untitled'}' has a weightage of ${goal.weightage || 0}%. Minimum required per goal is 10%.` 
            });
        }

        totalWeightage += goal.weightage;
    }

    // Rule 3: Total weightage across all goals must equal exactly 100%
    if (totalWeightage !== 100) {
        return res.status(400).json({ 
            status: "error", 
            message: `Constraint Violation: Total weightage across all goals must equal exactly 100%. Your current total is ${totalWeightage}%.` 
        });
    }

    // If all rules pass seamlessly, move to the next step (saving to database / processing)
    next();
};

module.exports = { validateGoalSheet };