# Veo access URLs — consumer / lab evidence (2026)

**Pass type:** web-research fetch only · **No redesign**  
**Compiled:** 2026-09-22 (America/New_York / EDT)  
**Scope:** Concrete signed-in Google-account URLs where video can be generated with **Veo** (or closely adjacent Google video surfaces that still expose Veo / document Veo). Product names, image-to-video notes, VERIFIED/UNVERIFIED citations.

**Verification legend**
- **VERIFIED** — claim appears in the cited primary source fetched this pass (quoted or closely paraphrased).
- **UNVERIFIED** — asserted in secondary/third-party sources or inferred; not confirmed against a primary page body this pass.
- **[unclear]** — conflicting or incomplete primary evidence.

---

## 0. Official source map (fetched this pass)

| Kind | URL | HTTP / notes |
| --- | --- | --- |
| Product — Google Flow | https://flow.google.com/ | **200**; Sign-in gate |
| Labs alias → Flow | https://labs.google/fx/tools/flow | **200** final URL = `https://flow.google.com/` |
| Labs hub | https://labs.google/ | Lists Google Flow (formerly VideoFX) |
| Flow Help — create videos | https://support.google.com/labs/answer/16353334 | Animate images; frames; ingredients |
| Flow Help — models & features | https://support.google.com/flow/answer/16893917?hl=en | Veo 3.1 Lite/Fast/Quality + Gemini Omni Flash |
| Gemini app | https://gemini.google.com/ | Signed-in consumer chat |
| Gemini marketing — video | https://gemini.google/overview/video-generation/ | **Omni replaces Veo in Gemini app** |
| Google AI Studio — Veo 3.1 model card | https://aistudio.google.com/models/veo-3 | **200**; API / model docs surface |
| Gemini API — video overview | https://ai.google.dev/gemini-api/docs/video | Last updated 2026-06-30 UTC; Omni + Veo |
| Gemini API — Veo guide | https://ai.google.dev/gemini-api/docs/veo | Image-to-video, first/last frames, refs |
| Cloud docs — text→video | https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos-from-text → redirects to Agent Platform docs | Console deep links |
| Cloud docs — image→video | https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos-from-an-image | Same family |
| Console — Media Studio (Video) | https://console.cloud.google.com/gemini-enterprise-agent-platform/studio/media/video | Linked from image→video docs |
| Console — Media Studio (legacy path) | https://console.cloud.google.com/vertex-ai/studio/media/video | Still linked from Cloud docs |
| Blog — Veo 3.1 Ingredients to Video | https://blog.google/innovation-and-ai/technology/ai/veo-3-1-ingredients-to-video/ | Dated **Jan 13, 2026** |
| Google Vids Help — AI video | https://support.google.com/docs/answer/16143507 | Create AI videos / Animate image |
| Google Vids create | https://docs.google.com/videos/create | Fetch **403** unauthenticated; URL cited by Workspace help / third parties |

---

## 1. Quick answer — where to generate (signed-in Google account)

| Priority | Product name | Concrete URL | Still brands / exposes **Veo**? | Access class |
| --- | --- | --- | --- | --- |
| **Primary consumer filmmaking UI** | **Google Flow** (formerly VideoFX) | https://flow.google.com/ | **Yes** — Veo 3.1 Lite / Fast / Quality selectable per Flow Help | Consumer / Labs graduate; Google sign-in |
| Labs entry / redirect | Google Labs → Flow | https://labs.google/ · https://labs.google/fx/tools/flow → Flow | Same as Flow | Lab hub |
| Consumer chat | **Gemini app** | https://gemini.google.com/ | **No (transition)** — marketing says **Gemini Omni will replace Veo** in the Gemini app | Consumer; Google AI Plus/Pro/Ultra (18+) per marketing |
| Developer UI / API key | **Google AI Studio** | https://aistudio.google.com/models/veo-3 (+ API key at https://aistudio.google.com/apikey) | **Yes** — Veo 3.1 / 3.1 Fast / 3.1 Lite model card; `generate_videos` samples | Lab / developer; signed-in |
| Cloud console UI | **Agent Platform Media Studio** (formerly Vertex AI Studio Media Studio) | https://console.cloud.google.com/gemini-enterprise-agent-platform/studio/media/video · also https://console.cloud.google.com/vertex-ai/studio/media/video | **Yes** — Task menus Text-to-video / Image-to-video with Veo model IDs | GCP project + billing; signed-in Google/Cloud |
| Workspace creative | **Google Vids** | https://docs.google.com/videos/create (help: Create AI videos) | **[unclear]** — Jan 2026 blog listed Veo 3.1; current Vids Help “Use policies for Omni” | Eligible Workspace / AI plan |

---

## 2. Product-by-product evidence

### 2.1 Google Flow — primary signed-in consumer/lab filmmaking URL

