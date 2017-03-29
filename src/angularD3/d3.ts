import { selection } from 'd3-selection';
import { scales } from 'd3-scale';
const format = require('d3-format');
const interpolate = require('d3-interpolate');

export default {
  arc: shape.arc,
  area: shape.area,
  brush: brush.brush,
  brushX: brush.brushX,
  brushY: brush.brushY,
  extent: array.extent,
  format: format.format,
  interpolate: interpolate.interpolate,
  line: shape.line,
  max: array.max,
  min: array.min,
  mouse: selection.mouse,
  pie: shape.pie,
  range: array.range,
  rgb: color.rgb,
  select: selection.select,
  selectAll: selection.selectAll,
  scaleBand: scales.scaleBand,
  scaleLinear: scales.scaleLinear,
  scaleOrdinal: scales.scaleOrdinal,
  scalePoint: scales.scalePoint,
  scaleQuantile: scales.scaleQuantile,
  scaleTime: scales.scaleTime,
  treemap: shape.treemap
};
