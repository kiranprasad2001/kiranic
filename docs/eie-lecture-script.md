# AI and Digital Twins in Instrumentation

**Guest lecture — 60 minutes**
**Audience: mostly current EIE students, VRSEC**
**Delivery: ~54 minutes of content, 6 minutes Q&A**

| Part | Minutes | |
|---|---|---|
| 0 | 5 | Open |
| 1 | 8 | The stack, honestly |
| 2 | 18 | One failure, all the way down — the bearing spine |
| 3 | 6 | Demo one: Bearing Fault Lab |
| **4** | **11** | **Digital twins** — named part, with demo two inside it |
| 5 | 6 | What to learn, and what the jobs are |
| — | 6 | Q&A |

**On the balance.** The talk is advertised as *AI and Digital Twins in Instrumentation*, so
twins are a named part with their own eleven minutes, not an aside. The time came out of the
opening, the stack section and the career close — not out of Part 2. Part 2 is still the spine:
the bearing is what makes the twins section land, because by the time you get there the room
already knows what a bearing physics model actually contains.

---

## How to use this document

Plain text is roughly what you say. Text in `[brackets]` is a stage direction, not
something you read aloud. Timings are cumulative markers, not targets to hit exactly.
If you are running long, the compressible sections are marked **CUT IF LONG**.

**Check the year group before you finalize.** This lecture leans on Digital Signal Processing
— FFT and filter design — which in VR20 sits in **Semester VI**. Process Control is Semester V
and Computer Control of Processes is Semester VII. If the room is third year or below, they
have not had DSP, and Part 2 needs an extra five minutes explaining what an FFT does before
you can use it. Ask the organizer which semester they are in. If it is a mixed room, open with
a show of hands on who has finished DSP and adjust on the spot.

The single most important delivery note: you are not pretending to be a plant engineer.
The talk is built so that your actual credibility carries it. Do not drift into claiming
field experience you do not have. When you do not know, say you do not know. In a room of
students, that is the most valuable thing you can model.

---

# PART 0 — Open (0:00 – 0:05)

## 0.1 Cold open

`[Do not introduce yourself yet. Put up the title slide and ask the room a question.]`

> Quick show of hands. How many of you have taken a measurements or transducers lab where
> you wired up a thermocouple or a strain gauge, and the reading drifted, or was noisy, or
> just looked wrong?

`[Wait. Most hands go up. This always happens.]`

> Keep your hand up if the hard part of that lab was the physics of the sensor.

`[Almost all hands go down.]`

> Right. The sensor was fine. The hard part was everything after the sensor. That is the
> whole talk in one sentence. Instrumentation has never really been limited by our ability
> to measure things. It has been limited by what we can do with the measurement once we
> have it. That is the part that has changed in the last ten years, and that is the part
> where AI actually lives.

## 0.2 Who is talking and why you should discount some of it

> Let me tell you who I am, including the parts that should make you discount me.
>
> I sat where you are sitting. I graduated from this program. Since then I have spent
> thirteen years as a consultant, at TCS, then Cognizant, then Accenture, working on
> enterprise content and communications systems for banks and insurers. I now live in
> Toronto. My work is systems that ingest data, transform it, and produce something a
> regulated business can be held accountable for.
>
> Here is the disclaimer. I have never commissioned a control loop. I have never signed off
> on a safety instrumented system. If somebody in this room works in plant automation, you
> know things about this domain that I do not, and I would rather you correct me in the Q&A
> than sit on it.
>
> So why am I standing here. Two reasons.
>
> First, the thing that makes AI work or fail in industry is almost never the model. It is
> the data pipeline, the failure modes, the governance, and whether anyone trusts the
> output. I have spent thirteen years on exactly those problems in a different regulated
> industry, and the lessons transfer almost completely.
>
> Second, and more useful to you: I am an EIE graduate who ended up doing AI architecture.
> Your professors can teach you instrumentation better than I can. What nobody in this
> building can tell you is what the path from that chair to this one actually looks like.
> That is the part I will be straight with you about at the end.

## 0.3 The map

`[Slide: agenda. Keep this to twenty seconds.]`

> Five parts. What the instrumentation stack actually looks like today. Then one worked
> example in real detail — a bearing failure — because I would rather you leave understanding
> one thing completely than four things vaguely. Then a demo of that. Then digital twins, which
> is the part the title promised and the part where I will be most sceptical. Then what to
> actually learn, and what the jobs actually are.
>
> `[The bearing is not a detour from the twins material. It is the setup for it. A twin of a
> rotating machine IS a bearing physics model run forward in time — so the room has to know
> what is inside that model before the twins section can mean anything.]`

---

# PART 1 — The stack, honestly (0:05 – 0:13)

`[COMPRESSED to 8 minutes to fund Part 4. Do not linger on any single slide here; the value
of this part is orientation, not depth.]`

## 1.1 The measurement chain has not changed

`[Slide: the classic chain.]`

> The chain you learn in second year is still exactly right.
>
> Process → sensor → signal conditioning → ADC → controller → actuator → back to process.
>
> Nothing about AI deletes any of this. A 4-20 mA current loop is still 4-20 mA. It is still
> current rather than voltage because current does not care about lead resistance, and live
> zero at 4 mA still tells you the difference between "reading zero" and "the wire is
> broken." That was a good engineering decision in the 1950s and it is still a good
> engineering decision. HART still rides digital data on top of that analog loop.
>
> I want to be blunt about this because there is a lot of marketing that implies the old
> stack is obsolete. It is not. It is the foundation, and AI sits on top of it.

## 1.2 Where the layers actually sit

`[Slide: Purdue model, levels 0 through 5.]`

`[Checked against VR20. Industrial Automation (Sem VI) is CORE and covers PLC, DCS and SCADA,
so the lower levels are familiar. Industrial Communication Networks is now only an elective
(PE2), and the Industrial Internet of Things elective (PE3) is the one place the full stack —
"industrial protocols, SCADA, Historian, ERP and MES" — is actually taught. The word "Purdue"
appears nowhere in the syllabus. So: name the model, connect levels 1 and 2 to Industrial
Automation which everyone has, and spend your time on level 3 and above, which is elective-only
and therefore new to most of the room.]`

> The reference architecture is the Purdue model. You have already met the bottom of it
> without the name — the PLC, DCS and SCADA layers from Industrial Automation are levels 1
> and 2 of this picture.
>
> - **Level 0** — the field. Sensors and actuators. Physics.
> - **Level 1** — basic control. PLCs, DCS controllers. This is where a PID loop lives, and
>   it runs on a deterministic scan cycle, typically 10 to 100 milliseconds.
> - **Level 2** — supervisory. SCADA, HMI. Operators look at this.
> - **Level 3** — site operations. The historian, batch records, MES.
> - **Levels 4 and 5** — enterprise IT. ERP, the cloud, the data lake.
>
> Two things matter about this picture.
>
> First, **the further up you go, the more latency you accept and the more context you
> gain.** Level 1 knows one loop, right now, in milliseconds. Level 4 knows every asset
> across every site for ten years, and is minutes to hours behind.
>
> Second, **data flows up much more freely than commands flow down.** That asymmetry is
> deliberate and it is a security control. We will come back to it.

