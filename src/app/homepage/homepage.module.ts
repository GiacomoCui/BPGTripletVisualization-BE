import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { Homepage } from './homepage';
import {SharedLibModule} from '../../shared-lib.module';

@NgModule({
  declarations: [Homepage],
    imports: [CommonModule, SharedLibModule, NgOptimizedImage],
  exports: [Homepage]
})
export class HomepageModule {}
