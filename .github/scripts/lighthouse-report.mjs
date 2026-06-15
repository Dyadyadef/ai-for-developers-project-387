// Парсит JSON-отчёты Lighthouse и формирует:
//  1) Markdown-сводку в $GITHUB_STEP_SUMMARY (видно прямо в логе job);
//  2) issue-body.md — тело утреннего GitHub Issue с таблицей оценок и рекомендациями.
// Чистый Node, без зависимостей. Не падает, если отчётов нет.
import fs from 'node:fs'
import path from 'node:path'

const REPORTS_DIR = process.env.LH_REPORTS_DIR ?? 'lighthouse-reports'
const THRESHOLD = Number(process.env.LH_THRESHOLD ?? '90') // ниже — нужна реакция
const CATEGORIES = [
  ['performance', 'Perf'],
  ['accessibility', 'A11y'],
  ['best-practices', 'BP'],
  ['seo', 'SEO'],
]

/** Эмодзи-индикатор по оценке (0..100). */
function badge(score) {
  if (score == null) return '—'
  if (score >= 90) return `🟢 ${score}`
  if (score >= 50) return `🟠 ${score}`
  return `🔴 ${score}`
}

/** Читает все *.report.json из каталога. */
function loadReports(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.report.json'))
    .map((f) => {
      try {
        const json = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
        return { file: f, json }
      } catch (e) {
        console.error(`Не удалось прочитать ${f}: ${e.message}`)
        return null
      }
    })
    .filter(Boolean)
}

/** Извлекает оценки категорий (×100, округлённые) и метаданные страницы. */
function extractScores(json) {
  const cats = json.categories ?? {}
  const scores = {}
  for (const [id] of CATEGORIES) {
    const s = cats[id]?.score
    scores[id] = s == null ? null : Math.round(s * 100)
  }
  return {
    url: json.finalDisplayedUrl ?? json.finalUrl ?? json.requestedUrl ?? '(unknown)',
    scores,
  }
}

/** Топ проблемных аудитов: opportunity с экономией + провалившиеся проверки. */
function extractRecommendations(json, limit = 6) {
  const audits = json.audits ?? {}
  const recs = []
  for (const id of Object.keys(audits)) {
    const a = audits[id]
    if (!a || a.scoreDisplayMode === 'notApplicable' || a.scoreDisplayMode === 'manual') continue
    const savingsMs = a.details?.type === 'opportunity' ? a.details.overallSavingsMs ?? 0 : 0
    const failed = typeof a.score === 'number' && a.score < 0.9
    if (savingsMs > 0 || failed) {
      recs.push({
        title: a.title,
        savingsMs,
        score: a.score,
        displayValue: a.displayValue ?? '',
      })
    }
  }
  // сначала по экономии, затем по «худшести» оценки
  recs.sort((x, y) => y.savingsMs - x.savingsMs || (x.score ?? 1) - (y.score ?? 1))
  return recs.slice(0, limit)
}

function shortUrl(url) {
  try {
    const u = new URL(url)
    return u.pathname === '/' ? '/' : u.pathname
  } catch {
    return url
  }
}

function build() {
  const reports = loadReports(REPORTS_DIR)
  const lines = []
  const push = (s = '') => lines.push(s)

  push('## 🌙 Ночной аудит Lighthouse')
  push()

  if (reports.length === 0) {
    push('⚠️ Отчёты Lighthouse не найдены — возможно, аудит не отработал. Проверьте логи job.')
    return { md: lines.join('\n'), needsAttention: true }
  }

  // Таблица оценок
  push('| Страница | ' + CATEGORIES.map(([, l]) => l).join(' | ') + ' |')
  push('| --- | ' + CATEGORIES.map(() => '---').join(' | ') + ' |')

  let needsAttention = false
  const perPage = []
  for (const { json } of reports) {
    const { url, scores } = extractScores(json)
    const row = CATEGORIES.map(([id]) => badge(scores[id]))
    push(`| \`${shortUrl(url)}\` | ${row.join(' | ')} |`)
    for (const [id] of CATEGORIES) {
      if (scores[id] != null && scores[id] < THRESHOLD) needsAttention = true
    }
    perPage.push({ url, json })
  }
  push()
  push(`_Порог внимания: **${THRESHOLD}**. Мобильный пресет. Полный HTML/JSON — в артефакте \`lighthouse-reports\`._`)
  push()

  // Рекомендации по каждой странице
  push('### 🔧 Что улучшить')
  for (const { url, json } of perPage) {
    const recs = extractRecommendations(json)
    if (recs.length === 0) continue
    push(`**\`${shortUrl(url)}\`**`)
    for (const r of recs) {
      const saving = r.savingsMs > 0 ? ` — потенциально −${Math.round(r.savingsMs)} мс` : ''
      const dv = r.displayValue ? ` (${r.displayValue})` : ''
      push(`- ${r.title}${dv}${saving}`)
    }
    push()
  }

  push('---')
  push('Если по итогам нужны правки — напишите `/oc fix` в этом issue, и агент подготовит PR.')

  return { md: lines.join('\n'), needsAttention }
}

const { md, needsAttention } = build()

// 1) Job Summary
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n')
}
// 2) Тело issue
fs.writeFileSync('issue-body.md', md + '\n')
// 3) output для шага (needs_attention)
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `needs_attention=${needsAttention}\n`)
}

console.log(md)
