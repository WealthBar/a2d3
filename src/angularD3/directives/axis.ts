import { Input, Host, Directive, ElementRef, Optional } from '@angular/core';
import { D3ChartDirective, D3MarginDirective, D3Element, D3Scale } from './chart';
import * as d3 from 'd3';
import * as cloneDeep from 'lodash/fp/cloneDeep';

@Directive({
  selector: '[d3-axis]'
})
export class D3AxisDirective extends D3Element implements D3Scale {
  @Input() name: string;
  @Input() format: string;
  @Input('time-format') timeFormat: string;
  @Input('time-scale') timeScale: string;
  @Input('time-interval') timeInterval: string;
  @Input('tick-size') tickSize: string;
  @Input('tick-dx') tickDx: string;
  @Input('tick-dy') tickDy: string;
  @Input('tick-anchor') tickAnchor: string;
  @Input('first-tick-dx') firstTickDx: string;
  @Input('first-tick-dy') firstTickDy: string;
  @Input('first-tick-anchor') firstTickAnchor: string;
  @Input('last-tick-dx') lastTickDx: string;
  @Input('last-tick-dy') lastTickDy: string;
  @Input('last-tick-anchor') lastTickAnchor: string;

  @Input('custom-time-format') customTimeFormat: any[];
  @Input('tick-values') tickValues: any[];
  @Input() filter: Function;
  @Input() orientation = 'bottom';
  @Input() reverse = false;
  @Input() extent = false;
  @Input() ticks = 5;

