# Student Calendar Gamification & Logic Update

## Overview
Transform the Student Calendar into a tool for both future planning and historical tracking, adding gamification elements to encourage frequency.

## Requirements
1.  **Past vs Future Logic:**
    *   **Past:** Show actual check-in records.
    *   **Future:** Show scheduled classes (reservations/intent).
2.  **Gamification Header:**
    *   Display a goal tracker (e.g., "Missing X trainings for your goal").
    *   Focus on weekly consistency (e.g., goal of 3 trainings/week).

## Technical Implementation

### 1. Data Fetching (`StudentCalendar.js`)
*   Fetch `checkins` for the current student from `gyms/{gymId}/checkins`.
    *   Filter by `studentId`.
*   Keep fetching `classes` for future schedule generation.

### 2. Event Merging Logic
*   **Past Dates (< Today):**
    *   Use `checkins` data.
    *   Visual style: Solid color (completed), maybe checkmark icon.
*   **Future Dates (>= Today):**
    *   Use `classes` schedule generation (existing logic in `FreeGymScheduler` usually handles this, but we might need to adjust or pass pre-processed events).
    *   Visual style: Outlined or lighter opacity (planned).

### 3. Gamification Header Component
*   Create `TrainingGoalHeader` component.
*   Calculate `completedTrainings` this week based on `checkins`.
*   Define `weeklyGoal` (default to 3, or fetch from user profile if available).
*   Display progress bar or snake-like text bubbles.

### 4. `FreeGymScheduler` Adaptation
*   Ensure it can handle "Past" events that might not match the current schedule (e.g., a class time changed, but the check-in record remains).
*   Or, simpler: Pre-process all events in `StudentCalendar` and pass a unified list to `FreeGymScheduler`, or customize `FreeGymScheduler` to accept `pastEvents` and `futureEvents`.

## Tasks
- [ ] Create `TrainingGoalHeader` component in `src/presentation/components`.
- [ ] Update `StudentCalendar.js` to fetch student check-ins.
- [ ] Implement event merging logic (Past Check-ins + Future Schedules).
- [ ] Add `TrainingGoalHeader` to `StudentCalendar`.
- [ ] Verify visual distinction between Past (Check-in) and Future (Reservation).
