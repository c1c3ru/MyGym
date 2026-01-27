# Task: Implementation of Snake Path Graduation Timeline

## Status
- [ ] Analysis
- [ ] Planning
- [ ] Solutioning
- [ ] Implementation
- [ ] Verification

## Analysis
- **Goal:** Replace the current simple list timeline with a "Snake Path" (Zig-zag) full-width layout in `StudentEvolution.js`.
- **Visual Style:** Combine the snake path with Minimalist "Pulse" and Glassmorphism effects.
- **Game-like progression:** Show past and future milestones (locked/upcoming) based on official federation rules.
- **Detailed Modals:** Opening a modal with full info when clicking a milestone.
- **Components involved:** `StudentEvolution.js`, `designTokens.ts`, `GlassCard.js`, potentially a new `GraduationModal`.

## Planning
- [ ] Define helper for standard belt progressions (Jiu-Jitsu, Muay Thai, etc.).
- [ ] Create a `GraduationPath` internal component.
- [ ] Implement zig-zag logic based on index.
- [ ] Add the "Snake Line" background connector.
- [ ] Apply pulse animations and glass effects.

## Solutioning
- Standard progression list for common modalities.
- Use `useWindowDimensions` for responsive path drawing.
- SVG or absolute-positioned lines for the "Snake Path".
- Animation with `Animated` API for pulses.

## Implementation
1. Define `GRADUATION_PROGRESSIONS` (IBJJF, Muay Thai, etc.).
2. Implement `SnakeTimeline` component in `StudentEvolution.js`.
3. Create `MilestoneModal` for graduation details.
4. Add zig-zag and pulse animations.
5. Ensure full-width responsiveness.

## Verification
- [ ] Check layout on different screen widths.
- [ ] Verify filter functionality.
- [ ] Confirm color contrast and accessibility.
