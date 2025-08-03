import { Routes } from '@angular/router';
import {TripletVisualization} from './triplet-visualization/triplet-visualization';
import {Homepage} from './homepage/homepage';

export const routes: Routes = [
  {
    path: '',
    component: Homepage,
    title: 'Homepage'
  },
  {
    path: 'tripletsFromASes',
    component: TripletVisualization,
    title: 'Triplet Visualization'
  },
];