## 1.3 How the data actually moves

`[Slide: protocol stack. Don't dwell — name them so the words are familiar.]`

`[Checked against VR20. HART and PROFIBUS are covered — but only in Industrial Communication
Networks, which is an ELECTIVE (PE2, Sem VI). Modbus, OPC UA and MQTT appear NOWHERE in the
entire syllabus; "OPC" has zero hits. So unlike the previous regulation, you cannot assume
even the fieldbuses. Ask who took the elective, give the first three one line each, and treat
OPC UA and MQTT Sparkplug as genuinely new — because for this cohort they are.]`

> The protocols you will actually encounter, roughly oldest to newest:
>
> - **4-20 mA and HART** — field devices to controller.
> - **Modbus** — ancient, dead simple, absolutely everywhere. Registers and coils. No
>   security whatsoever, which is a real problem.
> - **PROFIBUS / PROFINET, EtherNet/IP** — industrial fieldbuses.
> - **OPC UA** — the important one. This is the modern standard for getting data out of
>   control systems in a way that carries meaning, not just numbers. It has an information
>   model, so a tag can say "I am a temperature in degrees Celsius on this piece of
>   equipment" instead of just "register 40012."
> - **MQTT with Sparkplug B** — lightweight publish/subscribe, increasingly the way edge
>   devices report upward.
>
> Then it lands in a **historian**. In process industries that is usually OSIsoft PI, now
> AVEVA PI, or AspenTech IP.21. In newer or greenfield stacks you will see time-series
> databases like InfluxDB or TimescaleDB.
>
> `[Aside, worth saying:]` If a vendor pitches you an "AI for manufacturing" product and
> cannot tell you how it gets data out of your DCS, they do not have a product. Ninety
> percent of the work in these projects is here, at the boring integration layer. That is
> true in banking too. It is true everywhere.

## 1.4 Edge versus cloud, and a number I want you to remember

`[Slide: latency budget.]`

> Everyone will tell you edge computing gives you "real-time AI." Let us be precise, because
> imprecision here is how people get hurt.
>
> A small neural network running on an edge device — a microcontroller or a gateway — takes
> on the order of **one to fifty milliseconds** to produce an inference. Then the decision
> has to reach an actuator. A contactor takes tens of milliseconds to open. A variable
> frequency drive responds in tens of milliseconds. A large valve takes seconds.
>
> So the honest number for a full AI-in-the-loop reaction is **tens of milliseconds at
> best.**
>
> You will read claims of microsecond AI response. That is wrong by three or four orders of
> magnitude. Microsecond response belongs to hardwired interlocks, analog trip amplifiers,
> and comparators. Those have no software in the path at all, and that is exactly why they
> are trusted with safety.
>
> `[This is a good place to slow down.]`
>
> Here is the rule I want you to leave with. **AI in industrial systems is almost always
> advisory. It sits above the control layer, not inside it.** It tells a human or a
> supervisory system what it thinks. It very rarely has direct authority over an actuator,
> and it essentially never has authority over a safety function. I will explain why in
> Part 2.

---

# PART 2 — One failure, all the way down (0:13 – 0:31)

`[This is the heart of the lecture. Slow down. Do not rush the derivation.]`

## 2.1 Why a bearing

> I am going to spend eighteen minutes on a single rolling-element bearing failing.
>
> Two reasons. Bearings cause somewhere around forty to fifty percent of failures in
> electrical rotating machines, so this is not a toy example. And more importantly, it is
> the cleanest case I know where you can see the entire path from physics to signal
> processing to machine learning to a business decision, in one story.

## 2.2 The physics gives you the answer before you look

`[Slide: bearing kinematics — three frequencies from the rolling constraint.]`

> Here is a deep-groove ball bearing. Outer race, fixed to the housing. Inner race, rotating
> with the shaft at frequency f-r. Nine balls held by a cage between them.
>
> The balls roll. They do not slide, ideally. That rolling constraint means the cage rotates
> at a specific fraction of the shaft speed. Work it out from the rolling condition and you
> get the **fundamental train frequency**:
>
> ```
> FTF = (f_r / 2) · (1 − (d/D)·cos θ)
> ```
>
> where d is ball diameter, D is pitch diameter, θ is contact angle.
>
> Now. Suppose there is a spall — a small pit — on the **outer** race. Every time a ball
> rolls over that pit, it produces a mechanical impact. There are n balls, and they go past
> any fixed point on the outer race at n times the cage frequency. So:
>
> ```
> BPFO = n · FTF = (n/2) · f_r · (1 − (d/D)·cos θ)
> ```
>
> And if the pit is on the **inner** race, which is itself rotating, the balls pass it at n
> times the relative speed:
>
> ```
> BPFI = (n/2) · f_r · (1 + (d/D)·cos θ)
> ```

`[Slide: worked numbers. Do this out loud, slowly.]`

> Let us put numbers on it. This is an SKF 6205, which is a real bearing and the one used in
> the Case Western public dataset, so you can go verify everything I am about to say.
>
> - 9 balls, ball diameter 7.94 mm, pitch diameter 39.04 mm, contact angle 0.
> - d/D = 0.2034
> - Motor at 1797 rpm, so f_r = 29.95 Hz
>
> FTF = (29.95 / 2) × (1 − 0.2034) = 11.93 Hz
> BPFO = 9 × 11.93 = **107.4 Hz**
> BPFI = (9/2) × 29.95 × 1.2034 = **162.2 Hz**
>
> `[Pause here. This is the point of the whole section.]`
>
> Stop and appreciate what just happened. **We now know the frequency at which the fault
> will announce itself, before we have measured anything.** We derived it from geometry.
> That is not machine learning. That is mechanics, and it is worth more than any model,
> because it turns an open-ended search problem into a question of looking in one specific
> place.
>
> One detail that shows you bearings are designed by people who thought about this. Notice
> BPFO is 3.585 times shaft speed. Not 3, not 4. Bearing manufacturers deliberately choose
> ball counts so that defect frequencies are **not** integer multiples of shaft speed,
> precisely so they do not hide underneath shaft harmonics.

## 2.3 Why you cannot just take an FFT

`[Slide: raw spectrum with the defect invisible.]`

> So we take an accelerometer, sample it, take an FFT, and look at 107.4 Hz. Done?
>
> No. And understanding why not is the single most useful thing in this lecture.
>
> An early spall produces impacts that are **tiny in energy** and **very short in duration.**
> Meanwhile the machine has shaft imbalance, misalignment, and blade-pass or gear-mesh
> forces that are orders of magnitude larger. In the demo you are about to see, the 1x shaft
> line is roughly a hundred and seventy times bigger than anything the defect puts at 107 Hz.
>
> And there is a second problem, which is more interesting. A very short impact is **broadband
> in frequency.** It does not deposit its energy at 107 Hz. What it actually does is *ring*
> the structure — the bearing housing has a mechanical resonance, often somewhere between two
> and fifteen kilohertz, and each impact excites that resonance, which then decays.
>
> So the defect energy is smeared across a high-frequency band, and what carries the
> diagnostic information is not the frequency of the ringing. **It is the rate at which the
> ringing is repeated.**

