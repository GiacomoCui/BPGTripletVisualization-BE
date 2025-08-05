import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TripletVisualization} from './triplet-visualization';
import {SharedLibModule} from '../../shared-lib.module';

@NgModule({
  declarations: [TripletVisualization],
  imports: [CommonModule, SharedLibModule],
  exports: [TripletVisualization],
})
export class TripletVisualizationModule {}
