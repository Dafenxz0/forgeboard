import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { repositories } from '../src/fixtures'
import { scoreRepository, summarizeBoard } from '../src/scoring'

describe('scoreRepository', () => {
  it('assigns higher risk to repositories with stale work and missing security policy', () => {
    const healthy = scoreRepository(repositories[1])
    const risky = scoreRepository(repositories[2])

    assert.equal(healthy.total > risky.total, true)
    assert.equal(risky.level, 'risk')
  })

  it('produces actionable findings', () => {
    const score = scoreRepository(repositories[2])

    assert.equal(score.findings.includes('Security policy missing'), true)
    assert.equal(score.findings.includes('Release cadence is drifting'), true)
  })
})

describe('summarizeBoard', () => {
  it('summarizes board-level work counts', () => {
    const summary = summarizeBoard(repositories)

    assert.equal(summary.repositories, 3)
    assert.equal(summary.openWork > 0, true)
    assert.equal(summary.risk > 0, true)
  })
})
