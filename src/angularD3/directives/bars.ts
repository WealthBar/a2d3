import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3Scale, D3MarginDirective } from './chart';
import * as d3 from 'd3';

@Directive({
  selector: '[d3-bars]'
})
export class D3BarsDirective extends D3Element {
  @Input() name: string;
  @Input('width') barWidth = 15;
  @Input('x') xDataName: string;
  @Input('y') yDataName: string;
  @Input('xscale') xScaleName: string;
  @Input('yscale') yScaleName: string;

  private _barsElement;
  private _xScale: D3Scale;
  private _yScale: D3Scale;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    this._barsElement = this.element.attr('class', 'bars');
  }

  redraw() {
    const data = this.data;
    const bars = this._barsElement.selectAll('rect.bar').data(data);

    bars.exit().transition().duration(500)
      .attr('y', () => this.height)
      .attr('height', 0)
      .remove();

    bars.transition().duration(500)
      .attr('x', (d: any) => this.x(d[this.xDataName]) - this.barWidth / 2)
      .attr('y', (d: any) => this.y(d[this.yDataName]))
      .attr('height', (d: any) => this.height - this.y(d[this.yDataName]))
      .attr('width', this.barWidth);

    bars.enter()
      .append('rect')
      .attr('class', (d, i) => `bar bar-${i}`)
      .attr('x', (d: any) => this.x(d[this.xDataName]) - this.barWidth / 2)
      .attr('y', () => this.height)
      .attr('height', 0)
      .attr('width', this.barWidth)
      .transition().duration(500)
      .attr('y', (d: any) => this.y(d[this.yDataName]))
      .attr('height', (d: any) => this.height - this.y(d[this.yDataName]));
  }

  private get x() {
    return (this._xScale = this._xScale
      || this.getScale(this.xScaleName || this.xDataName)).scale;
  }

  private get y() {
    return (this._yScale = this._yScale
      || this.getScale(this.yScaleName || this.yDataName)).scale;
  }
}
