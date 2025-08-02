import {Component, OnDestroy, OnInit} from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-triplet-visualization',
  imports: [ButtonModule
  ],
  templateUrl: './triplet-visualization.html',
  styleUrl: './triplet-visualization.css'
})
export class TripletVisualization implements OnInit, OnDestroy {

  tripletBooleanSelected: boolean

  constructor() {
    this.tripletBooleanSelected = false;
  }

  ngOnInit(): void {
      throw new Error('Method not implemented.');
  }
  ngOnDestroy(): void {
      throw new Error('Method not implemented.');
  }


}
