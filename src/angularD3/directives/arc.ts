import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3MarginDirective } from './chart';
import { D3PieBase } from './pie';
import * as d3 from 'd3';

@Directive({
  selector: '[d3-arc]'
})
export class D3ArcDirective extends D3PieBase {
  @Input() name: string;
  @Input() transition = 'ease';
  @Input() duration = 500;
  @Input() value = 'value';
  @Input() label = 'label';
  @Input() dy = '0.35em';
  @Input('text-anchor') textAnchor = 'middle';
  @Input('inner-radius') innerRadius = 0.6;
  @Input('label-radius') labelRadius = 0;

  private _center;
  private _arc;
  private _label;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    this._center = d3.select(el.nativeElement).attr('class', 'arc');
    this._arc = this._center.append('path').attr('class', 'arc');
    this._label = this._center.append('text').attr('class', 'arc-label');
  }

  redraw() {
    super.redraw();
    const data = this.data;
    const radius = this.radius;
    const arc = this.createArc(radius);
    const arcTween = this.createArcTween(arc, 0);

    this._center.attr('transform', `translate(${radius},${radius})`);

    this._label.attr('dy', this.dy).style('text-anchor', 'middle').text(data[this.label]);

    this._arc.datum(data[this.value])
      .transition().ease(this.transition).duration(this.duration)
      .attrTween('d', arcTween);
  }

  createArc(radius: number) {
     return super.createArc(radius).startAngle(0)
      .endAngle(d => (d / 100) * 2 * Math.PI);
  }
}
