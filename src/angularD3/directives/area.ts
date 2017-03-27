import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3Scale, D3MarginDirective } from './chart';
import * as d3 from 'd3';

@Directive({
  selector: '[d3-area]'
})
export class D3AreaDirective extends D3Element {
  @Input() name: string;
  @Input() vertical: boolean;
  @Input('x') xDataName: string;
  @Input('y') yDataName: string;
  @Input('yscale') yScaleName: string;
  @Input('xscale') xScaleName: string;
  @Input() offset: any;
  @Input() stroke;

  private _areaElement;
  private _columns;
  private _xScale: D3Scale;
  private _yScale: D3Scale;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    this._areaElement = this.element.attr('class', 'area');
  }

  @Input()
  get columns() {
    if (this._columns) {
      return this._columns;
    } else {
      return [this.yDataName];
    }
  }
  set columns(value) {
    if (value instanceof String) {
      value = value.split(',').map(v => v.trim());
    }

    if (Array.isArray(value)) {
      this._columns = value;
      this.redraw();
    }
  }

  redraw() {
    const data = this.data;
    const stack = d3.layout.stack();

    if (this.offset) {
      stack.offset(this.offset);
    }

    stack.values((d: any) => d.values);

    const stackedData = stack(this.mapColumns(data));

    const area = this.getArea();
    const nullArea = this.getNullArea();
    const elements = this._areaElement.selectAll('path.area').data(stackedData);
    elements.enter()
      .append('path').attr('class', d => `area area-${d.name}`)
      .attr('d', nullArea);

    elements.transition().duration(500)
      .attr('class', d => `area area-${d.name}`)
      .attr('d', area);

    elements.exit()
      .transition().duration(500)
      .attr('d', nullArea)
      .remove();
  }

  private getNullArea() {
    const area = d3.svg.area<any>()
      .x((d, i) => this.x(d.x))
      .y0(() => this.height)
      .y1(() => this.height);

    const areaStacked = d3.svg.area<any>()
      .x(d => this.x(d.x))
      .y0(d => this.y(d.y0))
      .y1(d => this.y(d.y0));

    return (d, i) => {
      if (i === 0) {
        return area(d.values);
      } else {
        return areaStacked(d.values);
      }
    };
  }

  private getArea() {
    let area;
    let areaStacked;

    if (this.vertical) {
      area = d3.svg.area<any>()
        .y(d => this.x(d.x))
        .x0(0)
        .x1(d => this.y(d.y));

      areaStacked = d3.svg.area<any>()
        .y(d => this.x(d.x))
        .x0(d => this.y(d.y0))
        .x1(d => this.y(d.y + d.y0));
    } else {
      area = d3.svg.area<any>()
        .x(d => this.x(d.x))
        .y0(() => this.height)
        .y1(d => this.y(d.y));

      areaStacked = d3.svg.area<any>()
        .x(d => this.x(d.x))
        .y0(d => this.y(d.y0))
        .y1(d => this.y(d.y + d.y0));
    }

    return (d, i) => {
      if (i === 0) {
        return area(d.values);
      } else {
        return areaStacked(d.values);
      }
    };
  }

  private mapColumns(data) {
    return this.columns.map(c => ({
      name: c,
      values: this.mapValues(data, c)
    }));
  }

  private mapValues(data, c) {
    return data.map(d => ({
      x: d[this.xDataName],
      y: d[c]
    }));
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
