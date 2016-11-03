import {NgModule} from "@angular/core";
import {D3Arc} from "./directives/arc";
import {D3Area} from "./directives/area";
import {D3Bars} from "./directives/bars";
import {D3Chart, D3Margin} from "./directives/chart";
import {D3Data} from "./directives/data";
import {D3Line} from "./directives/line";
import {D3Pie} from "./directives/pie";
import {D3Gear} from "./directives/gear";
import {D3Axis} from "./directives/axis";

export const D3_DIRECTIVES = [
  D3Arc,
  D3Area,
  D3Axis,
  D3Bars,
  D3Chart,
  D3Data,
  D3Line,
  D3Margin,
  D3Pie,
  D3Gear,
];

@NgModule({
  declarations: D3_DIRECTIVES,
  exports: D3_DIRECTIVES,
})
export class D3Module {
}
