import { describe, it, expect } from 'vitest'
import * as d3Imports from '../../utils/d3Imports'

describe('d3Imports basic', () => {
  it('should have select function', () => {
    expect(typeof d3Imports.select).toBe('function')
  })

  it('should have d3Drag function', () => {
    expect(typeof d3Imports.d3Drag).toBe('function')
  })

  it('should have forceSimulation function', () => {
    expect(typeof d3Imports.forceSimulation).toBe('function')
  })
})
