import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TripletVisualizationService} from '../services/triplet-visualization.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-triplet-visualization',
  templateUrl: './triplet-visualization.html',
  standalone: false,
  styleUrl: './triplet-visualization.css'
})
export class TripletVisualization implements OnInit, OnDestroy {

  tripletBooleanSelected: boolean
  isCollapsed: boolean = false;
  subscription!: Subscription;

  netForm!: FormGroup;

  queryFamily: any = [{name: 'IPv4', value: 4}, {name: 'IPv6', value: 6}];


  constructor(private formBuilder: FormBuilder,
              private tripletVisualizationService: TripletVisualizationService) {
    this.tripletBooleanSelected = false;
    this.netForm = this.formBuilder.group({
      asNumber: [null],
      queryGroup: [null],
    });
  }

  ngOnInit(): void {

  }

  search() {
    console.log(this.netForm.value);
    this.subscription = this.tripletVisualizationService.findTripletsFromAS(this.netForm.value).subscribe({
      next: (value: any) => {
        console.log('godo', value)
      },
      error: (value) => {
        console.error('Error fetching data:', value);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
