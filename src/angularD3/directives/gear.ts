import {Optional, Directive, ElementRef} from "@angular/core";
import {D3Chart, D3Element, D3Margin} from "./chart";
import d3 = require('d3');

@Directive({
  selector: '[d3-gear]',
  inputs: [
    'weightField: weight-field',
    'innerRadiusField: inner-radius-field',
    'innerLabelField: inner-label-field',
    'innerLabelRadiusField: inner-label-radius-field',
    'outerRadiusField: outer-radius-field',
    'outerLabelField: outer-label-field',
    'outerLabelRadiusField: outer-label-radius-field',
    'duration',
    'transition',
    'anglePadding: angle-padding',
    'cornerRadiusPercentage: corner-radius-percentage',
    'color',
    'triangleColor: triangle-color',
    'colorScale: color-scale',
    'format',
    'radiusScaling: radius-scaling',
    'innerRadiusScaling: inner-radius-scaling',
    'rotation',
    'dx',
    'dy'
  ]
})
export class D3Gear extends D3Element {
  name: string;
  weightField: string;
  color: string;
  innerLabelField: string;
  innerRadiusField: string;
  innerLabelRadiusField: string;
  outerLabelField: string;
  outerRadiusField: string;
  outerLabelRadiusField: string;
  anglePadding: number = 0;
  cornerRadiusPercentage: number = 0;
  triangleColor: string;
  format: string;
  radiusScaling = .9;
  innerRadiusScaling = 0.3;
  rotation = 0;
  dx = 0;
  dy = 0;
  layout;

  private _colorScale;

  // createArcTween(arc) {
  //   return function (d) {
  //     this._current = this._current || d;
  //     let interpolate = d3.interpolate(this._current, d);
  //     this._current = d;
  //     return (t) => {
  //       return arc(interpolate(t));
  //     }
  //   }
  // }

  constructor(chart: D3Chart, el: ElementRef, @Optional() margin?: D3Margin) {
    super(chart, el, margin);
    this.element.attr("class", "gear");
  }

  get colorScale(): any {
    return this._colorScale;
  }

  set colorScale(value: any) {
    if (d3.scale[value]) this._colorScale = d3.scale[value]();
  }

