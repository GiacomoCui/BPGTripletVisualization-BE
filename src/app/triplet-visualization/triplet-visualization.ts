import {Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TripletVisualizationService} from '../services/triplet-visualization.service';
import {Subscription} from 'rxjs';
import {MessageService} from 'primeng/api';
import {DrawGraph} from './draw-graph';
import * as d3 from 'd3';
import {ContextMenu} from 'primeng/contextmenu';
import 'leader-line';

declare let LeaderLine: any;

export type Link = {
  origin: Node;
  destination: Node;
  totalPathCount?: number;
}

export type Node = {
  ASNumber: number | null;
  pos: number; // position in the rappresentation
  role: number // 0 = origin, 1 = destination
  children?: Node[] | null // for collapsed nodes
  _children?: Node[] | null // for collapsed nodes
  name?: string | null // for collapsed nodes
  aggregation?: number | null// number of nodes collapsed
};

@Component({
  selector: 'app-triplet-visualization',
  templateUrl: './triplet-visualization.html',
  standalone: false,
  styleUrl: './triplet-visualization.css'
})
export class TripletVisualization implements OnInit, OnDestroy, OnChanges {

  isCollapsed: boolean = false;
  subscription!: Subscription;
  ableSearch: boolean = false;

  drawService!: DrawGraph;

  netForm!: FormGroup;
  availableCPs!: any;
  availablePeer!: any;
  peerSelected: number = -1;
  ipForPeerSelected!: string[];
  hiveSelected: boolean = false;
  peerInfo!: any

  origins: Set<Node> = new Set<Node>();
  destinations: Set<Node> = new Set<Node>();
  links: Link[] = [];
  collisionMatrix: any = [];
  queryFamily: any = [{name: 'IPv4', value: 4}, {name: 'IPv6', value: 6}];

  @ViewChild('myDataVis', {static: true}) private chartContainer!: ElementRef;
  @ViewChild('myDataLegend', {static: true}) private legendContainer!: ElementRef;
  @ViewChild('cm') private nodeMenu!: ContextMenu
  private svg: any;
  items: any[] = [];


