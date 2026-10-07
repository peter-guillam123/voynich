import re, json, math, collections, sys
from collections import Counter

PROJ="/Users/cjmoran/Desktop/Claude projects/Work/Voynich/data/"

# ---------- Voynichese ----------
pages={}; order=[]
cur=None
tokens_all=[]; tokens_by_lang={'A':[], 'B':[]}; tokens_by_page={}
lines_by_page={}
hdr=re.compile(r'^<(f[0-9]+[rv][0-9]*)>\s*<!([^>]*)>')
loc=re.compile(r'^<(f[0-9]+[rv][0-9]*)\.(\d+),([@+=*~])(\w\w)>\s*(.*)$')
def clean(t):
    t=re.sub(r'<[^>]*>','',t)            # inline tags/comments
    t=re.sub(r'@\d{3};','?',t)           # rare chars -> unreadable
    t=re.sub(r'\[([^\]:]*):[^\]]*\]',r'\1',t)  # uncertain: take first
    t=t.replace('{','').replace('}','')  # ligature marks
    t=re.sub(r'[!\-=/]','',t)            # fillers, drawing gaps, continuation
    t=t.replace(',','.')                 # uncertain space -> space
    return t
para_lines=[]
for raw in open('ZL3b-n.txt',encoding='utf-8'):
    raw=raw.rstrip('\n')
    m=hdr.match(raw)
    if m:
        cur=m.group(1); vars_=dict(kv.split('=') for kv in m.group(2).replace('$','').split())
        pages[cur]=vars_; order.append(cur); tokens_by_page[cur]=[]; lines_by_page[cur]=0
        continue
    if raw.startswith('#') or not raw.startswith('<'): continue
    m=loc.match(raw)
    if not m: continue
    page,num,locator,ltype,text=m.groups()
    if not ltype.startswith('P'): continue   # paragraph text only (skip labels, circles, radial)
    text=clean(text)
    words=[w for w in text.split('.') if w]
    words=[w for w in words if '?' not in w]  # drop words with unreadable chars
    lines_by_page[page]+=1
    para_lines.append((page,words))
    tokens_all+=words; tokens_by_page[page]+=words
    L=pages[page].get('L')
    if L in tokens_by_lang: tokens_by_lang[L]+=words

def basic(tokens, name):
    c=Counter(tokens)
    n=len(tokens); v=len(c)
    lens=Counter(len(w) for w in tokens)
    maxlen=max(lens)
    wl=[round(lens.get(i,0)/n,5) for i in range(1,16)]
    # zipf
    freqs=[f for _,f in c.most_common(2000)]
    # char entropy over the running text with spaces
    s=' '.join(tokens)
    uni=Counter(s); tot=sum(uni.values())
    h1=-sum(f/tot*math.log2(f/tot) for f in uni.values())
    bi=Counter(zip(s,s[1:])); totb=sum(bi.values())
    # conditional entropy H(X2|X1)
    h2=0
    for (a,b),f in bi.items():
        p_ab=f/totb; p_a=uni[a]/tot
        h2-=p_ab*math.log2(p_ab/p_a)
    # adjacent repeats
    rep=sum(1 for a,b in zip(tokens,tokens[1:]) if a==b)
    def ed1(a,b):
        if a==b: return False
        if abs(len(a)-len(b))>1: return False
        if len(a)==len(b): return sum(x!=y for x,y in zip(a,b))==1
        if len(a)>len(b): a,b=b,a
        for i in range(len(b)):
            if b[:i]+b[i+1:]==a: return True
        return False
    near=sum(1 for a,b in zip(tokens,tokens[1:]) if ed1(a,b))
    hapax=sum(1 for w,f in c.items() if f==1)
    return dict(name=name, tokens=n, types=v, hapax=hapax, mean_len=round(sum(len(w) for w in tokens)/n,2),
                wordlen=wl, zipf=freqs[:1000], h1=round(h1,3), h2=round(h2,3),
                alphabet=len([k for k in uni if k!=' ']),
                repeat_rate=round(rep/n*1000,2), near_repeat_rate=round(near/n*1000,2),
                top=[(w,f) for w,f in c.most_common(40)])

