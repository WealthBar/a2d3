import { Input, Directive, Optional, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';

export interface ID3Element {
  redraw(): void;
}

export interface D3Scale {
  name: string;
  scale;
  redraw(): void;
}

/*
 * Directive
 * D3Chart is the base element in building charts with AngularD3
 * <d3-chart></d3-chart>
 */
@Directive({
  selector: '[d3-chart]'
})
export class D3ChartDirective implements OnInit {
  element: any;
  chart: any;
  scales: D3Scale[] = [];
  elements: ID3Element[] = [];

  private _data: {}[];

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
    this.chart = d3.select(this.element).attr('class', 'd3-chart');
    window.addEventListener('resize', () => this.redraw());
  }

  get width(): number {
    return this.element.parentElement.clientWidth;
  }

  set width(value: number) {
    this.chart.attr('width', `${value}px`);
  }

  get height(): number {
    return this.element.parentElement.clientHeight;
  }

  set height(value: number) {
    this.chart.attr('height', `${value}px`);
  }


  addScale(scale: D3Scale) {
    this.scales.push(scale);
  }

  getScale(name: string): D3Scale {
    return this.scales.find(s => s.name === name);
  }

  addElement(element: ID3Element) {
    this.elements.push(element);
  }

  @Input()
  get data() {
    return this._data || [];
  }

  set data(value: any) {
    this._data = value;
    this.redraw();
  }

  redraw() {
    window.requestAnimationFrame(() => {
      this.scales.forEach(e => { e.redraw(); });
      this.elements.forEach(e => { e.redraw(); });
    });
  }

  ngOnInit() {
    this.redraw();
  }
}

export interface D3Margin {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

@Directive({
  selector: '[d3-margin]'
})
export class D3MarginDirective implements ID3Element {
  element;
  private _margin: D3Margin = { top: 0, left: 0, bottom: 0, right: 0 };

  constructor(public chart: D3ChartDirective, public el: ElementRef) {
    this.element = d3.select(el.nativeElement);
    chart.addElement(this);
  }

  get width(): number {
    return this.chart.width - this.margin.left - this.margin.right;
  }

  get height(): number {
    return this.chart.height - this.margin.top - this.margin.bottom;
  }

  @Input('d3-margin')
  get margin(): D3Margin {
    return this._margin;
  }

  set margin(value: D3Margin) {
    if (value) {
      if (this._margin === value) {
        return;
      }

      this._margin = value;
      this.redraw();
      this.chart.redraw();
    }
  }

  redraw() {
    this.element
      .attr('transform', `translate(${this.margin.left || '0'}, ${this.margin.top || '0'})`);
  }
}

export class D3Element implements ID3Element {
  element;
  private _margin: D3Margin = { top: 0, left: 0, right: 0, bottom: 0 };

  constructor(public chart: D3ChartDirective, public el: ElementRef, @Optional() private _marginEl?: D3MarginDirective) {
    this.element = d3.select(el.nativeElement);
    chart.addElement(this);
  }

  get margin(): D3Margin {
    return this._marginEl ? this._marginEl.margin : this._margin;
  }

  get nativeElement() {
    return this.el.nativeElement;
  }

  get width(): number {
    return this._marginEl ? this._marginEl.width : this.chart.width;
  }

  get height(): number {
    return this._marginEl ? this._marginEl.height : this.chart.height;
  }

  get data() {
    return this.chart.data;
  }

  get horizontalPadding(): number {
    return this.width - this.nativeElement.parentElement.clientWidth;
  }

  get verticalPadding(): number {
    return this.height - this.nativeElement.parentElement.clientHeight;
  }

  getScale(name) {
    return this.chart.getScale(name);
  }

  redraw() {
    return;
  }
}
