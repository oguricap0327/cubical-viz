# Cubical Type Theory Visualizer - Design Document

## Goal
Transform the current geometric primitive visualizations into **interactive rule-based visualizations** that teach the core typing rules and computational behavior of Cubical Type Theory.

## Current State
- ✅ Basic geometric primitives: interval, paths, squares, cubes
- ❌ No typing rules shown
- ❌ No computational behavior demonstrated
- ❌ Limited educational value

## Design Philosophy

### What Makes a Good Rule Visualization?
1. **Show the typing judgment** - display the rule in CCHM notation
2. **Geometric intuition** - 3D representation of what the rule means spatially
3. **Interactive transformation** - let users manipulate terms and see how they evaluate
4. **Step-by-step computation** - show reduction/evaluation steps

### Notation System
Follow CCHM paper exactly:
- Interval: `I` with endpoints `0`, `1`, names `i, j, k`
- Face formulas: `ϕ, ψ ::= 0F | 1F | (i = 0) | (i = 1) | ϕ ∧ ψ | ϕ ∨ ψ`
- Path types: `Path A u v` (dependent paths from `u` to `v` in type `A`)
- Composition: `comp^i A [ϕ ↦ u] a₀`
- Transport: `transp^i A a` (special case: `comp^i A [] a`)
- Glue: `Glue [ϕ ↦ (T, f)] A`

## Priority Rules to Visualize

### Tier 1: Foundation (Must Have)
These unlock understanding of the entire system.

#### 1. Path Types - Introduction & Elimination
**Rule:**
```
Γ, i : I ⊢ t : A
─────────────────────
Γ ⊢ ⟨i⟩ t : Path A t(i0) t(i1)
```

**Visualization:**
- Show interval `I` as a line segment with endpoints
- Animate `t` varying along `i` from `0` to `1`
- Display the path as a continuous curve in the type space
- Interactive: user can scrub `i` to see `t(i)` at different points

**Computation:**
- Path application: `(⟨i⟩ t) r` reduces to `t(i/r)`
- Show substitution visually

#### 2. Composition - The Heart of Cubical
**Rule:**
```
Γ, i : I ⊢ A    Γ ⊢ ϕ : F    Γ, ϕ, i : I ⊢ u : A    Γ ⊢ a₀ : A(i0)[ϕ ↦ u(i0)]
──────────────────────────────────────────────────────────────────────────────────
Γ ⊢ comp^i A [ϕ ↦ u] a₀ : A(i1)[ϕ ↦ u(i1)]
```

**Visualization:**
- Show an "open box" (partial cube with some faces specified by `ϕ`)
- The base `a₀` at `i=0`
- The partial sides `u` defined on extent `ϕ`
- Animate filling the box to compute the lid at `i=1`
- **Key insight:** "Being extensible is preserved along paths"

**Example: Transitivity**
```
p : Path A a b    q : Path A b c
────────────────────────────────────────────────────
⟨i⟩ comp^j A [(i=0) ↦ a, (i=1) ↦ q j] (p i) : Path A a c
```
Visualize as a square with dashed diagonal:
```
a ─────────→ c
│           ╱
│ p       ╱ result
│       ╱ q
↓     ╱
b ───╯
```

#### 3. Transport
**Rule:**
```
Γ, i : I ⊢ A    Γ ⊢ a : A(i0)
──────────────────────────────
Γ ⊢ transp^i A a : A(i1)
```

**Visualization:**
- Show type `A` varying along `i` (e.g., morphing shape)
- Element `a` at `A(i0)` being "transported" to `A(i1)`
- This is `comp^i A [] a` (composition with empty extent)

**Example:** Transport along `Path U Nat Bool` (if we had a universe)

### Tier 2: Advanced (Should Have)

#### 4. Kan Filling
**Rule:**
```
fill^i A [ϕ ↦ u] a₀ = comp^j A(i/i∧j) [ϕ ↦ u(i/i∧j), (i=0) ↦ a₀] a₀
```

**Visualization:**
- Show both the lid (composition) AND the interior (filling)
- Animate the filling process from `i=0` to `i=1`
- Display: `v(i0) = a₀`, `v(i1) = comp`, `v = u` on `ϕ`

#### 5. Glue Types - Univalence
**Rule:**
```
Γ ⊢ ϕ : F    Γ, ϕ ⊢ T    Γ, ϕ ⊢ f : Equiv T A    Γ ⊢ A
────────────────────────────────────────────────────────
Γ ⊢ Glue [ϕ ↦ (T, f)] A
```

**Visualization:**
- Show partial type `T` on extent `ϕ`
- Show total type `A`
- Equivalence `f : T ≃ A` as a bidirectional morphing
- Glue operation "glues" them together along `ϕ`

**Diagram (from paper):**
```
      Glue [ϕ ↦ (T, f)] A
     ╱                  ╲
    T ─────f≃───────→ A
    │                  │
    ϕ                  Γ
```