out={}
out['voynich']=basic(tokens_all,'Voynichese (EVA)')
out['voynich_A']=basic(tokens_by_lang['A'],'Currier A')
out['voynich_B']=basic(tokens_by_lang['B'],'Currier B')
# glyph frequency and positional stats (EVA single chars; treat ch, sh, cth etc as sequences of letters, note)
alpha=Counter(ch for w in tokens_all for ch in w)
out['glyph_freq']=alpha.most_common()
starts=Counter(w[0] for w in tokens_all); ends=Counter(w[-1] for w in tokens_all)
out['start_freq']=starts.most_common(); out['end_freq']=ends.most_common()
# line-initial vs other
first=Counter(); other=Counter()
for page,words in para_lines:
    if words:
        first[words[0][0]]+=1
        for w in words[1:]: other[w[0]]+=1
nf=sum(first.values()); no=sum(other.values())
out['line_start_vs_other']={k:(round(first[k]/nf*100,1), round(other[k]/no*100,1)) for k in ['q','o','d','s','y','ch','c','p','t','k','f']}
# A vs B signature words
cA=Counter(tokens_by_lang['A']); cB=Counter(tokens_by_lang['B'])
nA=sum(cA.values()); nB=sum(cB.values())
sig=[]
for w in ['daiin','chol','chor','chedy','shedy','qokedy','qokeedy','qokain','ol','aiin','qokaiin','dy','cthy','okaiin','qol','dar','or','ar','s','y','qokal','lchedy','qokeey','sho','cheol','chey']:
    sig.append((w, round(cA[w]/nA*1000,2), round(cB[w]/nB*1000,2)))
out['AB_words']=sig
out['pages']=[dict(folio=p, **pages[p], lines=lines_by_page[p], words=len(tokens_by_page[p])) for p in order]
print('voynich tokens',out['voynich']['tokens'],'types',out['voynich']['types'],'pages',len(order))
print('A',nA,'B',nB)
print('h1',out['voynich']['h1'],'h2',out['voynich']['h2'],'alphabet',out['voynich']['alphabet'])
print('repeat',out['voynich']['repeat_rate'],'near',out['voynich']['near_repeat_rate'])
print('top',out['voynich']['top'][:15])
print('wordlen',out['voynich']['wordlen'])
print('AB',sig)
print('linestart',out['line_start_vs_other'])

# ---------- comparison corpora ----------
def gut(fn, start_marker, end_marker='*** END'):
    t=open(fn,encoding='utf-8',errors='ignore').read()
    i=t.find(start_marker); j=t.find(end_marker, i+10)
    t=t[i:j] if i>=0 and j>i else t
    t=t.lower()
    t=re.sub(r"[^a-zàèéìòùáíóúâêîôûäëïöüçñæœ']+"," ",t)
    return [w.strip("'") for w in t.split() if w.strip("'")]
en=gut('g1342.txt','*** START')
it=gut('g1000.txt','*** START')
la=gut('g218.txt','*** START')
# trim to similar size as Voynich (first ~37k words) for comparability of types/hapax
N=out['voynich']['tokens']
for key,toks,name in [('english',en,'English (Pride and Prejudice)'),('italian',it,'Italian (Divina Commedia)'),('latin',la,'Latin (Caesar, De Bello Gallico I–IV)')]:
    out[key]=basic(toks[:N],name); out[key]['full_tokens']=len(toks)
    r=out[key]; print(key, r['tokens'], r['types'], 'h1',r['h1'],'h2',r['h2'],'rep',r['repeat_rate'],'near',r['near_repeat_rate'],'mean',r['mean_len'])
json.dump(out, open(PROJ+'stats.json','w'), ensure_ascii=False)
print('written')
