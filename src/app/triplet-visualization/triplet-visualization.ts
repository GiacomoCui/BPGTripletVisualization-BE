import {Component, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import { ButtonModule } from 'primeng/button';
import {Fieldset} from 'primeng/fieldset';

@Component({
  selector: 'app-triplet-visualization',
  imports: [
    ButtonModule,
    Fieldset
  ],
  templateUrl: './triplet-visualization.html',
  styleUrl: './triplet-visualization.css'
})
export class TripletVisualization implements OnInit, OnDestroy {

  tripletBooleanSelected: boolean
  isCollapsed: boolean = false;

  constructor() {
    this.tripletBooleanSelected = false;
  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }


}
