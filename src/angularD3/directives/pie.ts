import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3MarginDirective } from './chart';
import * as d3 from 'd3';

export class D3PieBase extends D3Element {
  innerRadius = 0;
  labelRadius = 0.7;
  radiusAttr: string;

  get radius() {
    if (this.radiusAttr === 'height') {
      return (this.height - this.verticalPadding) / 2;
    } else {
      return (this.width - this.horizontalPadding) / 2;
    }
  }

  createArc(radius: number) {
    return d3.svg.arc<any>()
      .outerRadius(radius)
      .innerRadius(radius * this.innerRadius);
  }

  createLabelArc(radius, offset = 0) {
    return d3.svg.arc<any>()
      .outerRadius(radius * this.labelRadius + offset)
      .innerRadius(radius * this.labelRadius + offset);
  }

  createArcTween(arc, initial = null) {
    return function (d) {
      if (this._current == null) {
        this._current = initial != null ? initial : d;
      }

      const i = d3.interpolate(this._current, d);
      this._current = d;

      return (t) => arc(i(t));
    };
  }

  redraw() {
    if (this.radiusAttr === 'height') {
      //noinspection JSSuspiciousNameCombination
      this.chart.width = this.height;
      this.chart.height = this.height;
    } else {
      //noinspection JSSuspiciousNameCombination
      this.chart.height = this.width;
      this.chart.width = this.width;
    }
  }
}

@Directive({
  selector: '[d3-pie]'
})
export class D3PieDirective extends D3PieBase implements D3Element {
  @Input() name: string;
  @Input() transition = 'ease';
  @Input() duration = 500;
  @Input() value = 'value';
  @Input() label = 'label';
  @Input('inner-radius') innerRadius: number;
  @Input('label-radius') labelRadius: number;
  @Input('label-offset') labelOffset = 12;
  @Input('text-anchor') textAnchor = 'middle';
  @Input() color: string;
  @Input('avoid-collisions') avoidCollisions: boolean;

  dy = '0.35em';
  pie = d3.layout.pie().sort(null).value(d => d[this.value]);

  private _center;
  private _colorScale;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    this._center = this.element.attr('class', 'pie');
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
    const data = this.data;
    super.redraw();
    const radius = this.radius;
    const arc = this.createArc(radius);
    const arcTween = this.createArcTween(arc);

    this._center.attr('transform', `translate(${radius}, ${radius})`);

    const slices = this._center.selectAll('path.pie').data(this.pie(data));
    slices.enter().append('path')
      .attr('class', (d, i) => `pie pie-${i}`)
      .attr('d', arc);

    slices.style('fill', (d, i) => this.getColors(d, i))
      .attr('class', (d, i) => `pie pie-${i}`);

    slices.transition().ease(this.transition).duration(this.duration)
      .attrTween('d', arcTween);

    slices.exit().remove();

    if (this.label) {
      const label = this._center.selectAll('text').data(this.pie(data));

      label.enter().append('text')
        .attr('class', (d, i) => `pie-label pie-label-${i}`);

      label.style('text-anchor', this.textAnchor)
        .attr('class', (d, i) => `pie-label pie-label-${i}`)
        .text((d, i) => d.data[this.label]);

      label.transition().ease(this.transition).duration(this.duration)
        .attr('transform', this.getLabelPosition(radius));

      label.exit().remove();
    }
  }

  private getLabelPosition(radius) {
    const padding = +this.labelOffset;
    const avoidCollisions = this.avoidCollisions;
    const labelArc = this.createLabelArc(radius);
    let prevbb;

    return function (d) {
      let position = labelArc.centroid(d);
      if (avoidCollisions) {
        const relativePosition = [position[0], position[1]];

        if (this._position) {
          relativePosition[0] -= this._position[0];
          relativePosition[1] -= this._position[1];
        }

        const bb = this.getBoundingClientRect();
        const thisbb = {
          left: bb.left + (relativePosition[0] - padding),
          top: bb.top + (relativePosition[1] - padding),
          right: bb.right + relativePosition[0] + padding,
          bottom: bb.bottom + relativePosition[1] + padding,
        };

        const hasCollision = !(thisbb.right < prevbb.left
          || thisbb.left > prevbb.right
          || thisbb.bottom < prevbb.top
          || thisbb.top > prevbb.bottom);

        if (prevbb && hasCollision) {
          const ctx = thisbb.left + (thisbb.right - thisbb.left) / 2;
          const cty = thisbb.top + (thisbb.bottom - thisbb.top) / 2;
          const cpx = prevbb.left + (prevbb.right - prevbb.left) / 2;
          const cpy = prevbb.top + (prevbb.bottom - prevbb.top) / 2;
          const offset = Math.sqrt(Math.pow(ctx - cpx, 2) + Math.pow(cty - cpy, 2)) / 2;
          const offsetArc = this.createLabelArc(radius, offset);
          position = offsetArc.centroid(d);
        }

        this._position = position;
        prevbb = thisbb;
      }
      return `translate(${position})`;
    };
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
