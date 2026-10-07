# folios.json: per-page dataset for the Voynich manuscript

One entry per page or foldout panel, in manuscript order, built from René
Zandbergen's site voynich.nu. Fetched on 2026-10-07 with curl (polite
User-Agent, one-second pause between pages) and parsed with the Python
standard library (regex over the HTML). 255 entries: 227 pages described
on the site plus 28 placeholder entries for the 14 missing folios.

## Sources

- Index: https://www.voynich.nu/folios.html (gives the page order and the
  explanatory supplement that defines each field)
- One page per quire: https://www.voynich.nu/q01/index.html through
  https://www.voynich.nu/q20/index.html. Quires 16 and 18 returned 404;
  they are lost from the manuscript (folios 91–92 and 97–98).
- The site itself credits Lisa Fagin Davis for the scribal hands and
  Prescott Currier for the A/B languages. Site copyright René Zandbergen.

## Fields

- `folio`: the site's page id, e.g. `f1r`, `f67r1`, `fRos` (the Rosettes
  sheet, which the site treats as one page of quire 14).
- `quire`: 1–20.
- `section`: one of herbal, astronomical, zodiac, cosmological,
  biological, pharmaceutical, recipes, text. See mapping below.
- `language`: Currier language, `A`, `B` or null. Null means the site
  prints a hyphen ("Currier did not make any classification").
- `hand`: Lisa Fagin Davis's scribe number, 1–5, or null.
- `foldout`: true for every panel of a foldout folio (67, 68, 70, 72,
  85/86 including fRos, 89, 90, 95, 101, 102).
- `note`: a short description (max 120 chars), taken from the site's
  "Illustration(s)" block where there is one, otherwise from the general
  description with the boilerplate stripped.
- `missing`: true on the 28 placeholder entries. Those have null section,
  language and hand.
- `section_raw`: the site's own first sentence, kept where the mapping
  needed a judgement (text pages, "biological (or balneological)",
  "so-called cosmological", and the two fallbacks below).
- `language_raw`, `hand_raw`: the site's literal value where it was not a
  plain A/B or a plain digit.
- `rz_language`: Zandbergen's own finer language/dialect label, copied as
  printed (e.g. `A+ (page) / A (folio) / A (bifolio)`). Extra to the
  brief, but it is the only language information on the 29 pages Currier
  left unclassified.

## How section labels were mapped

The site has no section field. Each page's general description opens
with a sentence like "This is a herbal page" or "This is a so-called
cosmological page", and that sentence is what the mapping reads:

| site wording | section |
|---|---|
| "herbal page" | herbal |
| "astronomical page" | astronomical |
| "zodiac page" | zodiac |
| "so-called cosmological page" / "Cosmological page." | cosmological |
| "so-called biological (or balneological) page" | biological |
| "so-called pharmaceutical page" | pharmaceutical |
| "so-called recipes page, which is text-only, with stars drawn in the margin" | recipes |
| "text-only page" (f1r, f58r, f58v, f66r, f76r, f85r1, f86v5, f86v6) | text |

Judgement calls, all carrying a `section_raw`:

- f1r: the site's first sentence is about wear, not content; its second
  sentence says "text-only page". Mapped to text.
- f58r, f58v: "text-only page, with stars drawn in the margin". They look
  like the recipes pages but the site does not call them recipes, so they
  are text.
- f66r: text-only with marginal drawings. Mapped to text.
- f116v: the last page, "follows none of the standard patterns": a few
  lines of text in apparent Latin, German and Voynichese plus marginal
  drawings. Mapped to text. Its note is condensed from the site's own
  sentence rather than copied.
- The site never uses the word "astrological"; it says "astronomical" and
  "cosmological" and the dataset keeps that split exactly as the site has
  it (astronomical: f67r1, f67r2, f67v1, f68r1, f68r2, f68r3, f68v2;
  cosmological: f57v, f67v2, f68v3, f68v1, f69r, f69v, f70r1, f70r2,
  f85r2, fRos, f86v4, f86v3).

## Where the site gives no value, or an odd one

- Currier language null (site prints "-") on 29 pages: f65r, f65v, every
  panel of f67–f68, f69r, f69v, every panel of f70–f72, f73r, f73v, f116v.
  All the astronomical and zodiac pages are in this group.
- LFD hand: given for every described page. Two are not a single digit:
  - f115r: "2 (first 12 lines), then 3 (remainder)". Recorded as hand 2
    with the full wording in `hand_raw`.
  - f116v: "3 (?)". Recorded as hand 3 with `hand_raw` "3 (?)".
- f101v: the index shows two thumbnails (f101v1, f101v2) but both link to
  one description, f101v, so there is one entry. The site's quire note
  says folio 101 is a foldout, so `foldout` is true.
- f5r: the site uses the heading "Description" instead of "General
  description". The parser accepts both.
- Missing folios (12, 59–64, 74, 91–92, 97–98, 109–110) get a recto and a
  verso placeholder each, placed where they would sit in the sequence,
  with the quire the site assigns them to (q2, q8, q12, q16, q18, q20).

## Counts

Described pages: 227. Section: herbal 129, recipes 23, biological 19,
pharmaceutical 16, cosmological 12, zodiac 12, text 9, astronomical 7.
Language: A 114, B 84, null 29. Hand: 1 113, 2 47, 3 33, 4 27, 5 7.
Foldout panels: 45.