**Example: Path from Equivalence**
```
f : Equiv A B
E = Glue [(i=0) ↦ (A, f), (i=1) ↦ (B, id_B)] B
```
- At `i=0`: `E = A`
- At `i=1`: `E = B`
- Result: `Path U A B` (univalence!)

### Tier 3: Nice to Have

#### 6. Composition for Specific Types
Show how composition is defined by induction on types:
- **Product types:** `comp^i ((x:A)→B) [ϕ ↦ μ] λ₀`
- **Path types:** `comp^i (Path A u v) [ϕ ↦ p] p₀`
- **Glue types:** The complex algorithm from Section 6.2

#### 7. Systems and Face Formulas
Interactive tool to:
- Build face formulas `ϕ` visually (select faces of a cube)
- Show systems `[ϕ₁ ↦ t₁, ..., ϕₙ ↦ tₙ]` as partial definitions
- Visualize compatibility conditions

## Implementation Strategy

### Phase 1: Refactor Current Code
1. Extract common 3D utilities (camera, controls, text rendering)
2. Create a `Rule` component that displays:
   - Rule name
   - Typing judgment (LaTeX or formatted text)
   - 3D scene
   - Interactive controls
3. Separate geometric primitives into reusable modules

### Phase 2: Implement Tier 1 Rules
1. **Path types** - simplest, builds on existing interval viz
2. **Transport** - shows type-varying behavior
3. **Composition** - most complex, most important

### Phase 3: Add Interactivity
- Sliders for interval variables (`i`, `j`)
- Buttons to step through computation
- Input fields to change terms
- "Play" animation for automatic stepping

### Phase 4: Implement Tier 2 & 3
- Kan filling
- Glue types
- Type-specific compositions

## Technical Considerations

### 3D Representation Challenges
- **Abstract types:** How to visualize `A : Type`? Use abstract shapes (spheres, tori)?
- **Higher dimensions:** Cubes are 3D, but we have arbitrary dimensions. Use projections?
- **Equivalences:** How to show `f : Equiv T A`? Morphing animation?

### UI/UX
- Split screen: rule on left, visualization on right
- Step-by-step mode vs. continuous animation
- Tooltips explaining each part of the rule
- "Why does this work?" explanations

### Performance
- Three.js can handle complex scenes
- May need LOD (level of detail) for higher-dimensional objects
- Lazy loading for complex rules

## Success Criteria
A learner should be able to:
1. **Understand** what composition does geometrically
2. **See** how transport moves elements along type paths
3. **Grasp** why glue types enable univalence
4. **Experiment** with different inputs and see results
5. **Build intuition** for why cubical type theory is "computational"

## Next Steps
1. ✅ Read CCHM paper (done)
2. ✅ Write design doc (this document)
3. ⏭️ Refactor current codebase
4. ⏭️ Implement Path types visualization
5. ⏭️ Implement Composition visualization
6. ⏭️ Iterate based on feedback

---

**Note:** This is a long-term project. We'll build incrementally, one rule at a time, ensuring each visualization is pedagogically valuable before moving to the next.

---

## Implementation Plan (v2 — March 2026)

See `improvements.pdf` for the full design rationale. Tasks in priority order:

### Completed ✅
- All 5 rules with KaTeX judgments and 3D visualizations
- Bidirectional hover highlighting (3D ↔ typing rule terms)
- Autonomous looping animations, no progress bar controls
- Consistent dark theme, MeshBasicMaterial (flat shading)
- Ambient light tuned to intensity 2.0

### Task 1 — Color vocabulary + gradient colors
- Create `src/lib/colors.ts` with semantic color constants
- Apply consistently across all 5 rules
- Add vertex-color gradient to Transport arc (cyan → orange along i)
- Add gradient to Interval primitive line

### Task 2 — Composition: square fill
- Replace arc animation with a literal unit square
- Three given edges drawn in distinct colors; fourth edge animated in
- Maps directly to: `comp^i A [i=0 ↦ u₀, i=1 ↦ u₁] p`

### Task 3 — Transport: morphing fibers
- Show type family A as deforming geometry across the path
- Element moves through continuously changing fiber
- Gradient color encodes position along i

### Task 4 — Axis labels (i/j/k)
- Thin labeled axes in each 3D scene
- Toggle with keyboard shortcut A

### Task 5 — Glue types: bidirectional equivalence arrows
- Replace arc with two arrows f: T→A and g: A→T
- Show round-trip animation (homotopy inverse)

### Task 6 — URL hash routing
- Deep link to specific rules: `/cubical-viz/#transport-rule`

### Task 7 — Step-by-step mode
- Pause points with explanatory text callouts at each conceptual stage

### Color vocabulary (semantic)
| Concept | Color | Hex |
|---------|-------|-----|
| Interval / i-dimension | Cyan | `#44DDFF` |
| Type family A | Blue | `#4488FF` |
| Base point / a₀ | Yellow | `#FFDD44` |
| Result / transported | Orange | `#FF8844` |
| Partial data / φ | Green | `#44FF88` |
| Fill / composition result | Pink | `#FF44AA` |
| Equivalence | Purple | `#AA44FF` |