  constructor(private formBuilder: FormBuilder,
              private tripletVisualizationService: TripletVisualizationService,
              private messageService: MessageService) {
    this.netForm = this.formBuilder.group({
      asNumber: [null],
      peerAS: [null],
      peerIP: [null],
      queryFamily: [null],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.searchTripletDetail()
  }

  ngOnInit(): void {
    const element = this.chartContainer.nativeElement;
    const elementLegend = this.legendContainer.nativeElement;
    this.drawService = new DrawGraph(element, elementLegend, this.nodeMenu);
    this.items = [
      { label: 'Copy', icon: 'pi pi-copy' },
      { label: 'Rename', icon: 'pi pi-file-edit' }
    ];
    this.drawService.nodeSelected.subscribe(() => {
      this.searchTripletDetail()
    });
  }

  searchAvailableCPs() {
    this.availableCPs = [];
    this.ipForPeerSelected = [];
    if (!this.netForm.value.asNumber) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'AS Number is required'});
      return;
    }
    this.subscription = this.tripletVisualizationService.findAvailableCPs(this.netForm.value).subscribe({
      next: (data: any) => {
        this.availablePeer = data;
        const peerASSet = new Set(data.map((item: any) => item.peerAS));
        this.availableCPs = Array.from(peerASSet, item => ({label: item, value: item})).sort(
          (a, b) => {
            return Number(a.value) - Number(b.value);
          });
      },
      error: (value) => {
        console.error('Error fetching data:', value);
      }
    })
  }

  showPeers() {
    if (this.netForm.value.peerAS != null && this.netForm.value.peerAS != this.peerSelected) {
      let peerAS = this.netForm.value.peerAS;
      this.ipForPeerSelected = this.availablePeer
        .filter((item: any) => item.peerAS === this.netForm.value.peerAS.value)
        .map((item: any) => ({label: item.peerIPAddress, value: item.peerIPAddress}));
    }

  }

  searchVisibility() {
    // se il peerAS, middleAS e peerIP sono selezionati, abilita la ricerca
    this.ableSearch = this.netForm.value.peerAS
      && this.netForm.value.asNumber
      && this.netForm.value.peerIP
      && this.netForm.value.peerAS !== ''
      && this.netForm.value.asNumber !== ''
      && this.netForm.value.peerIP !== '';
  }

  searchTriplets() {
    let formToSend = this.formBuilder.group({...this.netForm.value});
    formToSend.get('peerIP')?.setValue(this.netForm.value.peerIP.value);
    formToSend.get('peerAS')?.setValue(this.netForm.value.peerAS.value);
    if (this.netForm.value.queryFamily) {
      if (Array.isArray(this.netForm.value.queryFamily) && this.netForm.value.queryFamily.length === 1) {
        formToSend.get('queryFamily')?.setValue(this.netForm.value.queryFamily[0].value);
      } else {
        formToSend.get('queryFamily')?.setValue(null);
      }
    }
    this.subscription = this.tripletVisualizationService.findTriplets(formToSend.value).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.peerInfo = data;
          this.fillMatrix(data);
          let mat = this.optimizeAllMatrix(this.collisionMatrix);
          mat = this.collapseAllMatrix(mat)
          console.log('dati: ',data)
          this.setLink(mat, data)
          this.drawGraph(mat, this.hiveSelected);
        } else {
          console.log('No Data Found');
          this.messageService.add({severity: 'error', summary: 'Info', detail: 'No triplets found'});
          this.drawService.deleteAll()
        }
      },
      error: (error) => {
        console.error('Error fetching triplets:', error);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to fetch triplets'});
      }
    });
    this.isCollapsed = true;
  }

  searchTripletDetail() {
    if(!this.drawService.checkTriplet()){
      return
    }
    const selectedNodes = this.drawService.getSelectedNodes();
    if (!selectedNodes.origin || !selectedNodes.destination) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Select both origin and destination'});
      return;
    }
    const triplet = this.peerInfo.find((item: any) =>
      item.prec == selectedNodes.origin?.ASNumber && item.succ == selectedNodes.destination?.ASNumber);
    if (!triplet) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Triplet not found'});
      return;
    }
    console.log(triplet)
    let id = triplet.id;

    this.subscription = this.tripletVisualizationService.findTripletsById(id).subscribe({
      next: (data: any) => {
        this.drawService.setLinkSelected(true);
      },
      error: (data: any) => {
        console.error('Error fetching triplet by id:', data);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to fetch triplet by id'});
        this.drawService.setLinkSelected(false);
      }
    })
  }

  fillMatrix(triplet: any) {
    let asOrigin: Set<string> = new Set<string>();
    let asDestination: Set<string> = new Set<string>();
    this.collisionMatrix = [];
    this.origins.clear();
    this.destinations.clear();

    for (let i = 0; i < triplet.length; i++) {
      const t = triplet[i];
      if (t.prec) {
        asOrigin.add(t.prec);
      }
      if (t.succ) {
        asDestination.add(t.succ);
      }
    }
    const originsArr = Array.from(asOrigin);
    const destinationArr = Array.from(asDestination);
    this.collisionMatrix = Array.from({length: destinationArr.length}, () => Array(originsArr.length).fill(false));
    for (let i = 0; i < triplet.length; i++) {
      const t = triplet[i];
      const precIndex = originsArr.indexOf(t.prec);
      const succIndex = destinationArr.indexOf(t.succ);
      if (precIndex !== -1 && succIndex !== -1) {
        this.collisionMatrix[succIndex][precIndex] = true;
      }
    }
    for (let i = 0; i < asOrigin.size; i++) {
      this.origins.add({ASNumber: Number(originsArr[i]), pos: i, role: 0});
    }
    for (let i = 0; i < asDestination.size; i++) {
      this.destinations.add({ASNumber: Number(destinationArr[i]), pos: i, role: 1});
    }
  }

  drawGraph(mat: any, hiveSelected: boolean) {
    this.drawService.chooseGraph(mat, this.links, hiveSelected, this.origins, this.destinations);
  }

  optimizeAllMatrix(matrix: any[]) {
    matrix = this.optimizeMatrix(matrix, 1);
    matrix = matrix[0].map((_: any, colIndex: number) => matrix.map((row: any) => row[colIndex]));
    matrix = this.optimizeMatrix(matrix, 0);
    matrix = matrix[0].map((_: any, colIndex: number) => matrix.map((row: any) => row[colIndex]));
    return matrix;
  }

  collapseAllMatrix(matrix: any[]) {
    matrix = this.aggregateNode(matrix, 1);
    matrix = matrix[0].map((_: any, colIndex: number) => matrix.map((row: any) => row[colIndex]));
    matrix = this.aggregateNode(matrix, 0);
    matrix = matrix[0].map((_: any, colIndex: number) => matrix.map((row: any) => row[colIndex]));
    return matrix;
  }

  optimizeMatrix(matrix: any[][], type?: 0 | 1): any[][] {
    let optimizedMatrix: any[][] = [];
    let barycenterOrder: any[] = [];
    matrix.forEach((col: any, i: number) => {
      let count = 0;
      let sum = 0;
      col.forEach((row: any, j: number) => {
        if (row) {
          count++;
          sum += j + 1;
        }
      })
      if (count > 0) {
        let median: number = sum / count;
        barycenterOrder.push({index: i, median: median});
      }
    });
    barycenterOrder.sort((a, b) => a.median - b.median);
    let i = 0;
    for (let item of barycenterOrder) {
      optimizedMatrix.push(matrix[item.index]);
      if (typeof type !== 'undefined') {
        switch (type) {
          case 0: // origin
            for (let origin of this.origins) {
              if (origin.pos == item.index && i < this.origins.size) {
                this.origins.delete(origin);
                origin.pos = i;
                this.origins.add(origin);
                i++;
                break;
              }
            }
            break
          case 1: // destination
            for (let destination of this.destinations) {
              if (destination.pos === item.index) {
                destination.pos = i;
                i++;
                break
              }
            }
            break;
        }
      }
    }
    return optimizedMatrix;
  }

  aggregateNode(mat: any[], type?: 0 | 1): any[] {
    let originForAggregation: Set<Node> = new Set(Array.from(this.origins).map(node => ({...node})));
    let destinationForAggregation: Set<Node> = new Set(Array.from(this.destinations).map(node => ({...node})));
    let aggregatedMatrix: any[] = mat;
    let visited = false;
    let nodeList: Node[] = [];
    //controlla se ci sono colonne uguali in mat, dove mat è una matrice di booleani
    for (let i = 0; i < aggregatedMatrix.length; i++) {
      nodeList = [];
      visited = false;
      for (let j = i + 1; j < aggregatedMatrix.length; j++) {
        if (JSON.stringify(aggregatedMatrix[i]) === JSON.stringify(aggregatedMatrix[j])) {
          if (type == 0) {
            for (let origin of originForAggregation) {
              if (origin.pos == j) {
                let newOr = Array.from(this.origins).find(o => o.ASNumber === origin.ASNumber);
                nodeList.push(newOr as Node);
                originForAggregation.delete(origin);
              }
            }
          } else if (type == 1) {
            for (let destination of destinationForAggregation) {
              if (destination.pos == j) {
                let newDest = Array.from(this.destinations).find(o => o.ASNumber === destination.ASNumber);
                nodeList.push(newDest as Node)
                destinationForAggregation.delete(destination);
              }
            }
          }
          aggregatedMatrix.splice(j, 1);
          //tutti i nodi che hanno una posizione sopra a j devono essere decrementati di 1
          if (type === 0) {
            for (let origin of originForAggregation) {
              if (origin.pos > j) {
                originForAggregation.delete(origin);
                origin.pos = origin.pos - 1;
                originForAggregation.add(origin);
              }
            }
          } else if (type === 1) {
            for (let destination of destinationForAggregation) {
              if (destination.pos > j) {
                destination.pos = destination.pos - 1;
              }
            }
          }
          j--;
          visited = true;
        }
      }
      if (visited) {
        if (type === 0) {
          const origin = Array.from(originForAggregation).find(o => o.pos === i);
          if (origin) nodeList.push(origin);
        } else if (type === 1) {
          const destination = Array.from(destinationForAggregation).find(d => d.pos === i);
          if (destination) nodeList.push(destination);
        }
        let aggregatedNode: Node = {
          ASNumber: -i,
          pos: i,
          role: type === 0 ? 0 : 1,
          children: nodeList,
          _children: null,
          name: `Aggregated ${nodeList.length} nodes`,
          aggregation: nodeList.length
        };
        if (type === 0) {
          for (let node of nodeList) {
            originForAggregation.delete(node);
          }
          originForAggregation.add(aggregatedNode);
        } else if (type === 1) {
          for (let node of nodeList) {
            destinationForAggregation.delete(node);
          }
          destinationForAggregation.add(aggregatedNode);
        }
      }
    }
    this.origins = originForAggregation;
    this.destinations = destinationForAggregation;
    return aggregatedMatrix;
  }

  setLink(mat: any[], data: any) {
    for (let origin of this.origins) {
      for (let destination of this.destinations) {
        if (mat[destination.pos][origin.pos]) {
          let totalPathCount = 0;
          //trova tutti i triplet in data che hanno come prec origin.ASNumber e come succ destination.ASNumber. Se hanno il campo children valorizzato, allora invece di usare ASNumber usa il campo children.ASNumber per fare il match
          for (let triplet of data) {
            let precMatch = false;
            let succMatch = false;
            if (origin.children && origin.children.length > 0) {
              for (let child of origin.children) {
                if (triplet.prec == child.ASNumber) {
                  precMatch = true;
                  break;
                }
              }
            } else {
              if (triplet.prec == origin.ASNumber) {
                precMatch = true;
              }
            }
            if (destination.children && destination.children.length > 0) {
              for (let child of destination.children) {
                if (triplet.succ == child.ASNumber) {
                  succMatch = true;
                  break;
                }
              }
            } else {
              if (triplet.succ == destination.ASNumber) {
                succMatch = true;
              }
            }
            if (precMatch && succMatch) {
              totalPathCount += triplet.totalPathCount;
            }
          }
          this.links.push({origin: origin, destination: destination, totalPathCount: totalPathCount});
        }
      }
    }
    console.log('links: ', this.links)
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