| Field | Value |
| --- | --- |
| Product | **Google Flow** (Labs: formerly **VideoFX**) |
| URL | https://flow.google.com/ |
| Alternate | https://labs.google/fx/tools/flow → resolves to Flow (**VERIFIED** via curl final URL) |
| Hub | https://labs.google/ describes Flow as AI creative studio |
| Status | **VERIFIED** |

**Veo models in Flow (VERIFIED)** — Flow Help https://support.google.com/flow/answer/16893917?hl=en:

- **Veo 3.1 - Lite** — Text to Video; Frames to Video (first; first+last); Ingredients/References to Video (8s only); Extend videos (8s; Lite required to extend Veo 3.1 8s clips).
- **Veo 3.1 - Fast** — Text / Frames (first; first+last); Ingredients (8s only). No video-to-video edit; no extend.
- **Veo 3.1 - Quality** — Text / Frames (first; first+last). No ingredients; no video-to-video; no extend.
- **Gemini Omni Flash 1.1** — also available in Flow (text/frames/ingredients/video-to-video; up to 10s). Not Veo, but coexists in the same UI.

**How to generate (VERIFIED)** — https://support.google.com/labs/answer/16353334:

1. Go to Google Flow → open/create project.
2. Prompt box → click model name → **Video**.
3. Optional: ingredients or start/end frames.
4. Set aspect ratio, outputs, model, length → **Generate**.

---

### 2.2 Google Gemini app — video yes; Veo being replaced by Omni

| Field | Value |
| --- | --- |
| Product | **Google Gemini** (app / gemini.google.com) |
| URL | https://gemini.google.com/ |
| Video overview | https://gemini.google/overview/video-generation/ |
| Status | **VERIFIED** (Omni messaging); Veo-as-branded model in-app = **[unclear]** / transitioning |

**VERIFIED quotes / claims** from https://gemini.google/overview/video-generation/:

- “**Gemini Omni will replace Veo in the Gemini app.**”
- Omni includes **image to video** and video-to-video editing; “Turn photos into a video (**up to 5**)”.
- Requires **Google AI Plus, Pro, or Ultra**; **18+**; features vary by tier/geo.

**Jan 13, 2026 blog** https://blog.google/innovation-and-ai/technology/ai/veo-3-1-ingredients-to-video/ still said consumers could try **Veo 3.1 Ingredients to Video** in the Gemini app. That is **older** than the current Omni replacement page → treat in-app **Veo branding as superseded or in flux** unless re-verified live while signed in.

---

### 2.3 Google AI Studio — Veo 3.1 model / API surface

| Field | Value |
| --- | --- |
| Product | **Google AI Studio** |
| URL | https://aistudio.google.com/models/veo-3 |
| API key | https://aistudio.google.com/apikey |
| API docs | https://ai.google.dev/gemini-api/docs/veo · https://ai.google.dev/gemini-api/docs/video |
| Status | **VERIFIED** |

**VERIFIED from model card** (`aistudio.google.com/models/veo-3`):

- Models: **Veo 3.1 & 3.1 Fast**, **Veo 3.1 Lite**, **Veo 3 & 3 Fast**.
- Input modalities: Text, **Image**, Video (3.1 / 3.1 Fast); Text, Image (Lite / Veo 3).
- Sample model id: `veo-3.1-fast-generate-preview` via `client.models.generate_videos(...)`.
- Resolutions include 720p, 1080p*, 4k* (footnotes on length/refs).

**Note:** Fetched page is a **model + API quickstart** surface, not a confirmed no-code “press Generate” playground URL (attempted `aistudio.google.com/generate-video` → **403**). Signed-in generation is **VERIFIED** via API key + `generate_videos`; a dedicated Studio video UI path is **[unclear]** without auth.

---

### 2.4 Vertex / Agent Platform Media Studio (Cloud console)

| Field | Value |
| --- | --- |
| Product | **Gemini Enterprise Agent Platform → Media Studio** (docs still say Vertex AI / Agent Platform interchangeably) |
| Console URLs | https://console.cloud.google.com/gemini-enterprise-agent-platform/studio/media/video · https://console.cloud.google.com/vertex-ai/studio/media/video |
| Docs | https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos-from-text · …/generate-videos-from-an-image |
| Status | **VERIFIED** (deep links + console steps in Cloud docs) |

**Console workflow (VERIFIED from image→video docs HTML):**

1. Open Media Studio Video URL above (GCP project required).
2. **Task** → **Text-to-video** or **Image-to-video**.
3. Select a **Veo** model from the Model menu.
4. For image→video: **Start** = first frame; optional **End** = last frame; prompt; GCS output → **Run**.

**Example Veo model IDs (VERIFIED in docs):** `veo-3.1-generate-001`, `veo-3.1-fast-generate-001`, `veo-3.1-lite-generate-001`, plus Veo 3.0 variants.

