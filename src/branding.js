// Branch → accent hue. Known branches get their canonical color; new branches
// added by the curator fall back to a warm amber so they stay legible.
const BRANCH_COLORS = {
  Math: '#5cc8ff',
  Physics: '#a78bfa',
  Chemistry: '#4ade9c',
}

export const branchColor = (branch) => BRANCH_COLORS[branch] ?? '#fbbf24'
