import * as d3 from 'd3';

export type Node = {
  ASNumber: number | null;
  pos: number; // position in the rappresentation
  role: number // 0 = origin, 1 = destination
  children?: Node[] | null // for collapsed nodes
  _children?: Node[] | null // for collapsed nodes
  name?: string | null; // for collapsed nodes
  aggregation?: number | null  // number of nodes collapsed
   };

export type Links = {
  origin: Node;
  destination: Node;
};

export class DrawGraph {
  private svg: any;
  private colorScale: any;
  private element: any;
  private elementLegend: any;
  private nodeSelected: Node | null = null;
  private nodeSelectedDestination: Node | null = null;
  private domain: [number, number] = [0, 50]; // Dominio per la scala di colori

  constructor(element: any, elementLegend: any) {
    this.element = element;
    this.elementLegend = elementLegend;
  }

  chooseGraph(mat: any, hiveSelected: boolean, origins: Set<Node>, destinations: Set<Node>) {
    this.nodeSelected = null;
    this.nodeSelectedDestination = null;
    this.drawLegend()

    if (hiveSelected) {
      this.drawHiveGraph(mat, origins, destinations);
    } else {
      this.drawClassicGraph(mat, origins, destinations);
    }
  }

  private drawClassicGraph(mat: Node[][], origins: Set<Node>, destinations: Set<Node>) {
    if (this.svg) {
      d3.select(this.element).select('svg').remove();
      d3.select(this.element).select('div.tooltip').remove();
    }

    let links: Links[] = [];
    for (let origin of origins) {
      for (let destination of destinations) {
        if (mat[destination.pos][origin.pos]) {
          links.push({origin: origin, destination: destination});
        }
      }
    }

    let xLength = Math.max(origins.size, destinations.size);
    let margin = {top: 20, right: 30, bottom: 30, left: 40};
    this.svg = d3.select(this.element).append('svg')
      .attr("width", 900)
      .attr("height", 400)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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
      .attr('stroke', 'black')

    const nodi = this.svg.selectAll('.node')
      .data(origins)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: Node) => `translate(${xScale(d.pos)}, ${yScale(0)})`);
    nodi.append('circle')
      .attr('r', 5)
      .attr('fill', 'blue');

    const nodiDestinazione = this.svg.selectAll('.node-destination')
      .data(destinations)
      .enter()
      .append('g')
      .attr('class', 'node-destination')
      .attr('transform', (d: Node) => `translate(${xScale(d.pos)}, ${yScale(1)})`);
    nodiDestinazione.append('circle')
      .attr('r', 5)
      .attr('fill', 'red');

    const link = this.svg.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', (d: Links) => xScale(d.origin.pos))
      .attr('y1', (d: Links) => yScale(0) + 5)
      .attr('x2', (d: Links) => {
        const dx = xScale(d.destination.pos) - xScale(d.origin.pos);
        const dy = yScale(1) - yScale(0);
        const angle = Math.atan2(dy, dx);
        return xScale(d.destination.pos) - 5 * Math.cos(angle);
      })
      .attr('y2', (d: Links) => {
        const dx = xScale(d.destination.pos) - xScale(d.origin.pos);
        const dy = yScale(1) - yScale(0);
        const angle = Math.atan2(dy, dx);
        return yScale(1) - 5 * Math.sin(angle);
      })
      .attr('stroke', (d: Links) => this.colorScale((d.origin.aggregation ?? 0) + (d.destination.aggregation ?? 0))) // TODO: cambiare colore in base al numero di connessioni
      // .attr('marker-end', 'url(#arrowhead)')
      .attr('stroke-width', 1);


/*    // Definizione della freccia
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
      .attr('fill', 'black');*/

    const Tooltip = d3.select(this.element)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

    function handleMouseOver(event: any, d: Node) {
      Tooltip
        .style("opacity", 1)
      d3.select(event.target)
        .style("stroke", "black")
        .style("opacity", 1)
    }

    function handleMouseMove(event: any, d: Node) {
      Tooltip
        .html(d.name ?? "AS Number: " + (d.ASNumber ?? "Unknown"))
        .style("position", "absolute")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px")
    }

    function handleMouseOut(event: any, d: Node) {
      Tooltip
        .style("opacity", 0)
      d3.select(event.target)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    nodi.on('mouseover', handleMouseOver)
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleMouseOut);

    nodiDestinazione.on('mouseover', handleMouseOver)
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleMouseOut);

    nodi.on('click', (event: any, d: Node) => {
      if (this.nodeSelected === d) {
        d3.select(event.target).attr('fill', 'blue');
        this.nodeSelected = null;
        return;
      }

      if (this.nodeSelected !== null) {
        this.svg.selectAll('.node circle').attr('fill', 'blue');
      }

      d3.select(event.target).attr('fill', 'orange');
      this.nodeSelected = d;
    })

    nodiDestinazione.on('click', (event: any, d: Node) => {
      if (this.nodeSelectedDestination === d) {
        d3.select(event.target).attr('fill', 'red');
        this.nodeSelectedDestination = null;
        return;
      }

      if (this.nodeSelectedDestination !== null) {
        this.svg.selectAll('.node-destination circle').attr('fill', 'red');
      }

      d3.select(event.target).attr('fill', 'orange');
      this.nodeSelectedDestination = d;
    })
  }

  private drawHiveGraph(data: any, origins: Set<Node>, destinations: Set<Node>) {
    // Implementazione del grafico a nido d'ape
    // Da implementare in futuro
    console.log("Hive graph not implemented yet");
  }

  getSelectedNodes(): { origin: Node | null, destination: Node | null } {
    return {
      origin: this.nodeSelected,
      destination: this.nodeSelectedDestination
    };
  }

  drawLegend() {
    if(this.elementLegend) {
      d3.select(this.elementLegend).select('svg').remove();
    }
    const legendWidth = 300;
    const legendHeight = 20;
    this.colorScale = d3.scaleSequential()
      .domain(this.domain)  // I tuoi valori min/max
      .interpolator(d3.interpolateTurbo);

    const svgLegend = d3.select(this.elementLegend).append('svg')
      .attr("width", legendWidth + 50)
      .attr("height", legendHeight + 40);


    const legendContainer = svgLegend.append("g")
      .attr("transform", "translate(25, 10)");

    const domain = this.colorScale.domain();
    const legendData = d3.range(legendWidth).map(i => {
      const t = i / (legendWidth - 1);
      return domain[0] + t * (domain[1] - domain[0]);
    });

    legendContainer.selectAll("rect")
      .data(legendData)
      .enter().append("rect")
      .attr("x", (d, i) => i)
      .attr("y", 0)
      .attr("width", 1)
      .attr("height", legendHeight)
      .style("fill", d => this.colorScale(d));

    const axis = d3.axisBottom(
      d3.scaleLinear()
        .domain(domain)
        .range([0, legendWidth])
    ).ticks(5);

    legendContainer.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(axis);
  }

  deleteAll() {
    //elimina tutti gli svg
    if (this.svg) {
      d3.select(this.element).select('svg').remove();
      d3.select(this.element).select('div.tooltip').remove();
    }
    if(this.elementLegend) {
      d3.select(this.elementLegend).select('svg').remove();
    }
  }
}
