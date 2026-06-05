import './style.css'
import { repositories } from './fixtures'
import { scoreRepository, summarizeBoard } from './scoring'
import type { WorkItem } from './domain'

type ViewMode = 'overview' | 'risks' | 'release'

let selectedRepo = repositories[0]
let mode: ViewMode = 'overview'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root not found')
}

const root = app

function render() {
  const board = summarizeBoard(repositories)
  const selectedScore = scoreRepository(selectedRepo)
  const visibleWork = workForMode(selectedRepo.work, mode)

  root.innerHTML = `
    <main class="shell">
      <aside class="sidebar" aria-label="Repository list">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">F</div>
          <div>
            <h1>Forgeboard</h1>
            <p>Maintainer command surface</p>
          </div>
        </div>

        <section class="summary-grid" aria-label="Board summary">
          ${metric('Repos', board.repositories)}
          ${metric('Healthy', board.healthy)}
          ${metric('Watch', board.watch)}
          ${metric('At risk', board.risk)}
        </section>

        <div class="repo-list">
          ${repositories
            .map((repo) => {
              const score = scoreRepository(repo)
              const active = repo.name === selectedRepo.name ? 'is-active' : ''
              return `
                <button class="repo-row ${active}" data-repo="${repo.name}" type="button">
                  <span>
                    <strong>${repo.owner}/${repo.name}</strong>
                    <small>${repo.openIssues} issues · ${repo.openPullRequests} PRs</small>
                  </span>
                  <b class="score score-${score.level}">${score.total}</b>
                </button>
              `
            })
            .join('')}
        </div>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">${selectedRepo.owner}/${selectedRepo.name}</p>
            <h2>${selectedRepo.description}</h2>
          </div>
          <div class="actions">
            <button class="ghost-button" data-action="export" type="button">Export JSON</button>
            <button class="primary-button" data-action="sync" type="button">Run local scan</button>
          </div>
        </header>

        <section class="score-band level-${selectedScore.level}">
          <div>
            <p>Repository score</p>
            <strong>${selectedScore.total}</strong>
          </div>
          ${pillar('Maintainer load', selectedScore.maintainerLoad)}
          ${pillar('Release readiness', selectedScore.releaseReadiness)}
          ${pillar('Security posture', selectedScore.securityPosture)}
          ${pillar('Automation', selectedScore.automation)}
        </section>

        <nav class="segmented" aria-label="View mode">
          ${segment('overview', 'Overview')}
          ${segment('risks', 'Risk queue')}
          ${segment('release', 'Release room')}
        </nav>

        <section class="content-grid">
          <div class="panel panel-main">
            <div class="panel-heading">
              <h3>${panelTitle(mode)}</h3>
              <span>${visibleWork.length} item(s)</span>
            </div>
            <div class="work-list">
              ${visibleWork.map(workItem).join('')}
            </div>
          </div>

          <div class="panel">
            <div class="panel-heading">
              <h3>Findings</h3>
              <span>${selectedScore.level}</span>
            </div>
            <ul class="findings">
              ${selectedScore.findings.map((finding) => `<li>${finding}</li>`).join('')}
            </ul>
          </div>

          <div class="panel">
            <div class="panel-heading">
              <h3>Release track</h3>
              <span>${selectedRepo.releaseCandidate}</span>
            </div>
            <div class="release-stack">
              ${releaseFact('Last release', `${selectedRepo.daysSinceRelease} days ago`)}
              ${releaseFact('Last commit', `${selectedRepo.daysSinceCommit} days ago`)}
              ${releaseFact('Dependency alerts', selectedRepo.dependencyAlerts.toString())}
              ${releaseFact('Failing checks', selectedRepo.failingChecks.toString())}
            </div>
          </div>
        </section>
      </section>
    </main>
  `

  bindEvents()
}

function bindEvents() {
  root.querySelectorAll<HTMLButtonElement>('[data-repo]').forEach((button) => {
    button.addEventListener('click', () => {
      const repo = repositories.find((candidate) => candidate.name === button.dataset.repo)
      if (repo) {
        selectedRepo = repo
        render()
      }
    })
  })

  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.dataset.mode as ViewMode
      render()
    })
  })

  root.querySelector<HTMLButtonElement>('[data-action="export"]')?.addEventListener('click', () => {
    const payload = {
      repository: selectedRepo,
      score: scoreRepository(selectedRepo),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${selectedRepo.name}-forgeboard.json`
    anchor.click()
    URL.revokeObjectURL(url)
  })
}

function metric(label: string, value: number) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`
}

function pillar(label: string, value: number) {
  return `
    <div class="pillar">
      <span>${label}</span>
      <strong>${value}</strong>
      <div class="bar"><i style="width:${value}%"></i></div>
    </div>
  `
}

function segment(value: ViewMode, label: string) {
  const active = mode === value ? 'is-selected' : ''
  return `<button class="${active}" data-mode="${value}" type="button">${label}</button>`
}

function workForMode(work: WorkItem[], currentMode: ViewMode) {
  if (currentMode === 'risks') return work.filter((item) => item.severity !== 'healthy')
  if (currentMode === 'release') return work.filter((item) => item.type === 'release' || item.type === 'pull-request')
  return work
}

function panelTitle(currentMode: ViewMode) {
  if (currentMode === 'risks') return 'Risk queue'
  if (currentMode === 'release') return 'Release room'
  return 'Maintainer queue'
}

function workItem(item: WorkItem) {
  return `
    <article class="work-item">
      <div>
        <span class="badge badge-${item.severity}">${item.label}</span>
        <h4>${item.title}</h4>
        <p>${item.id} · ${item.ageDays} day(s) open · ${item.type}</p>
      </div>
      <span class="level-dot level-${item.severity}" aria-label="${item.severity}"></span>
    </article>
  `
}

function releaseFact(label: string, value: string) {
  return `<div class="release-fact"><span>${label}</span><strong>${value}</strong></div>`
}

render()