  private _label: string;
  private _labelElement;
  private _axisElement;
  private _grid;
  private _gridElement;
  private _scale: any = d3.scale.linear();

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    chart.addScale(this);
  }

  redraw() {
    const data = this.data;

    if (!data || !data.length) {
      return;
    }

    this.updateAxis();
    this.updateLabel();
    this.updateGrid();

    if (!data || data.length < 0) {
      return;
    }

    const scale = this._scale;
    scale.range(this.range);
    const domain = this.filter ? this.filter(data) : data.map(d => d[this.name]);

    if (this.extent) {
      scale.domain(d3.extent(domain));
    } else {
      scale.domain([0, d3.max(domain)]);
    }
  }

  @Input()
  get scale(): string {
    return this._scale;
  }
  set scale(value: string) {
    if (value === 'time') {
      this._scale = d3.time.scale();
    } else if (value) {
      this._scale = d3.scale[value]();
    } else {
      this._scale = d3.scale.linear();
    }
  }

  @Input()
  get grid() {
    return this._grid;
  }
  set grid(value) {
    this._grid = (value === 'true' || value === true);
    this.updateGrid();
  }

  @Input()
  get label(): string {
    return this._label;
  }
  set label(value: string) {
    this._label = value;

    if (this._labelElement) {
      this._labelElement.text(value);
    }
  }

  private get range(): [number, number] {
    let range;

    if (this.orientation === 'top' || this.orientation === 'bottom') {
      range = [0, this.width];
    } else {
      range = [this.height, 0];
    }

    if (this.reverse) {
      range = range.reverse();
    }

    return range;
  }

  private get translation(): string {
    return {
      'bottom': `translate(0, ${this.height})`,
      'right': `translate(${this.width}, 0)`
    }[this.orientation] || 'translate(0, 0)';
  }

  private createAxis() {
    const axis = d3.svg.axis().scale(this.scale).orient(this.orientation);

    if (this.ticks) {
      axis.ticks(this.ticks);
    }

    if (this.timeScale) {
      axis.ticks(d3.time[this.timeScale], this.timeInterval);
    }

    if (this.tickValues) {
      axis.tickValues(this.tickValues);
    }

    if (this.tickSize) {
      const tickSize = this.tickSize.split(',');
      axis.innerTickSize(+tickSize[0]);
      axis.outerTickSize(+tickSize[1]);
    }

    if (this.customTimeFormat) {
      // We copy this because D3 is bad and mutates the time format.
      // See: https://github.com/mbostock/d3/issues/1769
      const copy = cloneDeep(this.customTimeFormat);
      const mf = d3.time.format.multi(copy);
      axis.tickFormat(d => mf(new Date(d)));
    }

    if (this.timeFormat) {
      const tf = d3.time.format(this.timeFormat);
      axis.tickFormat(d => tf(new Date(d)));
    } else if (this.format) {
      axis.tickFormat(d3.format(this.format));
    }

    return axis;
  }

  private adjustTickLabels(axis) {
    const tickLabels = axis.selectAll('.tick text');
    if (this.tickDy) {
      tickLabels.attr('dy', this.tickDy);
    }

    if (this.tickDx) {
      tickLabels.attr('dx', this.tickDx);
    }

    if (this.tickAnchor) {
      tickLabels.style('text-anchor', this.tickAnchor);
    }

    const lastTickLabels = d3.select(tickLabels[0].slice(-1)[0]);
    if (this.lastTickDy) {
      lastTickLabels.attr('dy', this.lastTickDy);
    }

    if (this.lastTickDx) {
      lastTickLabels.attr('dx', this.lastTickDx);
    }

    if (this.lastTickAnchor) {
      lastTickLabels.style('text-anchor', this.lastTickAnchor);
    }

    const firstTickLabels = d3.select(tickLabels[0][0]);
    if (this.firstTickDy) {
      firstTickLabels.attr('dy', this.firstTickDy);
    }

    if (this.firstTickDx) {
      firstTickLabels.attr('dx', this.firstTickDx);
    }

    if (this.firstTickAnchor) {
      firstTickLabels.style('text-anchor', this.firstTickAnchor);
    }
  }

  private updateAxis() {
    if (!this._axisElement) {
      this._axisElement = this.element.append('g');
    }

    const axis = this._axisElement;

    axis.attr('class', `axis axis-${this.orientation} axis-${this.name}`)
      .attr('transform', this.translation)
      .call(this.createAxis());

    this.adjustTickLabels(axis);
  }

  private updateLabel() {
    if (!this._axisElement) {
      return;
    }

    if (!this._labelElement) {
      this._labelElement = this._axisElement
        .append('text')
        .attr('class', 'axis-label');
    }

    this._labelElement.text(this._label);
    this.positionLabel(this._labelElement);
  }

  private positionLabel(label) {
    switch (this.orientation) {
      case 'bottom':
        label.attr('x', `${this.width / 2}`)
          .attr('dy', `${this.margin.bottom}`)
          .attr('style', 'text-anchor: middle;');
        break;

      case 'top':
        label.attr('x', `${this.width / 2}`)
          .attr('dy', `${-this.margin.top}`)
          .attr('style', 'text-anchor: middle;');
        break;

      case 'left':
        label.attr('x', `${(this.height / 2) * -1}`)
          .attr('dy', `${-this.margin.left + 18}`)
          .attr('style', 'text-anchor: middle;')
          .attr('transform', 'rotate(-90)');
        break;

      case 'right':
        label.attr('x', `${this.height / 2}`)
          .attr('dy', `${-this.margin.right + 18}`)
          .attr('style', 'text-anchor: middle;')
          .attr('transform', 'rotate(90)');
        break;
    }
  }

  private updateGrid() {
    if (this._grid && this._axisElement) {
      this._gridElement = this._gridElement || this.element.append('g')
        .attr('class', `axis-grid axis-grid-${this.name}`);
      this.drawGrid();
    } else if (this._gridElement) {
      this._gridElement.remove();
      this._gridElement = null;
    }
  }

  private drawGrid() {
    let size;
    let transform;

    switch (this.orientation) {
      case 'bottom':
        size = this.height;
        break;

      case 'top':
        transform = `translate(0, ${this.height})`;
        size = this.height;
        break;

      case 'left':
        transform = `translate(${this.width}, 0)`;
        size = this.width;
        break;

      case 'right':
        size = this.width;
        break;
    }

    if (transform) {
      this._gridElement.attr('transform', transform);
    }
    const axis = this.createAxis().innerTickSize(size).outerTickSize(0).tickFormat('');
    this._gridElement.call(axis);
  }
}
