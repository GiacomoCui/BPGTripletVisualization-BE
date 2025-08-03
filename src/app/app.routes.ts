import { Routes } from '@angular/router';
import {App} from './app';
import {TripletVisualization} from './triplet-visualization/triplet-visualization';

export const routes: Routes = [
  {
    path: '',
    component: App,
    title: 'HomePage'
  },
  {
    path: 'tripletsFromASes',
    component: TripletVisualization,
    title: 'Triplet Visualization'
  },
];
