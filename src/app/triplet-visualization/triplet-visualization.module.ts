import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TripletVisualization} from './triplet-visualization';
import {SharedLibModule} from '../../shared-lib.module';
import {Checkbox} from "primeng/checkbox";
import {Select} from "primeng/select";

@NgModule({
  declarations: [TripletVisualization],
    imports: [CommonModule, SharedLibModule, Checkbox, Select],
  exports: [TripletVisualization],
})
export class TripletVisualizationModule {}