## 2.4 Envelope analysis: the actual technique

`[Slide: the four-step pipeline. This is the money slide.

Two companion webapps for this section. Use the first for a mixed room and
switch to the second only for a technical follow-up.

  1. kiranic.com/lecture/envelope-intuition.html — five plain-English scenes,
     no equations. Animated bearing, waveform with the envelope drawn on top,
     ends on the 107 Hz peak. Meant for students who have not done DSP.
  2. kiranic.com/lecture/envelope-analysis.html — the seven-stage technical
     walkthrough. Show this to anyone who asks "but how do you actually
     compute the envelope?" — it derives the Hilbert transform live.

Arrow keys advance scenes in both.]`

> This is amplitude modulation. The defect is the modulating signal. The structural
> resonance is the carrier.
>
> `[CRITICAL — checked against VR20. There is no communications systems course in this
> program, and the word "modulation" does not appear anywhere in the syllabus. Signals and
> Systems was removed in VR20; DSP is a single 2-credit course in Semester VI. The Hilbert
> transform and the analytic signal appear nowhere. So you cannot lean on ANY prior exposure
> here — not AM, not demodulation, not spectral symmetry. Build all of it from scratch and
> budget four minutes. This is the single largest gap between this lecture and their
> coursework, and it is also the most valuable thing you can hand them.]`
>
> This is amplitude modulation, and I am going to assume you have never demodulated anything,
> because it is not in your syllabus. It takes four minutes and you already have every tool.
>
> Take the signal and take its DFT — the transform you compute with the FFT in your DSP
> course. Here is a fact about that transform: when the input is a real signal, the spectrum
> is symmetric. The negative-frequency half is the mirror image of the positive half and
> carries no information the positive half does not already have.
>
> So: **delete the negative frequencies.** Double the positive ones to keep the energy right.
> Transform back. What you get is complex-valued, and it is called the **analytic signal.**
> The operation that produced it is the **Hilbert transform.**
>
> Why is that useful? Because the analytic signal is the original signal as the real part,
> and a 90-degree phase-shifted copy as the imaginary part. Take its magnitude — square root
> of real squared plus imaginary squared — and the oscillation cancels out. What is left is
> the **outline** of the signal. The envelope.
>
> `[Analogy that works well here:]` It is the same reason that if you have sin(t) and
> cos(t), the magnitude is exactly 1 with no wiggle. You have traded a wiggling signal for
> its amplitude.
>
> That is the whole trick. Three lines of code. And you have not seen it in any course in
> this program, which is exactly why I am spending time on it.
>
> The procedure, and this is standard practice in the field, is:
>
> 1. **Band-pass filter** around the structural resonance. Throw away the low frequencies
>    entirely. That deletes the shaft imbalance, which was drowning everything.
> `[Anchor this. VR20 Digital Signal Processing, Semester VI, outcomes CO3 and CO4: design
> Butterworth and Chebyshev IIR filters by bilinear transformation and impulse invariance,
> and design FIR filters by windowing. That IS this filter. Say it plainly: "You have already
> designed this filter in DSP. You were just never told what it was for." Note the timing
> risk though — DSP is Semester VI, so a third-year room may not have taken it yet.]`
> 2. **Take the analytic signal** via the Hilbert transform, and take its magnitude. That
>    gives you the envelope — the outline of the ringing, stripped of the carrier.
> 3. **Remove the DC component**, then **FFT the envelope.**
> 4. Look at 107.4 Hz.
>
> And there it is. A clean line at BPFO with harmonics.
>
> The name for this in industry is **envelope analysis**, or envelope detection, or
> high-frequency resonance technique. It dates to the 1970s. It predates the machine learning
> by about forty years, and it is doing most of the work.

`[Worth saying explicitly:]`

> I want to name what just happened, because it generalizes far beyond bearings. **We used
> domain knowledge to build a feature in which the fault is obvious.** The model that comes
> next is almost trivial once you have that feature. If you skip this step and throw raw
> vibration at a deep network, you are asking the network to rediscover the Hilbert
> transform and bearing kinematics from data. It might. It will need vastly more data, and
> you will not be able to explain what it learned.
>
> This is the most common expensive mistake I see, and not just in this domain. In my own
> field, people throw raw documents at a language model when three lines of parsing would
> have made the problem trivial.

## 2.5 A detail that separates people who have done this from people who have not

`[CUT IF LONG — but it is a good detail.]`

> Two practical constraints.
>
> **Sampling.** To see a 15 kHz resonance you need to sample above 30 kHz by Nyquist, and in
> practice two and a half to five times the highest frequency of interest, with a proper
> analog anti-alias filter before the ADC. Not a digital filter afterwards. Once it is
> aliased the information is gone forever.
>
> **Frequency resolution.** Your resolution is 1 over the record length. To resolve BPFO at
> 107.4 Hz from a nearby harmonic you might need one hertz resolution, which means a **one
> second record.** At 50 kHz sampling that is 50,000 samples per measurement, per axis, per
> bearing. Now multiply by a plant with four thousand motors. That number is why edge
> processing exists: you compute the envelope spectrum at the sensor and send up a few
> hundred numbers instead of fifty thousand.

## 2.6 Now, finally, the machine learning

`[Slide: features → model.]`

> Now we can talk about the model, and you will notice how much smaller this section is than
> the signal processing section. That ratio is correct and it is the point.
>
> **Features** we extract per measurement:
>
> - RMS — overall vibration energy. Rises late.
> - **Kurtosis** — the fourth standardized moment. It measures how impulsive a signal is. A
>   Gaussian has kurtosis 3; a signal with sharp spikes has much more. Rises early. This is
>   a genuinely good early indicator.
> `[Ground this carefully. VR20 has NO probability or statistics course in eight semesters —
> the only "probability" in the document is permutations and combinations in a soft-skills
> aptitude module. Their one real anchor is a single topic in Sensors and Transducers,
> Semester III: "Measurement Errors and Statistical Analysis — combination of limiting error,
> statistical treatment, curve fitting." So say: "you did statistical treatment of measurement
> error in Sensors and Transducers. Kurtosis asks the same kind of question — how far from a
> normal distribution is this signal, in the direction of having occasional large spikes."
> Do NOT assume the phrase "fourth standardized moment" means anything to them.]`
> - **Crest factor** — peak over RMS. Same idea, cruder.
> - **Band energy at BPFO and its harmonics in the envelope spectrum** — the targeted one.
>
> **Then the model.** And here you have to be honest about which problem you actually have.
>
> **Framing A — supervised classification or remaining useful life regression.** You want to
> predict "this bearing has 340 hours left." To train this you need run-to-failure data:
> machines you instrumented and then allowed to fail, repeatedly, across the failure modes
> you care about.
>
> Ask yourself how many companies have deliberately destroyed a statistically useful number
> of their own machines. Essentially none. This is why the same handful of public datasets
> appear in every paper: NASA IMS, FEMTO/PRONOSTIA, Case Western, and C-MAPSS for turbofans.
>
> **Framing B — unsupervised anomaly detection.** Train only on data from the healthy
> machine. Learn what normal looks like. Alarm on deviation. Autoencoder reconstruction
> error, one-class SVM, isolation forest, or honestly just a control chart on kurtosis.
>
> **Framing B is what actually gets deployed**, because it only needs healthy data, and
> healthy data is the only thing you have a lot of.