  redraw() {
    let baseRadius = this.height * 0.5 * this.radiusScaling;
    let data = this.data;
    this.chart.width = this.width;
    this.chart.height = this.height;

    let xcenter = this.width / 2 + (+this.dx);
    let ycenter = this.height / 2 + (+this.dy);

    let startAngle = 0;
    let endAngle = 2 * Math.PI;

    if (this.format == 'half-left') {
      startAngle = Math.PI;
      xcenter = this.width;
    } else if (this.format == 'half-right') {
      endAngle = Math.PI;
      xcenter = 0;
    } else { // rotation only works on non half formats
      let rotationInRadians = this.rotation * Math.PI / 180;
      startAngle = rotationInRadians;
      endAngle = rotationInRadians + 2 * Math.PI;
    }

    this.element.attr("transform", `translate(${xcenter} ${ycenter})`);

    let pieData = d3.layout.pie()
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(this.anglePadding)
      .sort(null)
      .value((d) => {
        return d[this.weightField]
      })
      (data);

    let layoutData = [];
    for (let i in data) {
      let d = data[i];
      let pd = pieData[i];
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
      let midAngleDegrees = 180 * midAngleRadians / Math.PI;
      let uy = Math.sin(midAngleRadians);
      let ux = Math.cos(midAngleRadians);
      let halfPi = (Math.PI / 2);
      let lr = midAngleRadians > halfPi && midAngleRadians < 3 * halfPi;

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

      let gapSize = 0.02 * baseRadius;
      let triStart = outerR + gapSize;
      let triEnd = triStart + 0.05 * baseRadius;
      let triSize = triEnd - triStart;
      let outerLR = triEnd + gapSize;
      if (this.outerLabelRadiusField && d[this.outerLabelRadiusField]) {
        outerLR = +d[this.outerLabelRadiusField] * baseRadius;
      }
      let arc = d3.svg.arc<number>()
        .outerRadius(outerR)
        .innerRadius(innerR)
        .cornerRadius(baseRadius * this.cornerRadiusPercentage / 100.0);
      let slicePath = arc(pd);

      let tbx = triStart;
      let tbw = triSize;
      let outerLabelTrianglePath = `M ${tbx} ${-tbw} l 0 ${2 * tbw} l ${tbw} ${-tbw} z`;

      layoutData[i] = {
        index: i,
        innerR: innerR,
        innerLabel: d[this.innerLabelField],
        innerLabelX: innerLR * ux,
        innerLabelY: innerLR * uy,
        innerLabelDy: "0.35em",
        innerLabelAnchor: "middle",
        outerR: outerR,
        outerLabel: d[this.outerLabelField],
        outerLabelX: outerLR * ux,
        outerLabelY: outerLR * uy,
        outerLabelAnchor: lr ? "end" : "start",
        outerLabelDy: `${((uy + 1) / 2) * .7}em`,
        midDegrees: midAngleDegrees,
        pd: pd,
        arc: arc,
        slicePath: slicePath,
        outerLabelTrianglePath: outerLabelTrianglePath,
      };
    }

    let slices = this.element.selectAll("path.gear").data(layoutData);
    slices
      .enter()
      .append(
        "path"
      )
      .attr(
        "class",
        (d, i) => {
          return `gear gear-${i}`
        }
      )
      .attr(
        "d",
        (d, i) => {
          return d.slicePath;
        }
      )
      .attr(
        'fill', (d, i) => {
          return this.getColors(d, i)
        }
      );

    slices.exit().remove();

    let triangles = this.element.selectAll("path.gear-label-triangle").data(layoutData);
    triangles
      .enter()
      .append(
        "path"
      )
      .attr(
        "class",
        (d, i) => {
          return `gear.label-triangle gear-label-triangle-${i}`
        }
      )
      .attr(
        'transform',
        (d) => {
          return `rotate(${d.midDegrees})`;
        }
      )
      .attr(
        "d",
        (d) => {
          return d.outerLabelTrianglePath;
        }
      )
      .attr(
        'fill', this.triangleColor || "grey"
      );

    let innerLabel = this.element.selectAll("text.gear-label-inner").data(layoutData);
    innerLabel.enter()
      .append('text')

      .attr(
        'class',
        (d, i) => {
          return `gear-label-inner gear-label-inner-${i}`;
        }
      )
      .attr('text-anchor',
        (d) => {
          return d.innerLabelAnchor;
        }
      )
      .attr(
        'dy',
        (d) => {
          return d.innerLabelDy;
        }
      )
      .attr(
        'transform',
        (d) => {
          return `translate(${d.innerLabelX},${d.innerLabelY})`;
        }
      )
      .text(
        (d) => {
          return d.innerLabel;
        }
      );

    innerLabel.exit().remove();


    let outerLabel = this.element.selectAll("text.gear-label-outer").data(layoutData);
    outerLabel.enter()
      .append("text")
      .attr(
        "class",
        (d, i) => {
          return `gear-label-outer gear-label-outer-${i}`;
        }
      )
      .attr('text-anchor',
        (d) => {
          return d.outerLabelAnchor;
        }
      )
      .attr(
        "class",
        (d, i) => {
          return `gear-label-outer gear-label-outer-${i}`;
        }
      )
      .attr(
        "dy",
        (d) => {
          return d.outerLabelDy;
        }
      )
      .attr(
        'transform',
        (d) => {
          return `translate(${d.outerLabelX},${d.outerLabelY})`;
        }
      )
      .text(
        (d) => {
          return d.outerLabel
        }
      );

    outerLabel.exit().remove();

    this.layout = layoutData;
  }

  private getColors(d, i) {
    if (this.colorScale) return this.colorScale(i);
    if (this.color) return d[this.color];
    if (d.color) return d.color;
  }

  private spaceOut(values, selector) {
    values = values.sort((a, b) => {
      return selector(a) - selector(b)
    });
    for (let i = values.length - 1; i >= 3; i -= 2) {
      values = values.slice(1, i).concat(values[0], values.slice(i));
    }
    return values;
  }
}
