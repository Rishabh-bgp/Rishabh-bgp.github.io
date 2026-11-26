# Rishabh Aryan · Academic CV website

**Live:** https://rishabh-bgp.github.io/

Source for the academic CV website of **Rishabh Aryan**: AI/ML researcher, M.Tech (Artificial Intelligence and Data Science), Department of Computer Science and Engineering, Indian Institute of Information Technology, Bhagalpur.

- Static HTML, CSS and vanilla JavaScript served by GitHub Pages from `main`: no build step, no frameworks, no CDN (apart from the YouTube IFrame API for the soundtrack, which never plays without a tap; fonts are self-hosted in `assets/fonts/`).
- **Interactive 3D research theatre** (`engine3d.js`, pure Canvas 2D projection): drag-to-orbit with inertia, pinch / Ctrl+wheel / ± zoom, keyboard control, and four modes: Radar Globe, Neural Lattice (animated signal pulses), Quantum Bloch (precessing state vector with trail) and EEG Wave 3D. Six clickable research nodes filter the publications archive. A perspective tactical grid and particle field sits behind the hero with pointer parallax.
- **Fleet & Arsenal 3D models** in the same engine: flat-shaded, depth-sorted meshes of a MiG-21 / Su-27 interceptor (twin fins, afterburner rings, contrails, barrel roll), a T-72 / T-34 main battle tank (rotating turret, animated tracks, reactive armour, radar target lock), a Typhoon / Akula submarine (double hull, spinning shrouded propellers, 3D sonar rings) and an AK-47 (chamber-round action), each with clickable telemetry hotspots and a live HUD readout. The **Fleet & Arsenal // Red Army Units** strip maps each unit to one pillar of the CV: jet = wind & quantum forecasting, tank = scam, threat & control defense, submarine = deep-signal & biomedical AI, AK-47 = patents, IP & agentic stack. Each hotspot names a real thesis, paper, patent or project, a second click on a locked hotspot filters the archive to it, and "Filter matching CV entries" filters the archive to the whole domain. A Fleet & Arsenal strip with vector unit badges and a radar-horizon patrol band switches between them.
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
| `assets/` | Portrait, favicon, self-hosted fonts and agentic-tool logos |

## Other repositories by Rishabh Aryan

- [Rishabh-bgp](https://github.com/Rishabh-bgp/Rishabh-bgp) — GitHub profile README and `publications.csv`
- [brain-tumor-mri-classification](https://github.com/Rishabh-bgp/brain-tumor-mri-classification) — leakage-aware, explainable brain tumour MRI classification
- [beed-ml-study](https://github.com/Rishabh-bgp/beed-ml-study) — provenance audit of the Bangalore EEG Epilepsy Dataset
- [pan-cancer-classification](https://github.com/Rishabh-bgp/pan-cancer-classification) — TCGA Pan-Cancer RNA-Seq tumour typing
- [responsible-ai-uci-adult](https://github.com/Rishabh-bgp/responsible-ai-uci-adult) — fairness and explainability audit on UCI Adult
- [spam-scan](https://github.com/Rishabh-bgp/spam-scan) — explainable spam and scam detection
- [cnn-bilstm-attention-benchmarking-indian-scada](https://github.com/Rishabh-bgp/cnn-bilstm-attention-benchmarking-indian-scada) and 13 more M.Tech thesis implementations — listed on the [profile](https://github.com/Rishabh-bgp)

© Rishabh Aryan. Content is personal CV information; please do not reuse the portrait.