---

### 2.5 Google Vids (Workspace)

| Field | Value |
| --- | --- |
| Product | **Google Vids** |
| Create URL | https://docs.google.com/videos/create |
| Help | https://support.google.com/docs/answer/16143507 |
| Status | URL **UNVERIFIED** live (403 without auth); Help **VERIFIED** for AI video flows |

Help documents: **Create AI videos** / **Animate** (jpg/png → ~8s clip), **Ingredients** (up to **7** images), Landscape 16:9 / Portrait 9:16, 720p, 24fps. Section titled “Use policies for **Omni**” → current Vids generation may be Omni-backed even if older Workspace blog posts named Veo 3.1 (**[unclear]** branding).

Jan 13, 2026 Google blog listed **Google Vids** among Veo 3.1 Ingredients to Video surfaces — **VERIFIED** as of that date; current model brand **[unclear]**.

---

### 2.6 YouTube Shorts / Create (mentioned historically)

| Field | Value |
| --- | --- |
| Claim | Jan 13, 2026 blog: Veo 3.1 Ingredients to Video in **YouTube Shorts** and **YouTube Create app** |
| Status | **VERIFIED** for that blog date; live consumer URL / whether still Veo vs Omni **UNVERIFIED** this pass (no Shorts product page fetched) |

---

## 3. Image-to-video notes (cross-product)

| Surface | Image→video capability | Citation | Status |
| --- | --- | --- | --- |
| **Flow** | **Frames to Video**: start frame; start+end frames. **Ingredients/References to Video** (Veo 3.1 Lite/Fast: 8s only; Quality: no ingredients). Animate images via Video Frames. | Flow Help models + create videos | **VERIFIED** |
| **Gemini app (Omni)** | Turn photos into video (**up to 5** photo references); text+photos+video multimodal | gemini.google/overview/video-generation | **VERIFIED** (Omni, not Veo) |
| **AI Studio / Gemini API (Veo)** | Image as first frame; first+last frames; up to **three reference images** for image-based direction; sample: generate image with Nano Banana 2 then `generate_videos` | ai.google.dev/gemini-api/docs/veo · aistudio model card Input: Text, Image, Video | **VERIFIED** |
| **Agent Platform Media Studio** | Task **Image-to-video**; upload **Start** (first frame) and optional **End** (last frame) | Cloud image→video docs | **VERIFIED** |
| **Google Vids** | **Animate** uploaded jpg/png → 8s; **Ingredients** up to 7 images in Create | Vids Help | **VERIFIED** (feature); model = Veo vs Omni **[unclear]** |
| Blog Ingredients to Video | Reference-image “ingredients”; native **9:16**; 1080p/4K upscale on Flow / API / Vertex | blog.google … veo-3-1-ingredients-to-video (2026-01-13) | **VERIFIED** as of blog date |

**Practical tip (VERIFIED from Jan 2026 blog):** create ingredient stills with **Nano Banana Pro** in Gemini or Flow, then feed into Ingredients to Video.

---

## 4. Recommended “go generate now” shortlist (2026-09-22)

1. **Want Veo-branded consumer UI with frames/ingredients:** open **https://flow.google.com/** (sign in) → Video → pick **Veo 3.1** Lite/Fast/Quality.  
2. **Want Cloud console Image-to-video with Veo model IDs:** **https://console.cloud.google.com/gemini-enterprise-agent-platform/studio/media/video** (or legacy `…/vertex-ai/studio/media/video`).  
3. **Want API / AI Studio Veo 3.1:** **https://aistudio.google.com/models/veo-3** + **https://aistudio.google.com/apikey**; docs **https://ai.google.dev/gemini-api/docs/veo**.  
4. **Gemini app video:** **https://gemini.google.com/** — expect **Gemini Omni**, not Veo, per current Google marketing.

---

## 5. Gaps / conflicts noted this pass

| Item | Detail | Status |
| --- | --- | --- |
| Gemini app model brand | Omni page says it **replaces Veo**; Jan 2026 blog still named Veo in Gemini | Prefer Omni page as current |
| Flow help duplicates | `support.google.com/flow/…` and `support.google.com/labs/…` both describe Flow models; feature tables may differ slightly across mirrored answers | Use most recently fetched Flow answer (16893917) for Veo feature list |
| AI Studio no-code video URL | No public unauth generate-video path confirmed | API path VERIFIED; UI playground UNVERIFIED |
| Vids / YouTube model brand | Blog (Veo) vs Vids Help (Omni policies) | Model name **[unclear]** |
| Third-party “free credits” claims | e.g. Flow daily credits | **UNVERIFIED** this pass — not asserted as fact |

---

*End of evidence file. No product redesign recommendations.*
