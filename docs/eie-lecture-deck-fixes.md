# EIE Lecture Deck — PowerPoint fix list

Five slide edits. Everything else in `eie-ai-lecture.pptx` reads clean.

Use PowerPoint's **Find & Replace** (Cmd+H on Mac, Ctrl+H on Windows) for each item.
The "FIND" strings are copied verbatim from the deployed deck, so exact-match replace works.

---

## Slide 1 · Title

**Element:** subtitle line under "AI and Digital Twins in Instrumentation"

**FIND:**
> What these things actually do — what they are not allowed to do — and the one trap that catches almost everybody.

**REPLACE WITH:**
> What they actually do, what they aren't allowed to do, and where the trap is.

**Why:** "the one trap that catches almost everybody" is AI-blurb / LinkedIn-hook phrasing — the one line on the deck that doesn't read in your voice.

---

## Slide 4 · Agenda

**Element:** footer line under the five-part agenda table

**FIND:**
> Part 2 is the spine, and it is the setup for Part 4 — a twin of a rotating machine IS a bearing physics model run forward in time.

**REPLACE WITH:** *(delete entirely — leave the footer blank or shorten the agenda block to fill space)*

**Why:** This is the deck explaining its own structure to the audience. The payoff — "you already built a twin this morning" — lands better on slide 24 if you haven't previewed it here. Plus, capitalising "IS" reads shouty.

---

## Slide 5 · Checked against VR20

**Element:** footer line under the three columns

**FIND:**
> I read your regulation before writing this. Everything in the middle column is why the talk is worth an hour of your time.

**REPLACE WITH:**
> Everything in the middle column is why this talk is worth an hour.

**Why:** You reading their curriculum before speaking at their department is table stakes, not something to announce.

---

## Slide 23 · Demo one · Bearing Fault Lab

**Two edits on this slide.**

### 23a — remove the leaked stage direction

**FIND:**
> The moment: on Early defect, ask the room to find the fault in the RAW spectrum. Let them fail. Then show the envelope.

**REPLACE WITH:** *(delete entirely — move this instruction to speaker notes)*

**Why:** This is you telling yourself the pedagogical trick. Students seeing "let them fail" on the screen kills the trick.

### 23b — reword the "honest" flourish

**FIND:**
> Noisy plant is the honest one. Same 22% defect, nothing changed about the bearing — the index falls to 1.6 and the annunciator returns to NORMAL. The fault is missed, and nobody is told. A false alarm is annoying and visible; a missed detection is silent.

**REPLACE WITH:**
> Noisy plant — the false negative. Same 22% defect, nothing changed about the bearing — the index falls to 1.6 and the annunciator returns to NORMAL. The fault is missed, and nobody is told. A false alarm is annoying and visible; a missed detection is silent.

**Why:** "the honest one" is coaching-tone; "the false negative" is the technical term and lands harder.

---

## Slide 34 · Q&A / close

**Element:** the last two lines on the slide

**FIND:**
> If you do not know the answer, say so.
> In a room of engineers that raises your credibility.

**REPLACE WITH:** *(delete both lines — this is a note to yourself, not a message to the audience)*

**Why:** This is Claude coaching you on Q&A behavior sitting on the closing slide the students see. Either you read it aloud (weird) or you don't (why is it there). Move to your speaker notes if you want the reminder in view.

---

## Speaker-notes home for the deleted lines

Two of the removed items are still useful *to you* — save them as speaker notes on their slides:

| Slide | Add to speaker notes |
|---|---|
| 23 | *"On Early defect, ask the room to find the fault in the raw spectrum. Wait. Let them fail. Then show the envelope."* |
| 34 | *"If a question stumps me: 'I don't know — that's outside what I've actually done.' Then move on."* |

---

## Sanity check after editing

Re-export to PDF and skim slides 1, 4, 5, 23, 34. Nothing else needs changing. The script (`lecture-script.md`) is already clean — bracketed stage directions won't leak as long as you don't read the brackets aloud.
