import { Routes } from '@angular/router';
import {TripletVisualization} from './triplet-visualization/triplet-visualization';
import {Homepage} from './homepage/homepage';

export const routes: Routes = [
  {
    path: '',
    component: Homepage,
    title: 'Homepage',
    loadChildren: () => import('./homepage/homepage.module').then(m => m.HomepageModule)
  },
  {
    path: 'tripletsFromASes',
    component: TripletVisualization,
    title: 'Triplet Visualization',
    loadChildren: () => import('./triplet-visualization/triplet-visualization.module').then(m => m.TripletVisualizationModule)
  },
];