## 2.7 Why these projects fail

`[Slide: five failure modes. Spend real time here — this is the part they will not get from a textbook.]`

> I want to spend the rest of this section on why predictive maintenance projects fail,
> because the success stories are all in the vendor brochures and the failures are where the
> engineering is.

> **One. You have no labels.** Not "few." None. A plant with a thousand motors over five
> years might have a dozen documented bearing failures with usable vibration data around
> them. Your positive class has twelve examples. No amount of model architecture fixes that.
> This is why the honest answer is anomaly detection.

> **Two. Models do not transfer.** A model trained on motor A does not work on motor B. The
> mounting stiffness is different, so the resonance is at a different frequency. The load is
> different. The sensor is mounted in a different orientation. This is domain shift, and it
> is brutal here. Notice that the *physics* transfers perfectly — BPFO is BPFO — but the
> learned model does not. Another argument for physics-derived features.

> **Three. Sensor drift.** Your accelerometer's sensitivity changes with temperature and
> with age. Mounting resonance changes if the stud loosens. Your model sees a distribution
> shift and reports the machine is degrading. The machine is fine. **The sensor is
> degrading.** In practice a large fraction of anomaly alerts are instrumentation faults, not
> process faults. You have to monitor your monitoring.

> **Four, and this is the one that kills deployments: alarm fatigue.**
>
> `[Do the arithmetic on the board or the slide. Make them watch the number.]`
>
> Suppose you monitor 500 assets. Your model has a one percent false positive rate per asset
> per day. That sounds excellent. That is five false alarms per day.
>
> Each one requires an engineer to investigate: pull the trend, maybe schedule an inspection.
> Call it three hours. That is fifteen hours a day of investigation, and four days out of
> five the machine is fine.
>
> The guidance in process industries, from EEMUA 191, is that an operator can handle roughly
> one alarm every ten minutes in steady state, across *all* alarm sources. Your analytics
> system is competing for that budget with every process alarm in the plant.
>
> Here is what actually happens. By week three, the engineers have learned that the system
> cries wolf. They stop opening the tickets. Six months later a real failure is flagged, and
> ignored, and the machine fails. The project is cancelled, and the postmortem says "the
> model was not accurate enough." The model was fine. **The threshold was set by a data
> scientist optimizing F1 score instead of by an engineer costing out consequences.**

> **Five. Nobody set the threshold economically.**
>
> The right way to set it: let C_FP be the cost of an unnecessary inspection, and C_FN the
> cost of an unplanned failure. You should raise an alarm when the expected cost of not
> acting exceeds the cost of acting, which gives you a probability threshold of roughly
>
> ```
> P* = C_FP / (C_FP + C_FN)
> ```
>
> Concretely: inspection costs two thousand dollars, unplanned failure of that machine costs
> two hundred thousand in lost production. Then P* is about one percent. You *should* be
> alarming at one percent confidence and accepting many false positives.
>
> But that is only correct if you have the inspection capacity to absorb them. If you do not,
> the real constraint is not statistical, it is how many investigations your team can do per
> week. **Which means the threshold is a capacity planning decision, not a modelling
> decision.** I have watched this exact argument play out in fraud detection at banks. It is
> the same mathematics and the same organizational failure.

## 2.8 Control, briefly (2.5 min)

`[Digital twins used to live here. They are now Part 4 — do not preview them, you will spend
eleven minutes on them shortly. Keep this to control only.]`

> You have all learned PID. Where does AI go?
>
> Mostly, it does not go inside the loop. The workhorse for hard multivariable, constrained
> control is **model predictive control**, MPC, standard in refineries since the 1980s. It
> solves a constrained optimization at every step over a prediction horizon, and it handles
> what PID cannot: interacting variables, hard constraints, dead time. MPC is not machine
> learning — though its internal model can be learned.
>
> `[Strong anchor. VR20 Computer Control of Processes (Sem VII, core) devotes Unit IV to MPC:
> block diagram, objective functions, finite step and impulse response models, Dynamic Matrix
> Control. Say: "MPC is coming in Computer Control of Processes — that course is teaching you
> the thing that actually runs." Note it lands in Sem VII, so a third-year room has not met it.]`
>
> `[Also worth planting one sentence for Part 4: MPC needs an internal model of the process to
> predict forward with. Hold that thought — we come back to it when we ask what a twin is for.]`
>
> Reinforcement learning gets a great deal of press. Be careful. RL learns by trying things.
> In a live process, "trying things" means potentially driving a reactor somewhere it should
> not go. The well-known success is Google's data centre cooling, and note how: advisory mode
> first, hard constraints, operator override at any time. A supervisory optimizer choosing
> setpoints, not a controller moving valves.
>
> The honest state of the art: **RL sets targets, conventional control hits them.**
>
> `[VR20: neural networks appear in two ELECTIVES only — Intelligent Systems and Control
> (PE4) as controllers and for system identification, and AI/ML in Healthcare (OE2), the only
> place anyone meets ML properly. Assume a minority. Neither teaches ML on a signal the student
> measured themselves. Ask for hands rather than guessing.]`

## 2.9 The thing I most want you to remember

`[Slide: SIL. Dark slide. Slow down completely.]`

> If you take one thing from this hour, take this one.
>
> Safety functions in process plants are governed by IEC 61508 and IEC 61511. A safety
> instrumented system — the thing that shuts the plant down when a vessel over-pressurizes —
> is assigned a **Safety Integrity Level**, SIL 1 through 4. SIL is a statement about
> probability of failure on demand. SIL 3, for example, means a probability of dangerous
> failure on demand between one in a thousand and one in ten thousand.
>
> To claim a SIL rating you must be able to demonstrate that failure rate, with evidence,
> through the whole lifecycle.
>
> **You cannot do that for a neural network.** Not because it performs badly. Because you
> cannot enumerate its failure modes, you cannot bound its behaviour on inputs you have not
> tested, and its behaviour changes if you retrain it.
>
> So the architecture is: the safety instrumented system is separate, simple, deterministic,
> independently verified, and it has final authority. The AI advises the layer above it. If
> the AI is wrong, the SIS still trips.
>
> `[Pause.]`
>
> This is not AI pessimism. This is what mature safety engineering looks like, and the AI
> industry is slowly rediscovering it under the name "guardrails." You already have a
> discipline that solved this. Do not let anyone talk you out of it.
>
> The security equivalent is **IEC 62443**, which governs industrial network security. Same
> instinct: data flows up freely, commands flow down through very few, very controlled
> paths. When someone proposes a cloud AI service that writes setpoints directly to a PLC,
> that is the conversation you need to have.

