import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TripletVisualizationService} from '../services/triplet-visualization.service';
import {Subscription} from 'rxjs';
import {MessageService} from 'primeng/api';
import * as d3 from 'd3';


type Node =
  {
    ASNumber: number;
    pos: number; // position in the rappresentation
    role: number // 0 = origin, 1 = destination
  };

type Links =
  {
    origin: Node;
    destination: Node;
  }

@Component({
  selector: 'app-triplet-visualization',
  templateUrl: './triplet-visualization.html',
  standalone: false,
  styleUrl: './triplet-visualization.css'
})
export class TripletVisualization implements OnInit, OnDestroy {

  isCollapsed: boolean = false;
  subscription!: Subscription;
  ableSearch: boolean = false;


  netForm!: FormGroup;
  availableCPs!: any;
  availablePeer!: any;
  peerSelected: number = -1;
  ipForPeerSelected!: string[];
  hiveSelected: boolean = false;
  peerInfo!: any

  origins: Set<Node> = new Set<Node>();
  destination: Set<Node> = new Set<Node>();
  collisionMatrix: any = [];
  nodeSelected: Node | null = null;
  nodeSelectedDestination: Node | null = null;

  queryFamily: any = [{name: 'IPv4', value: 4}, {name: 'IPv6', value: 6}];

  @ViewChild('myDataVis', {static: true}) private chartContainer!: ElementRef;
  private svg: any;


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

  ngOnInit(): void {
    //crea dei dati fittizi per testare la grafica
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
          let mat = this.optimizeAllMatrix(this.collisionMatrix)
          console.log(this.origins)
          console.log(this.destination)
          console.log('Optimized Matrix:', mat);
          this.drawGraph(data, this.hiveSelected);
        } else {
          this.messageService.add({severity: 'info', summary: 'Info', detail: 'No triplets found'});
        }
      },
      error: (error) => {
        console.error('Error fetching triplets:', error);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to fetch triplets'});
      }
    });
  }

  fillMatrix(triplet: any) {
    let asOrigin: Set<string> = new Set<string>();
    let asDestination: Set<string> = new Set<string>();
    this.collisionMatrix = [];
    this.origins.clear();
    this.destination.clear();

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
      this.destination.add({ASNumber: Number(destinationArr[i]), pos: i, role: 1});
    }
  }


  drawGraph(data: any, hiveSelected: boolean) {
    if (hiveSelected) {
      this.drawHiveGraph(data);
    } else {
      this.drawClassicGraph();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private drawClassicGraph() {
    //verrà usato origin come nodi da disegnare nella linea in basso e destinazione per la linea in alto
    // prima di iniziare tutto, cancella il grafico precedente
    if (this.svg) {
      const element = this.chartContainer.nativeElement;
      d3.select(element).select('svg').remove();
    }
    let links: Links[] = [];
    this.origins.forEach((origin: Node) => {
      this.destination.forEach((destination: Node) => {
        if (this.collisionMatrix[destination.pos][origin.pos]) {
          links.push({origin: origin, destination: destination});
        }
      });
    });

    console.log('links', links);
    let xLength = Math.max(this.origins.size, this.destination.size);
    let margin = {top: 20, right: 30, bottom: 30, left: 40};
    const element = this.chartContainer.nativeElement;
    this.svg = d3.select(element).append('svg')
      .attr("width", 900)
      .attr("height", 400)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    //definisci le freccette per le linee
    const xScale = d3.scaleLinear()
      .domain([0, xLength])
      .range([0, 800]);
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, 300]);
    this.svg.append('line')
      .attr('x1', xScale(0))
      .attr('y1', yScale(0))
      .attr('x2', xScale(xLength))
      .attr('y2', yScale(0))
      .attr('stroke', 'black')
    this.svg.append('line')
      .attr('x1', xScale(0))
      .attr('y1', yScale(1))
      .attr('x2', xScale(xLength))
      .attr('y2', yScale(1))
      .attr('stroke', 'black');


    //disegna i nodi
    const nodi = this.svg.selectAll('.node')
      .data(this.origins)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: Node) => `translate(${xScale(d.pos)}, ${yScale(0)})`);
    nodi.append('circle')
      .attr('r', 5)
      .attr('fill', 'blue');
    //disegna i nodi di destinazione
    const nodiDestinazione = this.svg.selectAll('.node-destination')
      .data(this.destination)
      .enter()
      .append('g')
      .attr('class', 'node-destination')
      .attr('transform', (d: Node) => `translate(${xScale(d.pos)}, ${yScale(1)})`);
    nodiDestinazione.append('circle')
      .attr('r', 5)
      .attr('fill', 'red');
    //disegna le linee tra i nodi
    const link = this.svg.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', (d: Links) => xScale(d.origin.pos))
      .attr('y1', (d: Links) => yScale(0) + 5) // Aggiungi il raggio del nodo
      .attr('x2', (d: Links) => {
        // Calcola la direzione della linea
        const dx = xScale(d.destination.pos) - xScale(d.origin.pos);
        const dy = yScale(1) - yScale(0);
        const angle = Math.atan2(dy, dx);
        // Ferma la linea a 5 pixel (raggio del nodo) dal centro del nodo
        return xScale(d.destination.pos) - 5 * Math.cos(angle);
      })
      .attr('y2', (d: Links) => {
        // Calcola la direzione della linea
        const dx = xScale(d.destination.pos) - xScale(d.origin.pos);
        const dy = yScale(1) - yScale(0);
        const angle = Math.atan2(dy, dx);
        // Ferma la linea a 5 pixel (raggio del nodo) dal centro del nodo
        return yScale(1) - 5 * Math.sin(angle);
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrowhead)');

    // Definizione della freccia
    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'black');

    const Tooltip = d3.select(this.chartContainer.nativeElement)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
   /* var mouseover = function(d) {
      Tooltip
        .style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    var mousemove = function(d) {
      Tooltip
        .html("The exact value of<br>this cell is: " + d.value)
        .style("left", (d3.mouse(this)[0]+70) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
      Tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }*/

