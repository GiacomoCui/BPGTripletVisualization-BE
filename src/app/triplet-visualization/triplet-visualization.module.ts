import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TripletVisualization} from './triplet-visualization';
import {SharedLibModule} from '../../shared-lib.module';
import {Checkbox} from "primeng/checkbox";
import {Select} from "primeng/select";
import {Card} from "primeng/card";
import {Divider} from 'primeng/divider';
import {Tooltip} from 'primeng/tooltip';
import {Message} from "primeng/message";
import {Toast} from 'primeng/toast';

@NgModule({
  declarations: [TripletVisualization],
  imports: [CommonModule, SharedLibModule, Checkbox, Select, Card, Divider, Tooltip, Message, Toast],
  exports: [TripletVisualization],
})
export class TripletVisualizationModule {}
