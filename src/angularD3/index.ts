import { NgModule } from '@angular/core';
import { D3ArcDirective } from './directives/arc';
import { D3AreaDirective } from './directives/area';
import { D3BarsDirective } from './directives/bars';
import { D3ChartDirective, D3MarginDirective, D3Margin } from './directives/chart';
import { D3DataDirective } from './directives/data';
import { D3LineDirective } from './directives/line';
import { D3PieDirective } from './directives/pie';
import { D3GearDirective } from './directives/gear';
import { D3AxisDirective } from './directives/axis';
import { D3AxisLabelDirective } from './directives/axis-label';

export const D3_DIRECTIVES = [
  D3ArcDirective,
  D3AreaDirective,
  D3AxisDirective,
  D3BarsDirective,
  D3ChartDirective,
  D3DataDirective,
  D3LineDirective,
  D3MarginDirective,
  D3PieDirective,
  D3GearDirective,
  D3AxisLabelDirective,
];

export {
  D3ArcDirective,
  D3AreaDirective,
  D3AxisDirective,
  D3BarsDirective,
  D3ChartDirective,
  D3DataDirective,
  D3LineDirective,
  D3Margin,
  D3MarginDirective,
  D3PieDirective,
  D3GearDirective,
  D3AxisLabelDirective,
};

@NgModule({
  declarations: [
    ...D3_DIRECTIVES
  ],
  exports: [
    ...D3_DIRECTIVES
  ]
})
export class D3Module {
}