// Funzione comune per il mouseover
function handleMouseOver(event: any, d: Node) {
  Tooltip
    .style("opacity", 1)
  d3.select(event.target)
    .style("stroke", "black")
    .style("opacity", 1)
}

// Funzione comune per il mousemove
function handleMouseMove(event: any, d: Node) {
  Tooltip
    .html("AS Number: " + d.ASNumber)
    .style("position", "absolute")
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 20) + "px")
}

// Funzione comune per il mouseout
function handleMouseOut(event: any, d: Node) {
  Tooltip
    .style("opacity", 0)
  d3.select(event.target)
    .style("stroke", "none")
    .style("opacity", 0.8)
}

// Applica gli eventi ai nodi di origine
nodi.on('mouseover', handleMouseOver)
    .on('mousemove', handleMouseMove)
    .on('mouseout', handleMouseOut);

// Applica gli stessi eventi ai nodi di destinazione
nodiDestinazione.on('mouseover', handleMouseOver)
    .on('mousemove', handleMouseMove)
    .on('mouseout', handleMouseOut);

    //crea un evento mouseover per i nodi
    nodi.on('click', (event: any, d: Node) => {
      // Reset stato se si riclicca sullo stesso nodo selezionato
      if (this.nodeSelected === d) {
        d3.select(event.target).attr('fill', 'blue');
        this.nodeSelected = null;
        return;
      }

      // Ripristina colore originale dei nodi se era già selezionato un altro nodo
      if (this.nodeSelected !== null) {
        this.svg.selectAll('.node circle').attr('fill', 'blue');
      }

      // Seleziona il nuovo nodo
      d3.select(event.target).attr('fill', 'orange');
      this.nodeSelected = d;
    })

    nodiDestinazione.on('click', (event: any, d: Node) => {
      // Reset stato se si riclicca sullo stesso nodo selezionato
      if (this.nodeSelectedDestination === d) {
        d3.select(event.target).attr('fill', 'red');
        this.nodeSelectedDestination = null;
        return;
      }

      // Ripristina colore originale dei nodi se era già selezionato un altro nodo
      if (this.nodeSelectedDestination !== null) {
        this.svg.selectAll('.node-destination circle').attr('fill', 'red');
      }

      // Seleziona il nuovo nodo
      d3.select(event.target).attr('fill', 'orange');
      this.nodeSelectedDestination = d;
    })

  }

  private drawHiveGraph(data: any) {

  }

  optimizeAllMatrix(matrix: any[]) {
    matrix = this.optimizeMatrix(matrix, 1);
    matrix = matrix[0].map((_: any, colIndex: number) => matrix.map((row: any) => row[colIndex]));
    matrix = this.optimizeMatrix(matrix, 0);
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
    console.log('barycenter', barycenterOrder);
    barycenterOrder.sort((a, b) => a.median - b.median);
    let i = 0;
    barycenterOrder.forEach((item: any) => {
      optimizedMatrix.push(matrix[item.index]);
      if (typeof type !== 'undefined') {
        switch (type) {
          case 0: // origin
            this.origins.forEach((origin: any) => {
              if (origin.posizione === item.index) {
                origin.posizione = i;
                i++;
                return;
              }
            })
            break
          case 1: // destination
            this.destination.forEach((destination: any) => {
              if (destination.posizione === item.index) {
                destination.posizione = i;
                i++;
                return
              }
            })
            break;
        }
      }
    });
    return optimizedMatrix;
  }
}
