import {Component, OnDestroy, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TripletVisualization} from './triplet-visualization/triplet-visualization';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TripletVisualization],
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {

  ngOnDestroy(): void {
      throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
      throw new Error('Method not implemented.');
  }

}
