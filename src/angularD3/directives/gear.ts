import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3MarginDirective } from './chart';
import * as d3 from 'd3';

@Directive({
  selector: '[d3-gear]'
})
export class D3GearDirective extends D3Element {
  @Input() duration;
  @Input() transition;
  name: string;
  @Input('weight-field') weightField: string;
  @Input() color: string;
  @Input('inner-label-field') innerLabelField: string;
  @Input('inner-radius-field') innerRadiusField: string;
  @Input('inner-label-radius-field') innerLabelRadiusField: string;
  @Input('outer-label-field') outerLabelField: string;
  @Input('outer-radius-field') outerRadiusField: string;
  @Input('outer-label-radius-field') outerLabelRadiusField: string;
  @Input('angle-padding') anglePadding = 0;
  @Input('corner-radius-percentage') cornerRadiusPercentage = 0;
  @Input('triangle-color') triangleColor: string;
  @Input() format: string;
  @Input('radius-scaling') radiusScaling = .9;
  @Input('inner-radius-scaling') innerRadiusScaling = 0.3;
  @Input() rotation = 0;
  @Input() dx = 0;
  @Input() dy = 0;
  layout;

  private _colorScale;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    this.element.attr('class', 'gear');
  }

  @Input('color-scale')
  get colorScale(): any {
    return this._colorScale;
  }

  set colorScale(value: any) {
    if (d3.scale[value]) {
      this._colorScale = d3.scale[value]();
    }
  }

  redraw() {
    const baseRadius = this.height * 0.5 * this.radiusScaling;
    const data = this.data;

    if (this.width > 0 && this.height > 0) {
      this.chart.width = this.width;
      this.chart.height = this.height;
    }

    if (this.chart.width === 0 || this.chart.height === 0) {
      return;
    }

    let xcenter = this.chart.width / 2 + (+this.dx);
    const ycenter = this.chart.height / 2 + (+this.dy);

    let startAngle = 0;
    let endAngle = 2 * Math.PI;

    if (this.format === 'half-left') {
      startAngle = Math.PI;
      xcenter = this.chart.width;
    } else if (this.format === 'half-right') {
      endAngle = Math.PI;
      xcenter = 0;
    } else { // rotation only works on non half formats
      const rotationInRadians = this.rotation * Math.PI / 180;
      startAngle = rotationInRadians;
      endAngle = rotationInRadians + 2 * Math.PI;
    }

    this.element.attr('transform', `translate(${xcenter}, ${ycenter})`);

    const pieData = d3.layout.pie()
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(this.anglePadding)
      .sort(null)
      .value(d => d[this.weightField])(data);

    const layoutData = [];

    for (const i in data) {
      const d = data[i];
      const pd = pieData[i];

      if (pd.startAngle < 0) {
        pd.startAngle += 2 * Math.PI;
      }

      if (pd.endAngle < 0) {
        pd.endAngle -= 2 * Math.PI;
      }

      let midAngleRadians = ((pd.startAngle + pd.endAngle) / 2) - Math.PI / 2;

      if (midAngleRadians < 0) {
        midAngleRadians += 2 * Math.PI;
      }

      const midAngleDegrees = 180 * midAngleRadians / Math.PI;
      const uy = Math.sin(midAngleRadians);
      const ux = Math.cos(midAngleRadians);
      const halfPi = Math.PI / 2;
      const lr = midAngleRadians > halfPi && midAngleRadians < 3 * halfPi;

      let innerR = this.innerRadiusScaling * baseRadius;
      if (this.innerRadiusField && d[this.innerRadiusField]) {
        innerR = +d[this.innerRadiusField] * baseRadius;
      }

      let outerR = baseRadius;
      if (this.outerRadiusField && d[this.outerRadiusField]) {
        outerR = +d[this.outerRadiusField] * baseRadius;
      }

      let innerLR = (innerR + outerR) / 2;

      if (this.innerLabelRadiusField && d[this.innerLabelRadiusField]) {
        innerLR = +d[this.innerLabelRadiusField] * baseRadius;
      }

      const gapSize = 0.02 * baseRadius;
      const triStart = outerR + gapSize;
      const triEnd = triStart + 0.05 * baseRadius;
      const triSize = triEnd - triStart;
      let outerLR = triEnd + gapSize;
      if (this.outerLabelRadiusField && d[this.outerLabelRadiusField]) {
        outerLR = +d[this.outerLabelRadiusField] * baseRadius;
      }
      const arc = d3.svg.arc<number>()
        .outerRadius(outerR)
        .innerRadius(innerR)
        .cornerRadius(baseRadius * this.cornerRadiusPercentage / 100.0);
      const slicePath = arc(pd);

      const tbx = triStart;
      const tbw = triSize;
      const outerLabelTrianglePath = `M ${tbx} ${-tbw} l 0 ${2 * tbw} l ${tbw} ${-tbw} z`;

      layoutData[i] = {
        index: i,
        innerR: innerR,
        innerLabel: d[this.innerLabelField],
        innerLabelX: innerLR * ux,
        innerLabelY: innerLR * uy,
        innerLabelDy: '0.35em',
        innerLabelAnchor: 'middle',
        outerR: outerR,
        outerLabel: d[this.outerLabelField],
        outerLabelX: outerLR * ux,
        outerLabelY: outerLR * uy,
        outerLabelAnchor: lr ? 'end' : 'start',
        outerLabelDy: `${((uy + 1) / 2) * .7}em`,
        midDegrees: midAngleDegrees,
        pd: pd,
        arc: arc,
        slicePath: slicePath,
        outerLabelTrianglePath: outerLabelTrianglePath,
      };
    }

    const slices = this.element.selectAll('path.gear').data(layoutData);
    slices
      .enter()
      .append('path')
      .attr('class', (d, i) => `gear gear-${i}`)
      .attr('d', (d, i) => d.slicePath)
      .attr('fill', (d, i) => this.getColors(d, i));

    slices.exit().remove();

    const triangles = this.element.selectAll('path.gear-label-triangle').data(layoutData);
    triangles
      .enter()
      .append('path')
      .attr('class', (d, i) => `gear-label-triangle gear-label-triangle-${i}`)
      .attr('transform', d => `rotate(${d.midDegrees})`)
      .attr('d', d => d.outerLabelTrianglePath)
      .attr('fill', this.triangleColor || 'grey');

    const innerLabel = this.element.selectAll('text.gear-label-inner').data(layoutData);
    innerLabel.enter()
      .append('text')
      .attr('class', (d, i) => `gear-label-inner gear-label-inner-${i}`)
      .attr('text-anchor', d => d.innerLabelAnchor)
      .attr('dy', d => d.innerLabelDy)
      .attr('transform', d => `translate(${d.innerLabelX}, ${d.innerLabelY})`)
      .text(d => d.innerLabel);

    innerLabel.exit().remove();

    const outerLabel = this.element.selectAll('text.gear-label-outer').data(layoutData);
    outerLabel.enter()
      .append('text')
      .attr('class', (d, i) => `gear-label-outer gear-label-outer-${i}`)
      .attr('text-anchor', d => d.outerLabelAnchor)
      .attr('class', (d, i) => `gear-label-outer gear-label-outer-${i}`)
      .attr('dy', d => d.outerLabelDy)
      .attr('transform', d => `translate(${d.outerLabelX}, ${d.outerLabelY})`)
      .text(d => d.outerLabel);

    outerLabel.exit().remove();

    this.layout = layoutData;
  }

  private getColors(d, i) {
    if (this.colorScale) {
      return this.colorScale(i);
    }

    if (this.color) {
      return d[this.color];
    }

    if (d.color) {
      return d.color;
    }
  }
}
