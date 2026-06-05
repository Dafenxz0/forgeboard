import type { BoardSummary, RepoScore, RepoSnapshot, SignalLevel } from './domain'

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function scoreRepository(repo: RepoSnapshot): RepoScore {
  const maintainerLoad = clamp(
    100
      - repo.unansweredIssues * 5
      - repo.staleIssues * 4
      - repo.openPullRequests * 2
      - repo.failingChecks * 8,
  )

  const releaseReadiness = clamp(
    100
      - Math.max(0, repo.daysSinceRelease - 30) * 0.7
      - repo.failingChecks * 12
      - repo.dependencyAlerts * 5,
  )

  const securityPosture = clamp(
    100
      - (repo.securityPolicy ? 0 : 22)
      - repo.dependencyAlerts * 9
      - repo.work.filter((item) => item.type === 'security' && item.severity === 'risk').length * 14,
  )

  const automation = clamp(100 - (repo.ciConfigured ? 0 : 35) - repo.failingChecks * 15)
  const total = clamp(
    maintainerLoad * 0.28 + releaseReadiness * 0.25 + securityPosture * 0.27 + automation * 0.2,
  )

  return {
    total,
    level: levelFor(total),
    releaseReadiness,
    maintainerLoad,
    securityPosture,
    automation,
    findings: findings(repo),
  }
}

export function summarizeBoard(repositories: RepoSnapshot[]): BoardSummary {
  const scored = repositories.map(scoreRepository)
  return {
    repositories: repositories.length,
    healthy: scored.filter((score) => score.level === 'healthy').length,
    watch: scored.filter((score) => score.level === 'watch').length,
    risk: scored.filter((score) => score.level === 'risk').length,
    openWork: repositories.reduce((sum, repo) => sum + repo.work.length, 0),
    staleWork: repositories.reduce(
      (sum, repo) => sum + repo.work.filter((item) => item.ageDays >= 14).length,
      0,
    ),
  }
}

function levelFor(score: number): SignalLevel {
  if (score >= 78) return 'healthy'
  if (score >= 55) return 'watch'
  return 'risk'
}

function findings(repo: RepoSnapshot): string[] {
  const notes: string[] = []

  if (!repo.securityPolicy) notes.push('Security policy missing')
  if (!repo.ciConfigured) notes.push('CI workflow not detected')
  if (repo.failingChecks > 0) notes.push(`${repo.failingChecks} failing check suite(s)`)
  if (repo.dependencyAlerts > 0) notes.push(`${repo.dependencyAlerts} dependency alert(s)`)
  if (repo.unansweredIssues > 0) notes.push(`${repo.unansweredIssues} unanswered issue(s)`)
  if (repo.daysSinceRelease > 60) notes.push('Release cadence is drifting')

  return notes.length > 0 ? notes : ['No immediate maintainer risks detected']
}
