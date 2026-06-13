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
  easeCubicOut,
  easeCubicInOut,
  easeBackOut,
  easeElasticOut,
  easeBounceOut,
} from 'd3-ease'

export {
  select,
  selectAll,
  d3Drag,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  easeLinear,
  easeQuadOut,
  easeCubicOut,
  easeCubicInOut,
  easeBackOut,
  easeElasticOut,
  easeBounceOut,
}
