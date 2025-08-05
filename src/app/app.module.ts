import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedLibModule} from '../shared-lib.module';
import {environment} from '../environment/environment';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedLibModule],
  providers: [
    {
      provide: 'ENVIRONMENT',
      useValue: environment
    }
  ],
})
export class AppModule {
}