---

# PART 3 — Demo one: Bearing Fault Lab (0:31 – 0:37)

`[Open kiranic.com/lecture/bearing-lab.html — or the local copy of bearing-lab.html, which
is a single file and runs with no internet at all. Have it open in a second tab before you
start. Do not rely on venue WiFi; keep the local file as your fallback.]`

## 3.1 Orientation (45 sec)

> This is a simulation, not real data, but every number in it is computed from the equations
> we just derived. It runs entirely in the browser and I will share the file, so you can
> take it apart afterwards.
>
> Left: the bearing. Nine balls, defect on the outer race at twelve o'clock, flashing red
> each time a ball rolls over it. The orbit is slowed about seventeen times so you can see
> it. Right: three plots. Raw waveform, raw spectrum, envelope spectrum.

## 3.2 Healthy baseline (45 sec)

`[Click "Healthy".]`

> Severity zero. Look at the raw spectrum: one dominant line at 30 Hz, the shaft, plus
> harmonics. Textbook. Envelope spectrum at the bottom is grass. Nothing at 107 Hz.
> Kurtosis is low, the BPFO index sits around **0.3**, annunciator reads Normal.

## 3.3 Early defect — the key moment (2.5 min)

`[Click "Early defect". Severity 22%.]`

> Now there is a small spall. Watch the bearing: balls hitting the defect.
>
> **Look at the raw spectrum first.** `[Point at it.]` Tell me where the fault is.
>
> `[Genuinely wait for an answer. Let them fail to find it. This is the pedagogical moment
> of the whole lecture.]`
>
> You cannot see it. The shaft line dominates completely. There is a slight lift in the
> resonance band around 3 kHz, and if you did not know to look there you would not notice.
> This is what a real early-stage bearing fault looks like on a raw FFT. Invisible.
>
> **Now the envelope spectrum.** `[Point.]` There. A line at 107 Hz, and harmonics at 215
> and 322. Exactly where our geometry said it would be. The BPFO index at the bottom right
> has gone from about **0.3 to about 3**, and the annunciator has moved to Alert.
>
> Same data. Same measurement. The only difference is that we processed it in a way informed
> by the physics.

## 3.4 Change the speed (30 sec)  **CUT IF LONG**

`[Drag the RPM slider.]`

> Watch the BPFO marker move as I change shaft speed — and watch the peak track it exactly.
> It has to, because BPFO is proportional to shaft speed.
>
> That is also a practical warning. **If you do this on a variable speed drive, all your
> fault frequencies move.** A fixed-frequency alarm band is useless. You need the shaft speed
> as an input, which means you need a tachometer or you need to estimate speed from the
> signal. In practice you resample the signal against shaft angle instead of time. That is
> called order tracking, and it is the standard answer.

## 3.5 Advanced, then the honest one (2.5 min)

`[Click "Advanced".]`

> Severity 78. Now it is obvious everywhere — visible in the raw waveform as periodic spikes,
> crest factor up, and the index around **7 to 8**. Fault lamp.
>
> But notice: by the time it is this obvious, you have lost most of your warning time. The
> value of the envelope method is entirely in the early case we just looked at.

`[Click "Noisy plant".]`

> Last one, and this is the honest one. Same 22% defect as the early case — I have changed
> nothing about the bearing. All I have done is raise the plant noise and the shaft imbalance.
>
> `[Let them look at the index before you say the next part.]`
>
> The index has fallen from about 3 to about **1.6**, and look at the annunciator. It has gone
> back to **Normal.**
>
> The defect is still there. It has not improved. Our detector has simply stopped seeing it.
> The alert threshold in this tool sits at 1.8, and on this setting the reading creeps above
> it maybe one time in eight — so the same fault that was caught every single time in a quiet
> plant is now missed on most measurements.
>
> **That is a missed detection, and nobody gets told.** A false alarm is annoying and visible.
> A missed detection is silent, and you only find out when the bearing fails. Everything in
> the previous section — thresholds, alarm fatigue, the cost function — is about choosing
> which of those two errors you would rather have, because you do not get to avoid both.

---

# PART 4 — Digital twins (0:37 – 0:48)

`[This is the part the title sold. Eleven minutes, named on the agenda, with the second demo
inside it. Do not apologise for being sceptical — scepticism delivered with a working demo is
the most credible position in the room.]`

## 4.1 What the word is supposed to mean (2 min)

> The title of this talk promises digital twins, so let us be precise about what one is, because
> the term is abused harder than almost anything else in industrial software.
>
> A digital twin is **a model of a physical asset that is kept current by that asset's own data,
> and that you can ask questions of.** Two conditions. Kept current — otherwise it is a
> simulation you built once. And you can ask it questions — otherwise it is a dashboard.
>
> Here is the taxonomy that lets you cut through a vendor pitch. Three levels.
>
> 1. **Physics model.** First principles — differential equations, finite element, kinematics.
>    Accurate exactly where your equations are right. Slow, and it needs someone who understands
>    the machine.
> 2. **Data-driven surrogate.** A model trained to mimic the plant's behaviour from its history.
>    Fast, and it interpolates well. It extrapolates terribly. Hold that thought.
> 3. **Hybrid.** A physics model whose parameters are continuously re-estimated from live data.
>    The interesting one, and by far the hardest to build.
>
> `[Anchor to Part 2 explicitly: "You already built a level-one twin this morning. When we
> derived BPFO from ball count and pitch diameter, we built a physics model of a bearing that
> predicts what the sensor will see. That is a twin component."]`

## 4.2 The vendor test (1 min)

`[Slide: the test, large. Tell them to write this one down.]`

> If you take one sentence from this part, take this one. When somebody shows you a digital
> twin, ask:
>
> **What does your twin predict that a human could not — and how was that prediction validated?**
>
> If there is no answer to the first half, it is a visualization. If there is no answer to the
> second half, it is a guess with good graphics.
>
> A 3D model on a screen with live sensor values painted on it fails both. It may be a genuinely
> useful thing to have. It is not a twin, because it cannot answer "what happens if I raise the
> feed rate ten percent."

## 4.2b Twin or Dashboard — the room game (1 min)

`[Switch tabs to kiranic.com/lecture/twin-or-dashboard.html — press F for full-screen.
This is the highest-energy 60 seconds in the talk. Do not skip it.]`

> Now let us try that on some real-looking screens. I am going to show you five vendor
> mockups. Some are twins. Some are dashboards with the word "twin" printed on them. When
> the screen goes up, everybody shouts — TWIN, or DASHBOARD. Louder is fine.

`[Space bar to advance. Five rounds, ~10 seconds each. Wait for the room to commit before
you press Reveal — the game only works if they call it out. Answers, in order:
DASHBOARD (turbine viz), DASHBOARD (SCADA), TWIN (MPC preview), DASHBOARD (enterprise
marketing screen), TWIN (your own bearing model).]`

