import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3Scale, D3MarginDirective } from './chart';
import * as d3 from 'd3';

@Directive({
  selector: '[d3-line]'
})
export class D3LineDirective extends D3Element {
  @Input() name: string;
  @Input() stroke: string;
  @Input('x') xDataName: any = 0;
  @Input('y') yDataName: any = 1;
  @Input('xscale') xScaleName: string;
  @Input('yscale') yScaleName: string;

  private _xScale: D3Scale;
  private _yScale: D3Scale;
  private _line;
  private _linePath;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    this._linePath = this.element.append('path');
  }

  redraw() {
    const data = this.data;
    this._line = this._line || d3.svg.line().x((d) => this.x(d)).y((d) => this.y(d));

    this._linePath.attr('class', `line line-${this.name || this.yDataName}`)
      .style('fill', 'none')
      .style('stroke', this.stroke);

    this._linePath.datum(data).transition().duration(500).attr('d', this._line);
  }

  private get xScale() {
    return (this._xScale = this._xScale
      || this.getScale(this.xScaleName || this.xDataName)).scale;
  }

  private get yScale() {
    return (this._yScale = this._yScale
      || this.getScale(this.yScaleName || this.yDataName)).scale;
  }

  private x(d) {
    return this.xScale(d[this.xDataName]);
  }

  private y(d) {
    return this.yScale(d[this.yDataName]);
  }
}
