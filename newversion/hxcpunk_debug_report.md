# 🔧 hxcpunk.com — Debug Report

> **Tested:** 2026-03-23 • **Site:** https://hxcpunk.com/ • **Repo:** `RevIntellect/hxcpunkapp`

---

## 🔴 Critical Issues

### 1. Duplicate [aiResearch](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#1095-1140) Function (JS Error)

The [aiResearch](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#1095-1140) function is defined **twice** with different signatures — this causes the second definition to silently overwrite the first, breaking the modal AI buttons.

| Location | Signature | Used By |
|----------|-----------|---------|
| [Line 957](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#L957-L1005) | [aiResearch(band, action, btn)](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#1095-1140) — takes **band name string** + btn element | Modal AI section #1 (lines 918-921) |
| [Line 1096](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#L1096-L1139) | [aiResearch(idx, action)](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#1095-1140) — takes **band index integer** | Modal AI section #2 (lines 943-946) |

**Impact:** The second definition wins, so the first set of AI buttons (Biography, Wild Stories, Scene Context, Deep Dive) pass a **string** where the function expects an **index**, causing `bandsData[idx]` to return `undefined`.

**Fix:** Remove one of the duplicate blocks. Keep the first version (lines 957-1005) since it's more robust, and update the second set of buttons (lines 943-946) to use the same call signature. Or better yet, delete one of the two duplicate AI sections from the modal entirely.

---

### 2. Duplicate AI Section in Band Modals

The [openBandModal()](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#876-955) function renders **two separate AI Research sections** per modal:

- **Section 1** (lines 914-924): "⚡ AI Research" — uses [aiResearch('Band Name', 'action', this)](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#1095-1140)
- **Section 2** (lines 940-949): "AI Research" — uses [aiResearch(idx, 'action')](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#1095-1140) + has an Ask input

**Fix:** Merge into a single AI section. Delete lines 940-949 and incorporate the Ask bar into the first section.

```diff
 // Remove the duplicate AI research section (lines 940-949)
- // AI Research section
- html+=`<div class="ai-section"><div class="modal-section">AI Research</div>`;
- html+=`<div class="ai-buttons">`;
- html+=`<button class="ai-btn" onclick="aiResearch(${idx},'biography')">...Biography</button>`;
- html+=`<button class="ai-btn" onclick="aiResearch(${idx},'deep_dive')">...Deep Dive</button>`;
- html+=`<button class="ai-btn" onclick="aiResearch(${idx},'scene_context')">...Scene Context</button>`;
- html+=`</div>`;
- html+=`<div class="ask-bar">...</div>`;
- html+=`<div class="ai-result" id="ai-result-area"></div>`;
- html+=`</div>`;
```

---

### 3. `/api/research` Endpoint Returns 404

The AI-powered research feature (both modal and "Ask the Scene") calls `/api/research`, but **no API route exists** in the deployed files. The repo contains only static HTML files — there's no `api/` directory with serverless functions.

**Error shown to user:**
> `Network error: Make sure ANTHROPIC_API_KEY is set in your Vercel environment variables.`

**Fix:** Create a Vercel serverless function at `api/research.js`:

```
hxcpunkapp/
├── api/
│   └── research.js    ← NEW: serverless function
├── index.html
└── public/
    └── index.html
```

Then in Vercel dashboard → Settings → Environment Variables, add:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

### 4. Duplicate CSS Rule Blocks

The `.ai-section`, `.ai-buttons`, `.ai-btn`, `.ai-result`, and `.ai-loading` styles are defined **twice** (lines 181-195 and lines 221-232) with slightly different values, causing visual inconsistency.

**Fix:** Remove the second block (lines 221-237) and keep the first.

---

## 🟡 Data Issues — Broken Spotify Embeds

### Bands with Missing Spotify Album IDs

The following bands have albums with empty `spotify: ""` fields, meaning the Spotify embed iframe won't load (shows "Page not found" error). Several of these are legitimately not on Spotify (Dischord Records artists, DIY releases), but others should have working IDs.

| Band | Album | Spotify Available? | Fix |
|------|-------|--------------------|-----|
| **Circle Jerks** | Group Sex | ❌ **Removed from Spotify** ~2020 | Remove the ID `3dbz15me1aqrJjcUgO2d9B`. Set `spotify:""` and add `note:"Removed from Spotify"` |
| **Circle Jerks** | Wild in the Streets | ⚠️ ID may be stale | Verify ID `5hXrOjEmGRsKmMGpC44WHt` — test in browser |
| **Circle Jerks** | Golden Shower of Hits | ⚠️ ID may be stale | Verify ID `3sj6J6oAJEhsVHDnaqFC6v` |
| **Minor Threat** | All 3 releases | ❌ Not on streaming (Dischord) | Already handled correctly with `note` |
| **Fugazi** | All 6 releases | ❌ Not on streaming (Dischord) | Already handled correctly |
| **Rites of Spring** | S/T | ❌ Not on streaming (Dischord) | Already handled correctly |
| **SS Decontrol** | Both releases | ❌ Limited streaming | Already handled correctly |
| **Void** | Faith/Void Split | ❌ Dischord | Already handled correctly |
| **Dag Nasty** | Both releases | ❌ Dischord | Already handled correctly |
| **Nation of Ulysses** | 13-Point Program | ❌ Dischord | Already handled correctly |
| **Government Issue** | Both releases | ❌ Dischord | Already handled correctly |
| **DYS** | Brotherhood | ❌ Limited | ✅ OK |
| **Ringworm** | The Promise | ❌ Limited | ✅ OK |
| **Confront** | Demo | ❌ Demo-only | ✅ OK |
| **9 Shocks Terror** | Zen and the Art... | ❌ Limited | ✅ OK |
| **Zero Defex** | The New Hope comp | ❌ Regional comp | ✅ OK |
| **Los Crudos** | Canciones Para Liberar | ❌ DIY | ✅ OK |
| **Spazz** | Both releases | ❌ Underground | ✅ OK |
| **Infest** | Slave | ❌ Underground | ✅ OK |
| **D.O.A.** | War on 45 | ⚠️ May be on Spotify | Search and add ID if available |
| **GBH** | City Baby's Revenge | ⚠️ May be on Spotify | Search and add ID if available |
| **7 Seconds** | Walk Together, Rock Together | ⚠️ May be on Spotify | Search and add ID if available |
| **Gorilla Biscuits** | EP | ❌ Likely not streaming | ✅ OK |

> [!IMPORTANT]
> The **Circle Jerks** entries are the **only confirmed broken embeds** — they have Spotify IDs that no longer resolve. All other empty IDs are intentionally blank. Verify the 3 Circle Jerks IDs and clear any that are dead.

### Quick Fix for Circle Jerks

In [index.html](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html) around line 577-581, verify each Spotify ID by opening:
- `https://open.spotify.com/album/3dbz15me1aqrJjcUgO2d9B` (Group Sex)
- `https://open.spotify.com/album/5hXrOjEmGRsKmMGpC44WHt` (Wild in the Streets)  
- `https://open.spotify.com/album/3sj6J6oAJEhsVHDnaqFC6v` (Golden Shower of Hits)

If any return 404, clear the ID to `""` and add a `note:` explaining it's not on streaming.

---

## 🟡 Moderate Issues

### 5. Duplicate CSS Rule Blocks for AI Styles

Lines 181-195 and 221-237 both define `.ai-section`, `.ai-btn`, `.ai-result`, `.ai-loading` with conflicting values:

```diff
 /* First definition - line 184 */
 .ai-btn { color: #6aba6a; border: 1px solid rgba(40,120,40,.4); }
 
 /* Second definition - line 224 (WINS due to cascade) */
 .ai-btn { color: #4a9; border: 1px solid rgba(30,180,30,.3); }
```

**Fix:** Delete the second block (lines 221-237).

---

### 6. `albumsData` Has "Give Blood" Listed as 1999 but Bane's Entry Says 2001

In `albumsData` (line 807): `{title:"Give Blood",artist:"Bane",year:1999,...}`  
In `bandsData` Bane discog (line 719): `{title:"Give Blood",year:2001,...}`

**Fix:** The actual release year is **2001**. Update line 807 to `year:2001,decade:"90s"` or move to a "2000s" category.

---

### 7. Missing `vercel.json` Configuration

No `vercel.json` exists, which means:
- The [public/index.html](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/public/index.html) and root [index.html](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html) could conflict
- No API route handling is configured
- No redirects from www → non-www

**Fix:** Add a `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## 🟢 Minor / Cosmetic Issues

### 8. Mobile Nav Crowding
On viewports under 375px, the 8 nav buttons stack into 2+ rows consuming significant vertical space. Consider a horizontal scrollable nav or hamburger menu at small sizes.

### 9. Cross-Origin Iframe Warnings
Spotify and Carto iframes produce `SecurityError: Blocked a frame with origin` console warnings. These are expected and cosmetic — no fix needed.

### 10. Refused Listed as "Other US" Scene
Refused is from Umeå, Sweden, but categorized under `scene: "Other US"`. Consider adding a "Europe/International" scene or at minimum note "Sweden" in the scene label.

---

## 📋 Summary of Fixes by Priority

| Priority | Issue | Lines | Effort |
|----------|-------|-------|--------|
| 🔴 P0 | Remove duplicate [aiResearch](file:///Users/aaron/Library/Mobile%20Documents/com~apple~CloudDocs/_Organized/06_Development/GitHub/hxcpunkapp/index.html#1095-1140) function | 1096-1139 | Delete |
| 🔴 P0 | Remove duplicate AI modal section | 940-949 | Delete |
| 🔴 P0 | Remove duplicate CSS block | 221-237 | Delete |
| 🔴 P1 | Create `api/research.js` + set env var | New file | Medium |
| 🟡 P2 | Fix Circle Jerks Spotify IDs | 577-581 | Verify & fix |
| 🟡 P2 | Fix Bane "Give Blood" year discrepancy | 807, 719 | 1 line |
| 🟡 P3 | Add `vercel.json` | New file | Quick |
| 🟢 P4 | Mobile nav improvements | CSS | Small |
| 🟢 P4 | Refused scene category | Data | 1 line |