> Two twins, three dashboards. In a real vendor pitch it is more like one in twenty. The
> test is your line: **what does it predict that a human could not, and how was that
> prediction validated.** Say it out loud in the meeting.

## 4.3 The extrapolation trap (3 min)

`[Slow down. This is the intellectual core of the part and the thing that will still be true in
ten years when today's tools are gone.]`

> Now the hard part, and this is the reason I am sceptical rather than enthusiastic.
>
> Level two, the data-driven surrogate, is what almost everybody actually builds, because it is
> the cheapest. You take five years of historian data, you train a model to reproduce the plant's
> behaviour, and it works beautifully.
>
> Ask yourself what is in those five years of data.
>
> `[Wait. Let someone answer.]`
>
> Normal operation. Overwhelmingly, almost entirely, normal operation. A plant that runs well
> generates data about running well. If it failed often enough to give you a rich failure
> dataset, it would not be a plant, it would be a scrapyard.
>
> So your surrogate has learned the mapping from inputs to outputs **in the region where the
> machine is healthy.** Inside that region it interpolates, and interpolation is what these
> models are good at.
>
> And now the sentence I want you to leave with:
>
> **A fault is, by definition, the machine leaving that region.** A fault is extrapolation. It
> is the machine doing something it has not done before. That is what the word means.
>
> So the model is excellent everywhere except the one place you bought it for. It will predict
> a normal Tuesday to four decimal places and tell you nothing whatsoever about the event you
> actually wanted warning of.

`[The kicker. Deliver this separately, it is the part that surprises people.]`

> And here is why this trap is so hard to see from the inside. **Your validation set is also
> normal.** You hold out twenty percent of five years of healthy data, you test on it, your R²
> comes back at 0.99, and every number on your dashboard says the model is excellent.
>
> The metric that tells you it works is computed on the data that cannot tell you it works.
>
> That is not a bug in anyone's code. It is structural, and no amount of model architecture
> fixes it.

## 4.4 So look at one honestly — demo two (3 min)

`[Open kiranic.com/lecture/live-monitor.html, which should have been running since Part 1 and
will now have 40+ simulated days of trend on it. Frame it AS A TWIN from the first sentence —
this is not a second condition-monitoring demo, it is the worked example for this part.]`

> Let me show you a twin and hold it to my own test.
>
> This is four motors on a plant clock. And it is a twin — a level one, physics-model twin.
> There is no training data anywhere in it. It runs the bearing model we derived in Part 2
> forward in time: ball count and pitch diameter give BPFO, the impacts ring the housing
> resonance, the spall grows, and it computes what the accelerometer would see. Every point on
> that chart came out of the physics, not out of a table.
>
> **Now apply my own test to it.** What does it predict that a human could not?
>
> `[Point at the projection box.]`
>
> That. It says days-to-fault for MTR-402. That is a falsifiable claim about the future, and it
> is checkable — you wait, and you see whether the machine failed when it said.
>
> And how well does it do? Watch it. Early on it is confidently wrong, swinging between numbers
> from one reading to the next. It only settles once the trend is well established — by which
> point you had already worked it out from the chart.
>
> I left it crude deliberately. That is the honest state of most remaining-life numbers in the
> field, and I would rather you distrust them for the right reason than trust them for the
> wrong one.

`[Now the threshold slider — same demonstration as before, but framed as what you DO with a
twin's output rather than as a condition-monitoring aside.]`

> One more thing, because a prediction is only worth what you do with it. Watch both counters.
>
> **Threshold down to 2.** Forty days of warning — and the false alarm count climbs, because
> healthy machines take knocks and those knocks ring the same resonance.
>
> **Threshold up to 8.** False alarms stop. Warning collapses to about twenty days.
>
> No setting gives you both. Your twin can be perfect and you still have to make this decision.

## 4.5 I hit this wall in my own house (2 min)

`[Personal anchor. Deliver as yourself. This is the most credible thirty seconds in the talk
because it is the only place you have done the thing rather than described it.]`

> I should tell you that I am building one of these, badly, and I hit exactly this wall.
>
> I have a Raspberry Pi at home reading light, motion, temperature and proximity sensors, driving
> the automation for the house. Sensors, a controller, actuators — that is instrumentation, at
> domestic scale. And I am exploring a data-driven surrogate on the history it produces.
>
> Which means I have years of normal and not one failure. My model can tell you what my hallway
> does on an ordinary Wednesday evening with real precision. It cannot tell me anything about
> the pump that is about to seize, because it has never seen a pump seize.
>
> Same wall. Same wall the vendors do not mention in the brochure.

`[The turn. Do not end on the problem — end on the response, and connect it back to §2.6.]`

> So what is the honest response? It is not a better surrogate. It is to stop trying to model
> the fault at all.
>
> Model **normal**. Learn what healthy looks like, in detail, from the data you actually have —
> which is all healthy. Then measure distance from it, and alarm on the distance.
>
> You do not need to have seen a failure to know that today does not look like any day you have
> seen before. That is Framing B from earlier, and this is why it wins: it is the framing that
> matches the data that exists rather than the data you wish you had.
>
> A twin that says "this is not normal, and here is which sensor is furthest out" is worth more
> than one that claims to predict a failure mode it has never observed.

# Hosting both demos on your own site

Both files are single self-contained HTML documents. No build step, no framework, no CDN, no
external fonts, no network calls of any kind.

- Both are live at **kiranic.com/lecture**, with `kiranic.com/lecture/bearing-lab.html` and
  `kiranic.com/lecture/live-monitor.html` served standalone.
- They work from `file://` too, so a USB stick is a valid backup if the venue WiFi fails.
- They can be embedded in an existing page with `<iframe src="live-monitor.html" width="100%"
  height="900" style="border:0"></iframe>`.
- Both are responsive and will reflow on a phone, so a QR code to them is a reasonable way to
  let students take the demo away. Be aware that the live monitor computes four FFTs a second,
  so on an old phone it will run warm and a little slow. The bearing lab is much lighter.
- No analytics, no storage, no cookies. Nothing to disclose to anyone.

`[Practical: put a short URL or QR on the closing slide. The single highest-value thing a
student can leave with is a copy of the simulator they can pull apart.]`

---

# PART 5 — What to actually do (0:48 – 0:54)

## 5.1 What to learn, in order

`[Slide: a list they can photograph. Say explicitly that they should photograph it.]`

