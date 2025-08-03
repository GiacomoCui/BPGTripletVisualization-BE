import { Component } from '@angular/core';
import {Button} from 'primeng/button';
import {Fluid} from 'primeng/fluid';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-homepage',
  imports: [
    Button,
    Fluid,
    RouterLink
  ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage {

}
