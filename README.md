# Rishabh Aryan · Academic CV website

**Live:** https://rishabh-bgp.github.io/

Source for the academic CV website of **Rishabh Aryan**: AI/ML researcher, M.Tech (Artificial Intelligence and Data Science), Department of Computer Science and Engineering, Indian Institute of Information Technology, Bhagalpur.

- Static HTML, CSS and vanilla JavaScript served by GitHub Pages from `main`: no build step, no frameworks, no CDN (apart from the YouTube IFrame API for the soundtrack, which never plays without a tap; fonts are self-hosted in `assets/fonts/`).
- **Interactive 3D research theatre** (`engine3d.js`, pure Canvas 2D projection): drag-to-orbit with inertia, pinch / Ctrl+wheel / ± zoom, keyboard control, and four modes: Radar Globe, Neural Lattice (animated signal pulses), Quantum Bloch (precessing state vector with trail) and EEG Wave 3D. Six clickable research nodes filter the publications archive. A perspective tactical grid and particle field sits behind the hero with pointer parallax.
- **Fleet & Arsenal 3D models** in the same engine: flat-shaded, depth-sorted meshes of a MiG-21 / Su-27 interceptor (twin fins, afterburner rings, contrails, barrel roll), a T-72 / T-34 main battle tank (rotating turret, animated tracks, reactive armour, radar target lock), a Typhoon / Akula submarine (double hull, spinning shrouded propellers, 3D sonar rings) and an AK-47 (chamber-round action), each with clickable telemetry hotspots and a live HUD readout. The **Fleet & Arsenal // Red Army Units** strip maps each unit to one pillar of the CV: jet = wind & quantum forecasting, tank = scam, threat & control defense, submarine = deep-signal & biomedical AI, AK-47 = patents, IP & agentic stack. Each hotspot names a real thesis, paper, patent or project, a second click on a locked hotspot filters the archive to it, and "Filter matching CV entries" filters the archive to the whole domain. A Fleet & Arsenal strip with vector unit badges and a radar-horizon patrol band switches between them.
- **Mission Map** (`> MISSION_MAP // ACADEMIC & RESEARCH BASES`): a schematic SVG tactical map of India with a radar sweep and animated comms arcs from IIIT Bhagalpur to each verified academic, training and industry base (IIT Jammu, IIT Ropar × NIELIT Ropar, DIT University, Maharaja Agrasen Himalayan Garhwal University, MATS University, Automated Pixel Marketing LLP). Pins and chips open a Base Intel panel with jump links to Education / Experience / Publications. Hidden in print.
- **Teaching dossier** (`> TEACHING_DOSSIER // COURSES I CAN TEACH & LAB BLUEPRINT`): six expandable course cards (syllabus topics, a hands-on lab and the open-source repos it builds on) plus a Mentoring & Lab Readiness strip; printed as a compact "Teaching Readiness & Courses" section. It is a teaching plan, not a record of past teaching.
- **URSA // Red Bear**: a fifth Red Army unit (low-poly armoured bear with ushanka and red star) mapped to the agentic AI stack and multi-agent research, with a ROAR // DEPLOY SWARM shockwave action.
- **Academic Mode** (`◐ Academic` button in the header, the command palette, or `academic` in the terminal): a clean, scholarly view that hides the 3D theatre, arsenal, patrol band, Mission Map, terminal, games, soundtrack and HUD tags, pauses the audio and the 3D render loop, and swaps in a formal headshot (`assets/avatar-academic.jpg`) and a calm light/dark palette. An **Academic Spotlight** sits under the hero with three pillars: IEEE and peer-reviewed conference papers, the four SSRN / Zenodo preprints with DOI links, and the open-source research code, each with filters into the archive. Open it directly with `?mode=academic` or `#academic`; the choice is remembered, and **Tactical** restores everything. The printed CV always uses the formal headshot.
- **Mini-games** (Easter egg, hidden in print): DEFCON // RADAR INTERCEPT and T-72 ARTILLERY // ML DIAGNOSTIC RANGE in one modal, launched from the terminal (`play`, `tank`), the command palette or the game buttons; mouse, touch and keyboard, 45-second rounds, local high scores and a debrief card.
- **Soundtrack**: the header play button streams "Soviet Union edit, but its fits the beat perfectly (full version)" by Fix_37 ([YouTube](https://www.youtube.com/watch?v=UKrA8hv8dvE)) through the official YouTube IFrame Player API (never autoplayed; play/pause and volume are wired to `playVideo` / `pauseVideo` / `setVolume`, it pauses when the tab is hidden, and a link opens the track on YouTube if embeds are blocked). Quiet Web Audio UI blips play only while the soundtrack is on. Also available as `audio` in the terminal and the command palette.
- 3D tilt with holographic sheen on the portrait, KPI tiles and tool cards, and a 3D flip showcase of eight flagship research pillars.
- Publications archive (58 entries, 47 lead-author): clickable year / category / authorship / theme analytics that cross-filter the list, category pills, a lead-author toggle, year filter, keyword search, and one-click citation and BibTeX copy on every entry.
- Command palette (Ctrl/⌘+K) for fuzzy search across sections, degrees, publications, patents and quick actions; tactical terminal console (`whoami`, `stats --all`, `ls patents`, `stack --ai`, `contact`, …).
- Scroll-progress HUD, scroll-spy, scroll-reveal and count-up KPIs; every animation respects `prefers-reduced-motion`.
- Education entries list each institution's accreditations and statutory recognitions, verified from official university, UGC/AIU and Government of India sources.
- **Print / Save PDF** produces a formal black-on-white academic CV via `@media print` (3D canvases, terminal, palette and HUD controls are hidden).
- SEO: meta description, Open Graph, Twitter card and JSON-LD `Person` schema, `sitemap.xml`, `robots.txt`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The CV page (content and structured data) |
| `style.css` | Theme, responsive layout and print stylesheet |
| `app.js` | Theme, HUD, reveal, publications engine, citations, command palette, terminal, flip cards |
| `engine3d.js` | Self-contained 3D engine (4 research modes + 4 fleet/arsenal models), patrol band, background field and tilt effects |
| `audio.js` | Procedural Web Audio soundtrack and interface sound effects |
| `assets/` | Portraits (tactical `avatar.jpg`, formal `avatar-academic.jpg`), favicon, self-hosted fonts and agentic-tool logos |

## Other repositories by Rishabh Aryan

- [Rishabh-bgp](https://github.com/Rishabh-bgp/Rishabh-bgp) — GitHub profile README and `publications.csv`
- [brain-tumor-mri-classification](https://github.com/Rishabh-bgp/brain-tumor-mri-classification) — leakage-aware, explainable brain tumour MRI classification
- [beed-ml-study](https://github.com/Rishabh-bgp/beed-ml-study) — provenance audit of the Bangalore EEG Epilepsy Dataset
- [pan-cancer-classification](https://github.com/Rishabh-bgp/pan-cancer-classification) — TCGA Pan-Cancer RNA-Seq tumour typing
- [responsible-ai-uci-adult](https://github.com/Rishabh-bgp/responsible-ai-uci-adult) — fairness and explainability audit on UCI Adult
- [spam-scan](https://github.com/Rishabh-bgp/spam-scan) — explainable spam and scam detection
- [cnn-bilstm-attention-benchmarking-indian-scada](https://github.com/Rishabh-bgp/cnn-bilstm-attention-benchmarking-indian-scada) and 13 more M.Tech thesis implementations — listed on the [profile](https://github.com/Rishabh-bgp)

© Rishabh Aryan. Content is personal CV information; please do not reuse the portrait.