> **Take a photo of this slide.** This list is built specifically against your VR20 syllabus.
> I have left out everything you already get.
>
> **1. Statistics. This is the biggest hole in your degree.** There is no probability or
> statistics course anywhere in your eight semesters. You get one topic on measurement error
> in Sensors and Transducers, and that is it. Every single thing in the second half of this
> talk — thresholds, false positive rates, whether a model is any good — is statistics. Fix
> this yourself. Distributions, estimation, hypothesis testing, and then precision, recall
> and ROC. This is the highest-return forty hours available to you.
>
> **2. The scientific Python stack — not Python itself.** You already have Python from
> Semester II, which puts you ahead of where I expected. What you do not have is `numpy`,
> `scipy.signal`, `pandas`, `matplotlib` and `scikit-learn`. Your Python course is object
> oriented programming; this is numerical computing, and it is a different skill. `scipy.signal`
> does everything in today's demo in about fifteen lines.
>
> **3. Signal processing beyond your DSP course.** DSP is two credits and Signals and Systems
> was removed from your regulation. That course gives you the FFT and filter design, which is
> the foundation — but the Hilbert transform, the analytic signal, and envelope detection are
> not in it, and those are what today's example ran on. This is your unfair advantage over
> every computer science graduate applying for the same job. They cannot derive BPFO. You can.
>
> **4. One time-series database.** InfluxDB or TimescaleDB. Learn what a downsampling policy
> is and why retention matters.
>
> **5. OPC UA.** Not in your syllabus at all — I checked, zero mentions. Read the information
> model concept and play with the Python `asyncua` library. Very few people under thirty
> understand OPC UA, and it is a real differentiator.
>
> **6. Classical machine learning before deep learning.** Isolation forest, one-class SVM,
> PCA, gradient boosting. Note this only exists in your syllabus inside one elective, and that
> one is framed entirely around healthcare.

## 5.2 Choose your electives deliberately

`[Slide: elective map. This is specific to VR20 and it is the most actionable thing you can
give them. Thirty seconds, then move.]`

> One more thing, and this one is worth money to you. Your regulation gives you five program
> electives and four open electives. Most people pick them by timetable convenience. If you
> want the career I have been describing, these are the ones that compound:
>
> - **Safety Instrumentation Systems** (Open Elective 2, Semester VI) — this covers IEC 61508
>   and the protection-layer model. It is the single most employable elective in your list and
>   almost nobody picks it. Everything on my SIL slide is in that course.
> - **Industrial Internet of Things** (Program Elective 3) — historians, industrial protocols,
>   the SCADA to ERP data flow. This is the layer above the one your core courses reach.
> - **Real World Instrumentation with Python** (Program Elective 5) — instrument systems,
>   simulators and data I/O in Python. It is the bridge between your Semester II Python and
>   actual instrumentation work.
> - **AI and Machine Learning in Healthcare** (Open Elective 2) — the only real ML in your
>   syllabus. The healthcare framing is incidental; the methods transfer directly.
>
> Note that Safety Instrumentation Systems and AI/ML in Healthcare are both Open Elective 2,
> so you must choose. If you are asking me: take the safety one, and learn the ML yourself.
> The safety material is much harder to self-teach and much harder to fake in an interview.

## 5.3 A project you can start this week

`[Slide: the project.]`

> Concretely, do this. It is free and it is more valuable than another certificate.
>
> Download the **Case Western Reserve bearing dataset.** It is public, it is the standard
> benchmark, and it is the exact 6205 bearing from today. Then:
>
> 1. Reproduce today's demo on real data. Compute the envelope spectrum. Confirm the peak
>    lands at the BPFO you calculate from geometry. When it does, you have verified theory
>    against measurement, which is the actual job.
> 2. Build a detector trained **only on the healthy files.** Anomaly detection, not
>    classification.
> 3. Then do the part almost nobody does: **report your false positive rate honestly, and
>    argue for a threshold using a cost model you state explicitly.**
>
> If you do step three, you will be able to have a conversation in an interview that most
> candidates with a master's degree cannot have. I mean that seriously.
>
> If you want more: NASA IMS and FEMTO/PRONOSTIA for run-to-failure data, C-MAPSS for
> turbofan remaining useful life.

## 5.4 The career part, honestly (2 min)

`[Slide: dark, minimal.]`

> Two minutes, and I promised to be straight with you.
>
> `[TRIMMED to fund Part 4. Do not extend this. If you are running late, the paragraph about
> your own path is the cut — the job-titles point and the closing three sentences are not.]`
>
> **The job title "AI engineer" is mostly not where these jobs are.** The roles that actually
> exist are: controls or instrumentation engineer who can also code. Reliability engineer who
> understands statistics. Data engineer who understands process. Solutions architect who can
> talk to both the plant and the IT department.
>
> The scarce skill is not the model. Models are commoditized and getting more so every month.
> **The scarce skill is the person who understands the physical process and the software.**
> That person is nearly impossible to hire. You are two years from being that person, and
> most of you do not realize it is valuable.
>
> On my own path, since I promised. I did not plan it. I spent thirteen years getting deep in
> one unglamorous domain — how large regulated institutions move information around. Then the
> tooling changed, and it turned out that domain knowledge plus new tooling was worth more
> than either alone. I am now doing AI architecture, and the thing that makes me useful is
> not that I learned about transformers. It is that I know what a bank's document workflow
> actually looks like at 2 a.m. when it breaks.
>
> The mistake I made, and I would rather you not repeat it, is that I waited too long to
> learn the new tooling. I assumed depth in the old thing was enough. It was not, and the
> people who moved earlier had a much easier transition than I did.
>
> So: get deep in something real. EIE is something real. Then learn the tools relentlessly,
> starting now, not in year five. Depth plus current tooling is a very strong position.
> Either one alone is not.
>
> Thank you. Questions, including the hostile ones.

---

# PART 6 — Q&A (0:54 – 1:00)

## Prepared answers

**"Will AI replace instrumentation engineers?"**
> No, and the reason is specific rather than reassuring. Someone has to decide where the
> sensor goes, whether the measurement is trustworthy, and what happens when it is wrong.
> Those are physical and accountability questions. What will change is that an engineer who
> cannot work with data will be at a real disadvantage against one who can.

**"Why not just use deep learning on the raw signal?"**
> You can, and there is real published work doing exactly that. Two problems. You need far
> more labelled failure data than anyone has, and you cannot explain the result to a
> maintenance manager who has to authorize a shutdown. Physics-derived features get you most
> of the performance with a fraction of the data and full explainability. If you had a
> million labelled failures, the tradeoff might change.

**"Is my institute's curriculum outdated?"**
> The signal processing and control theory are not outdated, and they are the hard part.
> What is usually missing is the software and data engineering layer. That gap is one you
> can close yourself with the project I described, which is roughly forty hours of work.

**"How much maths do I need?"**
> Linear algebra and probability, solidly. Enough calculus to follow an optimization. You do
> not need measure theory. You do need to genuinely understand what a covariance matrix is
> and what a p-value does and does not tell you.

**"Is a digital twin worth building for a small plant?"**
> Ask what decision it would change. If nobody would act differently on its output, the answer
> is no regardless of cost. If there is a decision — when to take a machine down, whether to run
> another month — then start with the cheapest thing that informs that decision, which is almost
> never a twin. It is usually a trend on three well-placed sensors. Build the twin when the trend
> stops being enough to answer the question.

**"You were quite negative about digital twins."**
> `[Expect this one. Answer it squarely rather than softening.]`
> I was negative about one specific and very common failure: training a surrogate on healthy
> data and claiming it predicts faults. I am not negative about physics-model twins, which are
> genuinely useful and which several of you will build. The demo I showed you is one, and it
> works. The distinction is whether the model knows the mechanism or has only seen the history.

