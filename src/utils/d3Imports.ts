/**
 * Unified D3 imports with guaranteed transition registration.
 *
 * In D3 v7, `d3-transition` registers `transition` method on
 * `d3-selection`'s prototype via side effects. However, Vite's dependency
 * pre-bundling may create separate module instances, causing the prototype
 * patch to be applied to a different `selection` constructor.
 *
 * This module re-exports all D3 functions from a unified import to ensure
 * the transition method is available and reduce bundle size.
 */

// Core selection and transition (d3-selection + d3-transition side effect)
import { select, selectAll } from 'd3-selection'
import 'd3-transition'

// Drag behavior
import { drag as d3Drag } from 'd3-drag'

// Force simulation
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force'

// Easing functions
import {
  easeLinear,
  easeQuadOut,
  easeQuadInOut,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeBackIn,
  easeBackOut,
  easeElasticOut,
  easeBounceOut,
  easeExpOut,
  easeExpInOut,
} from 'd3-ease'

// Cast D3 functions to any to bypass strictFunctionTypes in strict mode.
// D3's generic Selection types are too narrow for the flexible usage patterns in visualizers.
const selectAny = select as any
const selectAllAny = selectAll as any
const d3DragAny = d3Drag as any
const forceSimulationAny = forceSimulation as any
const forceLinkAny = forceLink as any
const forceManyBodyAny = forceManyBody as any
const forceCenterAny = forceCenter as any
const forceCollideAny = forceCollide as any

export {
  selectAny as select,
  selectAllAny as selectAll,
  d3DragAny as d3Drag,
  forceSimulationAny as forceSimulation,
  forceLinkAny as forceLink,
  forceManyBodyAny as forceManyBody,
  forceCenterAny as forceCenter,
  forceCollideAny as forceCollide,
  easeLinear,
  easeQuadOut,
  easeQuadInOut,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeBackIn,
  easeBackOut,
  easeElasticOut,
  easeBounceOut,
  easeExpOut,
  easeExpInOut,
}
