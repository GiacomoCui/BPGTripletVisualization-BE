import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule, RouterOutlet} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Button, ButtonModule} from 'primeng/button';
import {FieldsetModule} from 'primeng/fieldset';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputTextModule} from 'primeng/inputtext';
import {KeyFilterModule} from 'primeng/keyfilter';
import {MultiSelectModule} from 'primeng/multiselect';
import {Fluid} from 'primeng/fluid';
import {Menubar} from 'primeng/menubar';
import {TripletVisualizationService} from './app/services/triplet-visualization.service';
import {environment} from './environment/environment';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    NgOptimizedImage,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    FieldsetModule,
    FloatLabelModule,
    InputTextModule,
    KeyFilterModule,
    MultiSelectModule,
    RouterOutlet,
    Fluid,
    Menubar,
  ],
  exports: [
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    Button,
    FieldsetModule,
    FloatLabelModule,
    InputTextModule,
    KeyFilterModule,
    MultiSelectModule,
    RouterOutlet,
    Fluid,
    Menubar
  ],
  providers: [
    TripletVisualizationService,
    { provide: 'ENVIRONMENT', useValue: environment }

  ]
})
export class SharedLibModule {

}
