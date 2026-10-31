"""
Yangi partiyani NGSL fayllariga qo'shadi.
  python scripts/ngsl_merge.py <partiya.txt> <a1|a2|b1|b2>

- NGSL ro'yxatida bo'lmagan so'zlarni (litsenziya tozaligi uchun) tashlaydi
- Lug'atda allaqachon bor so'zlarni tashlaydi
- Satr formati: so'z|turkum|tarjima|misol gap
"""
import glob
import re
import sys

ROOT = "apps/web/src/content"
chunk, level = sys.argv[1], sys.argv[2]

ngsl = {line.split(",")[0].strip().lower() for line in open("data/ngsl/NGSL_12_stats.csv", encoding="utf-8").read().splitlines()[1:] if line}

existing = set()
for f in glob.glob(f"{ROOT}/ngsl/*.ts"):
    for line in open(f, encoding="utf-8"):
        m = re.match(r"^([A-Za-z][A-Za-z '-]*)\|", line)
        if m:
            existing.add(m.group(1).lower())
for line in open(f"{ROOT}/vocab-basic.ts", encoding="utf-8"):
    m = re.match(r'\s*\["([^"]+)"', line)
    if m:
        existing.add(m.group(1).lower())
for line in open(f"{ROOT}/vocab.ts", encoding="utf-8"):
    m = re.match(r'\s*word: "([^"]+)"', line)
    if m:
        existing.add(m.group(1).lower())

fresh, duplicates, not_ngsl, malformed = [], [], [], []
seen = set()
for raw in open(chunk, encoding="utf-8"):
    line = raw.rstrip("\n")
    if not line.strip():
        continue
    parts = line.split("|")
    if len(parts) != 4 or not all(p.strip() for p in parts):
        malformed.append(line[:50])
        continue
    word = parts[0].strip().lower()
    if word not in ngsl:
        not_ngsl.append(word)
    elif word in existing or word in seen:
        duplicates.append(word)
    else:
        fresh.append(line)
        seen.add(word)

target = f"{ROOT}/ngsl/{level}.ts"
text = open(target, encoding="utf-8").read()
head, tail = text.rsplit("`;", 1)
open(target, "w", encoding="utf-8").write(head.rstrip("\n") + "\n" + "\n".join(fresh) + "\n`;" + tail)

print(f"{level}: qo'shildi {len(fresh)}")
print("  takror:", duplicates)
print("  NGSL emas (tashlandi):", not_ngsl)
print("  noto'g'ri satr:", malformed)
