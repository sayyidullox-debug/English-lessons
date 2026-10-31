/**
 * NGSL dan lug'atda hali yo'q so'zlarni chiqaradi, tarjima yozish uchun.
 *   npx tsx scripts/ngsl-todo.ts <boshlang'ich-rank> <oxirgi-rank>
 */
import { readFileSync } from "node:fs";
import { VOCAB } from "../apps/web/src/content/vocab";

const [from = "1", to = "300"] = process.argv.slice(2);
const have = new Set(VOCAB.map((w) => w.word.toLowerCase()));

const rows = readFileSync("data/ngsl/NGSL_12_stats.csv", "utf8")
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.split(","))
  .map(([lemma, rank]) => ({ lemma: lemma!.trim(), rank: Number(rank) }))
  .filter((r) => r.rank >= Number(from) && r.rank <= Number(to));

const todo = rows.filter((r) => !have.has(r.lemma.toLowerCase()));
console.log(`# ${rows.length} ta so'z oralig'ida, ${todo.length} tasi lug'atda yo'q`);
console.log(todo.map((r) => `${r.rank}|${r.lemma}`).join("\n"));
