import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Homepage } from './homepage';
import {SharedLibModule} from '../../shared-lib.module';

@NgModule({
  declarations: [Homepage],
  imports: [CommonModule, SharedLibModule],
  exports: [Homepage]
})
export class HomepageModule {}
