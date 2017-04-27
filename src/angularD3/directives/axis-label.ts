import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3MarginDirective } from './chart';

@Directive({
  selector: '[d3-axis-label]'
})
export class D3AxisLabelDirective extends D3Element {
  @Input() value: string;
  @Input() axis: string;
  @Input() position: string = 'left';
  @Input('x-padding') xPadding: string = '0';
  @Input('y-padding') yPadding: string = '0';

  private _scale: any;
  private _textElement;
  private _xPadding: number;
  private _yPadding: number;
  private _label: string;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    chart.addElement(this);
  }

  redraw() {
    this.updateLabel();
  }

  @Input()
  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
    if (this._textElement) {
      this._textElement.text(this._label);
    }
  }

  private updateLabel() {
    if (!this._textElement) {
      this._textElement = this.element.append('text').attr('class', 'axis-label');
      this._textElement.text(this.label);
    }
    if (!this._scale) {
      this._scale = this.getScale(this.axis);
    }
    if (!this._xPadding) {
      this._xPadding = parseFloat(this.xPadding);
    }
    if (!this._yPadding) {
      this._yPadding = parseFloat(this.yPadding);
    }
    let isVertical = this._scale.isVertical();

    let x = this._xPadding;
    let y = this._yPadding;
    let scaledValue = this._scale.scale(this.value);

    if (isVertical) {
      this._textElement
          .attr('transform', 'rotate(-90)');
      if (this.position === 'middle') {
        x += -this.height / 2;
        y += scaledValue;
      } else if (this._scale.orientation === 'top' && this.position === 'start'
          || this._scale.orientation === 'bottom' && this.position === 'end') {
        this._textElement
            .attr('style', 'text-anchor: end');
        y += scaledValue;
      } else {
        x += -this.height;
        y += scaledValue;
      }
    } else {
      if (this.position === 'middle') {
        x += this.width / 2;
        y += scaledValue;
      } else if (this._scale.orientation === 'left' && this.position === 'start'
          || this._scale.orientation === 'right' && this.position === 'end') {
        y += scaledValue;
      } else {
        x += this.width;
        y += scaledValue;
        this._textElement.attr('style', 'text-anchor: end');
      }
    }

    this._textElement
      .attr('x', x)
      .attr('y', y);
  }

}
