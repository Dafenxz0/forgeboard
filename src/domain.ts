export type SignalLevel = 'healthy' | 'watch' | 'risk'

export type WorkItemType = 'issue' | 'pull-request' | 'release' | 'security'

export interface WorkItem {
  id: string
  type: WorkItemType
  title: string
  ageDays: number
  severity: SignalLevel
  label: string
}

export interface RepoSnapshot {
  owner: string
  name: string
  description: string
  stars: number
  openIssues: number
  openPullRequests: number
  staleIssues: number
  unansweredIssues: number
  failingChecks: number
  daysSinceRelease: number
  daysSinceCommit: number
  securityPolicy: boolean
  ciConfigured: boolean
  dependencyAlerts: number
  releaseCandidate: string
  work: WorkItem[]
}

export interface RepoScore {
  total: number
  level: SignalLevel
  releaseReadiness: number
  maintainerLoad: number
  securityPosture: number
  automation: number
  findings: string[]
}

export interface BoardSummary {
  repositories: number
  healthy: number
  watch: number
  risk: number
  openWork: number
  staleWork: number
}
