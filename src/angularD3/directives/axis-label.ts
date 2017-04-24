import { Input, Optional, Directive, ElementRef } from '@angular/core';
import { D3ChartDirective, D3Element, D3MarginDirective } from './chart';

@Directive({
  selector: '[d3-axis-label]'
})
export class D3AxisLabelDirective extends D3Element {
  @Input() label: string;
  @Input() value: string;
  @Input() axis: string;
  @Input() position: string = 'left';

  private _scale: any;
  private _textElement;

  constructor(chart: D3ChartDirective, el: ElementRef, @Optional() margin?: D3MarginDirective) {
    super(chart, el, margin);
    chart.addElement(this);
  }

  redraw() {
    this.updateLabel();
  }

  private updateLabel() {
    if (!this._textElement) {
      this._textElement = this.element.append('text').attr('class', 'axis-label');
      this._textElement.text(this.label);
    }
    debugger;
    if (!this._scale) {
      this._scale = this.getScale(this.axis);
    }

    let isVertical = this._scale.isVertical();

    let x;
    let y;
    let scaledValue = this._scale.scale(this.value);

    if (isVertical) {
      this._textElement
          .attr('transform', 'rotate(-90)');
      if (this.position === 'middle') {
        x = -this.height / 2 + 5;
        y = scaledValue - 5;
      } else if (this._scale.orientation === 'top' && this.position === 'start'
          || this._scale.orientation === 'bottom' && this.position === 'end') {
        this._textElement
            .attr('style', 'text-anchor: end');
        x = 5;
        y = scaledValue - 5;
      } else {
        x = -this.height + 5;
        y = scaledValue - 5;
      }
    } else {
      if (this.position === 'middle') {
        x = this.width / 2 - 5;
        y = scaledValue - 5;
      } else if (this._scale.orientation === 'left' && this.position === 'start'
          || this._scale.orientation === 'right' && this.position === 'end') {
        x = 5;
        y = scaledValue - 5;
      } else {
        x = this.width - 5;
        y = scaledValue - 5;
        this._textElement.attr('style', 'text-anchor: end');
      }
    }
    this._textElement
      .attr('x', x)
      .attr('y', y);
  }

}
