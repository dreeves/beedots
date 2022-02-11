// Draw some dots, user can click them to make them disappear, click elsewhere
// to make new ones, and drag them around. The coordinates of all the dots are
// shown in real time below the graph.

/* global d3 [listed here to shut jslint up] */

const ML = 31 // left margin
const MR = 31 // right margin
const MT = 11 // top margin
const MB = 31 // bottom margin
const DR = 16*3 // dot radius

const W = window.innerWidth    - ML - MR // width of the window w/o the margins
const H = window.innerHeight/2 - MT - MB // height of the window w/o the margins

const xsc  = d3.scaleLinear([0,1], [0,W]) // Scale/lerp from [0,1] to [0,W]
const ysc  = d3.scaleLinear([0,1], [H,0]) //   and similar for the y-axis.
const xsci = d3.scaleLinear([0,W], [0,1]) // Inverse-lerp to go from pixel coords
const ysci = d3.scaleLinear([H,0], [0,1]) //   back to math coords.

const N = 10 // create this many dots/points initially
let points = Array.from({length: N}, (_,i) => ({ i: i+1,
                                                 x: (i+1/2)/N,
                                                 y: Math.random(),   }))

const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10)

const svg = d3.select('#graph').append('svg').attr('width',  W + ML + MR)
                                             .attr('height', H + MT + MB)

svg.append('g').attr('transform', tr(H)).call(d3.axisBottom(xsc).ticks(10))
svg.append('g').attr('transform', tr() ).call(d3.axisLeft(  ysc).ticks(10))

// Make a big transparent rectangle you can click on to create new circles
svg.append('g').attr('transform', tr()).append('rect')
  .style('opacity', 0).attr('width', W).attr('height', H).on('click', conjure)

const tbl = d3.select('#data')

updateC()

function tr(h=0) { return `translate(${ML},${MT+h})` } // svg translation

function conjure(event) {
  let [xm, ym] = d3.pointer(event)
  points.push({ i: points.length > 0 ? Math.max(...points.map(d=>d.i))+1 : 1,
                x: xsci(xm),
                y: ysci(ym) })
  updateC()
} 

function destroy(event, d) {
  points = points.filter(z => z.i !== d.i)
  updateC()
}

// -----------------------------------------------------------------------------
// Why do we need to offset by the top and left margins when dragging the dot 
// but we don't need to do that when creating the dot? The internet is
// suggesting -- https://stackoverflow.com/a/29713231/4234 -- that it has to do
// the 'g' (group) element in the SVG?
// -----------------------------------------------------------------------------

function dragstart(event, d) {
  
}

function ondrag(event, d) {
  const [xp, yp] = [xsc(d.x) + ML,                // initial pixel coords of dot
                    ysc(d.y) + MT]
  const [xm, ym] = [event.sourceEvent.offsetX - ML,     // pixel coords of mouse
                    event.sourceEvent.offsetY - MT]
  const [dx, dy] = [xp-xm, yp-ym]
  
  console.log(`\
(x,y)   = (${d.x},${d.y})
(xp,yp) = (${xp},${yp})
(xo,yo) = (${d3.pointer(event)})
(xe,ye) = (${event.x},${event.y})
(sx,sy) = (${event.sourceEvent.offsetX},${event.sourceEvent.offsetY})
(dx,dy) = (${event.dx},${event.dy})
`)
  
  d.x = xsci(xm)
  d.y = ysci(ym)
  d3.select(this).attr("cx", xm)
                 .attr("cy", ym)
  updateT() // only have to update the table while dragging
}

// Update the table shown below the graph
function updateT() {
  tbl.selectAll('tr').data(points.map(d => [d.i, d.x, d.y]))
    .join('tr').selectAll('td').data(_=>_)
    .join('td').text(_=>_)
}

// Update the circles (and also the table)
function updateC() {
  svg.selectAll('circle').data(points).join('circle')
    .attr('transform', tr())
    .attr('r', DR)
    .attr('cx', d => xsc(d.x))
    .attr('cy', d => ysc(d.y))
    .attr('stroke-width', '2px').attr('stroke', 'black')
    .style('fill', (d,i) => colorScale(d.i))
    .on('click', destroy)
    .call(d3.drag()
      //.container(d3.select('#graph'))
      //.subject(d => ({x: xsc(d.x), y: ysc(d.y)}))
      .on("drag", ondrag))
  updateT()
}