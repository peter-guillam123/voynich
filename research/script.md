# Research notes: the script and its statistics

Gathered 7 October 2026 by a research agent (resumed after a network drop). Our own statistics are in `data/stats.json`, computed by `data/stats.py` from the ZL transliteration.

## Bowern and Lindemann 2021 (Annual Review of Linguistics 7, 285–308)

Open preprint: https://alumniacademy.yale.edu/sites/default/files/2021-07/The%20Linguistics%20of%20the%20Voynich%20Manuscript.pdf

- "We provide arguments for treating the document as natural language (rather than a medieval hoax) ... even though the contents remain undecipherable."
- "There are 21 or 22 common glyphs, plus approximately that many rarer character forms. The total number of glyphs in the dataset depends heavily on how one classifies the variable shapes of the graphemes."
- Entropy: "The entropy of Voynichese is unlike any other language or script." Abbreviation and devoweling do not bring real languages down to its level; "The only manipulation of this type that brings the conditional entropy to Voynich levels is systematic conflation of phonemic distinctions". Voynich A h2 2.17, B 2.01.
- Zipf: both languages follow it; "does not prove that the text is linguistically meaningful".
- Repeats: "Full reduplication ... is also common in Voynich. However, it is still within the realm of plausibility for natural language texts." A 0.84%, B 0.94%; corpus range 0.02–4.8%, average 0.63%.
- "85% of the paragraphs in the text begin with one of t, k, f, p ... They simply mark the beginning of the paragraph."
- Verdict: "non-language like at the character level. For measures that look above the word to line and paragraph ... it looks like a natural language."
- Hebrew: "not proven at best, and more accurately unconvincing."
- Companion paper, Lindemann and Bowern, arXiv:2010.14697: EVA h2 2.11 bits; Wikipedia range 2.77–6.14; "41% of words end with y"; "q being followed by o 98% of the time".
- Reply: Timm and Schinner, Cryptologia 45(5), 2021, https://lingbuzz.net/lingbuzz/005939/current.pdf : "the equality 'gibberish=random' ... is incorrect."

## Glyph counts

- Davis 2020: "a basic set of around thirty ... another fifteen to twenty very rare symbols". EVA treats bench-gallows as digraphs, v101 as single glyphs. https://repository.upenn.edu/mss_sims/vol5/iss1/6
- Lindemann and Bowern: "between 21 and 45 characters" depending on transcription.
- Zandbergen: "no consolidated set of this most basic statistic, due to the use of different transliteration alphabets". https://www.voynich.nu/a2_char.html

## f116v

- Zandbergen q20: "a few lines of text in a mixture of (apparent) Latin, German and writing in the Voynichese script"; first word "widely considered to say 'poxleber', a historical German word meaning 'goat liver'"; last line "so nim geis mi(l)ch" ("therefore take goat milk"), reading by Richard Salomon in the 1930s, supported by Panofsky; crosses between words "similar to short prayers or incantations"; Gothic hand, first half of the 15th century. https://www.voynich.nu/q20/index.html
- Conventional reading (Stolfi): "michiton + oladabas + multos + te + tær cerc + portas + M ++" etc. https://ic.unicamp.br/~stolfi/voynich/Notes/073/desc25e1-michiton.txt

## Month names

- Zandbergen's readings: mars, aberil, may, jong, iollet, augst, septe(m)b(r), octe(m)bre, nove(m)bre, decebre. "certainly a Romance language or dialect ... Spanish, Occitan and French" suggested; his view: Northern French. https://www.voynich.nu/writing.html
- Occitan case: Pelling https://ciphermysteries.com/2009/08/22/jaume-deydiers-livre-de-raison ; Bowern and Lindemann call them "Occitan month names".

## Stolfi's word grammar

- Mirror: https://www.voynich.nu/hist/stolfi/grammar.html ; summary https://www.voynich.nu/a3_para.html . Core (gallows), mantle (bench and e), crust (d l r s n x i m g); covers over 96.5% of tokens.

## Friedman's anagram

- D'Imperio 1978 quotes the anagram and the Philological Quarterly 1959 footnote; plaintext revealed by Zimansky, PQ 49 (1970), 433–443. https://archive.org/details/DTIC_ADA070618
- Wording in secondary sources: "The Voynich MSS was an early attempt to construct an artificial or universal language of the a priori type."

## Hauer and Kondrak 2016

- https://aclanthology.org/Q16-1006/ ; "None of the decipherments appear to be syntactically correct or semantically consistent."; results could be "artifacts of the combinatorial power of anagramming and language models".
- Kondrak (Alberta news, Jan 2018): "over 80 percent of the words were in a Hebrew dictionary, but we didn't know if they made sense together." https://www.ualberta.ca/en/science/news/2018/january/ai-used-to-decipher-ancient-manuscript.html

## Timm and Schinner 2020

- Abstract: "Our results support the so-called 'hoax hypothesis' ... we present a concrete text-generator algorithm (the 'self-citation' process), easily executable without additional tools even by a medieval scribe." https://doi.org/10.1080/01611194.2019.1596999

## Other

- Corrections: Anne Nill to Petersen, 1953: "I have never come across one in which corrections and erasures are so unobtrusive as they are in this ms. if it contains any." Zandbergen lists 12 folios with minor emendations. https://www.voynich.nu/writing.html
- Currier 1976: "the line is a functional entity"; "two languages and six to eight scribes". https://www.voynich.nu/extra/curr_main.html
- Gaskell and Bowern 2022: 42 volunteers; Voynich resembles meaningful text on 38 of 42 metrics, gibberish on 41 of 42; the exception is "the VMS's unusually large bias in character placement within words". https://ceur-ws.org/Vol-3313/paper4.pdf
- Reddy and Knight 2011: 225 pages, 8,114 word types, 37,919 tokens (Currier transcription). https://aclanthology.org/W11-1511.pdf

## Could not verify

- Exact text of Zimansky 1970; Timm and Schinner 2020 beyond the abstract; Bax's month-names page (403).