**"What about LLMs in industry?"**
> Different job. They are useful for unstructured text — maintenance logs, operator shift
> notes, standards documents, procedure generation. There is real value in searching thirty
> years of handwritten maintenance records. They are not useful for a vibration signal, and
> anyone selling you an LLM to do condition monitoring is confused about what the tool is.

**"You said you have not worked in a plant. Why should we listen to you?"**
> `[Take this one head on. If nobody asks it, it is still in the room.]`
> For the parts I derived from first principles — the bearing kinematics, the signal
> processing — you should check my arithmetic, and you can, because I showed you all of it.
> For the parts about why projects fail organizationally, I have watched that happen many
> times in a different regulated industry, and the pattern is the same. For anything specific
> about commissioning or operating a plant, ask someone else, and I will say so if it comes
> up.

**If a question stumps you:**
> "I do not know. That is outside what I have actually done." Then move on. Do not
> improvise. In a room of engineers this raises your credibility rather than lowering it.

---

# Appendix — one-page cheat sheet

| Quantity | Formula | 6205 @ 1797 rpm |
|---|---|---|
| Shaft | f_r = rpm / 60 | 29.95 Hz |
| Cage | FTF = (f_r/2)(1 − (d/D)cos θ) | 11.93 Hz |
| Outer race | BPFO = (n/2)·f_r·(1 − (d/D)cos θ) | 107.4 Hz |
| Inner race | BPFI = (n/2)·f_r·(1 + (d/D)cos θ) | 162.2 Hz |
| Ball spin | BSF = (D/2d)·f_r·(1 − ((d/D)cos θ)²) | 70.6 Hz |

Note on BSF: a spall on a ball strikes the inner and outer race once each per ball
revolution, so the line you actually observe is usually **2 × BSF = 141.2 Hz**. Published
tables, including the Case Western one, tabulate that doubled value — which is why their
"BSF" multiplier reads 4.7135 rather than 2.3567. Check which convention a table is using
before you go hunting for a peak. The other four multipliers here match the Case Western
published values exactly (FTF 0.3983, BPFO 3.5848, BPFI 5.4152).

**Fault signatures in the envelope spectrum**

- **Outer race** — clean line at BPFO plus harmonics, no sidebands. The defect is at a fixed
  position in the load zone, so every impact is equal. Easiest to detect.
- **Inner race** — BPFI with sidebands spaced at ±f_r, because the defect orbits through the
  load zone once per shaft revolution.
- **Rolling element** — BSF with sidebands at the cage rate FTF.

**Numbers worth remembering**

- Edge inference: 1–50 ms. Actuator response: tens of ms. AI-in-loop: tens of ms, not µs.
- PLC scan cycle: 10–100 ms, deterministic.
- Bearing resonance band: typically 2–15 kHz.
- Frequency resolution = 1 / record length.
- EEMUA 191 steady-state alarm guidance: roughly 1 alarm per 10 minutes per operator.
- Alarm threshold: P* ≈ C_FP / (C_FP + C_FN), capped by inspection capacity.

**Standards to know by name**

IEC 61508 / 61511 (functional safety, SIL) · IEC 62443 (OT security) ·
ISO 10816 / 20816 (vibration severity) · EEMUA 191 (alarm management) ·
OPC UA (IEC 62541) · Purdue model / ISA-95

---

# Appendix B — Mapping against the VR20 syllabus

Checked line by line against the VR20 EIE scheme (effective 2020-21). This determines what
you can lean on and what you must build from scratch.

## Safe to assume (core courses, everyone has them)

| Lecture content | Their course | Semester |
|---|---|---|
| Python syntax, OOP | Object Oriented Programming using Python (+ lab) | II |
| Sampling theorem, aliasing | Digital Signal Processing, Unit I | VI |
| FFT, DFT properties | Digital Signal Processing, Unit II | VI |
| Band-pass filter design (Butterworth, Chebyshev, windowed FIR) | Digital Signal Processing, CO3/CO4 | VI |
| Measurement error, statistical treatment, curve fitting | Sensors and Transducers, Unit I | III |
| Sensor characteristics, transducer types | Sensors and Transducers | III |
| PID, control loops | Control Systems (+ lab) | IV |
| Process dynamics, final control elements | Process Control (+ lab) | V |
| PLC, DCS, SCADA | Industrial Automation (+ lab) | VI |
| MPC | Computer Control of Processes, Unit IV | VII |
| LabVIEW | Virtual Instrumentation (skill course) | IV |

## Absent from the entire syllabus — build from scratch

- **Hilbert transform / analytic signal / envelope detection** — zero mentions. The core of Part 2.
- **Amplitude modulation and demodulation** — zero mentions. There is no communications course.
  Do not use "you know this from AM" as a shortcut; it was true under VR14 and is not true now.
- **Probability and statistics** — no course. The only "probability" is aptitude-test material
  in a soft-skills module.
- **Kurtosis, higher-order statistics** — zero.
- **Vibration analysis, condition monitoring, bearings, predictive maintenance** — zero.
- **Modbus, OPC UA, MQTT / Sparkplug** — zero. "OPC" does not appear.
- **Purdue model** by name, historians in core, time-series databases — zero in core.
- **Digital twin, anomaly detection, reinforcement learning** — zero.

## Elective-only — ask for a show of hands, do not assume

| Lecture content | Elective | Slot |
|---|---|---|
| IEC 61508, protection layers, safety vs control | Safety Instrumentation Systems | OE2, Sem VI |
| Historian, industrial protocols, SCADA→ERP/MES flow | Industrial Internet of Things | PE3, Sem VII |
| Machine learning, UCI datasets, model selection | AI and Machine Learning in Healthcare | OE2, Sem VI |
| HART, PROFIBUS, fieldbus | Industrial Communication Networks | PE2, Sem VI |
| Neural networks as controllers | Intelligent Systems and Control | PE4, Sem VII |
| SCADA and HMI in depth | HMI & SCADA | PE5, Sem VII |
| Python for instrument systems and data I/O | Real World Instrumentation with Python | PE5, Sem VII |

## Two structural changes from VR14 worth knowing

1. **Signals and Systems was removed.** Under VR14 students had a 3-credit Signals and Systems
   course in Semester IV *plus* 3-credit DSP in Semester V. Under VR20 there is a single
   2-credit DSP course in Semester VI carrying sampling, Z-transform, FFT and filter design.
   Their frequency-domain foundation is materially thinner than it was, which is exactly why
   the envelope section needs building from the ground up.

2. **Industrial Communication Networks moved from core to elective.** You cannot assume HART
   or PROFIBUS any more.

## Delivery consequences

- Budget **four minutes** to build the analytic signal from scratch. It is not optional.
- Do not say "fourth standardized moment" without unpacking it.
- Anchor the band-pass step to their DSP filter design — it is the strongest anchor available.
- Anchor the SIL section to Safety Instrumentation Systems, but ask who took it first.
- If the room is pre-Semester VI, add five minutes on what the FFT does before Part 2.
