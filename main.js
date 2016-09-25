function randomBool() {
  return Math.random() > 0.5
}

function getWindowParams() {
  cellsInRow = Math.floor(window.innerWidth/10)
  maxRows = Math.floor((window.innerHeight - 29)/10)
}

function divsToBool(tuple) {
  return tuple.map(function(e){
    return e.classList.contains('active') ? 1 : 0
  })
}

function setState(node, stateNum, inAutomata) {
  // remove all existing classes
  node.classList.remove('active')
  node.classList.remove('inactive')
  node.classList.remove('random')

  switch(stateNum) {
    case 1:
      targetClass = 'active'
      break;
    case 0:
      targetClass = 'inactive'
      break;
    case -1:
      if (inAutomata) {
        targetClass = randomBool() ? 'active' : 'inactive'
      } else {
	targetClass = 'random'
      }
  }
  node.classList.add(targetClass)
}

function newRow(rule, firstRow) {
  let row = document.createElement('div')
  row.classList.add('row')

  if (!firstRow) {
    parentRow = document.querySelector('#automaton').lastChild.children
  }

  let targetClass = ''

  for (let i = 0; i < cellsInRow; i++) {
    let div = document.createElement('div')
    if (firstRow) {
      // just randomize
      div.classList.add(randomBool() ? 'active' : 'inactive')
    } else {

      /* NOTE:
         We need to conver the 3-tuple (array) to a string for
         hashing in the Map because of the way array comparison
         happens in JavaScript.
       */
      // apply rule set
      parentTuple = divsToBool([
        parentRow[(i-1 + cellsInRow) % cellsInRow],
        parentRow[i],
        parentRow[(i+1) % cellsInRow]]).toString()

      setState(div, rule.get(parentTuple), true)
      // switch(rule.get(parentTuple)) {
      //   case 1:
      //     targetClass = 'active'
      //     break;
      //   case 0:
      //     targetClass = 'inactive'
      //     break;
      //   case -1:
      //     targetClass = randomBool() ? 'active' : 'inactive'
      // }
      // div.classList.add(targetClass)
    }
    row.appendChild(div)
  }

  // delete a row if necessary
  allRows = document.querySelectorAll('.row')
  if (allRows.length >= maxRows) {
    let firstRow = allRows[0]
    firstRow.parentElement.removeChild(firstRow)
  }

  document.querySelector('#automaton').appendChild(row)
}

function reset() {
  var automaton = document.getElementById('automaton')
  while (automaton.firstChild) {
    automaton.removeChild(automaton.firstChild)
  }

  // setup colors
  setColor()

  // populate first row
  newRow({}, true)
}

function createRuleMap(ruleList) {
  let map = new Map()
  for (let i = 0; i < ruleList.length; i++) {
    // create the map
    map.set(ruleList[i][0].toString(), ruleList[i][1])

    // adjust visualizer colors based on map
    let strrep = ruleList[i][0].join('')
    let selector = `#rule-box-${strrep} tr .toggle`
    node = document.querySelector(selector)

    setState(node, ruleList[i][1], false)
  }

  return map
}

function setColor() {
  // delete existing styles
  allStyle = document.querySelectorAll('html > head > style')
  allStyle.forEach(function(node) {
    if (node.tagName == 'STYLE') {
      node.parentNode.removeChild(node)
    }
  })

  // add new styles
  var classes = ['active', 'inactive']
  classes.forEach(function(entry) {
    let color = document.getElementById(`${entry}-color-picker`).value

    css = `.${entry} { background-color: ${color}; }`
    style = document.createElement('style')
    style.appendChild(document.createTextNode(css))
    document.head.appendChild(style)
  })
}

/*
 * Main
 */

let waittime = 100 // milliseconds

// setup # of rows and row sizes
getWindowParams()

// initialize first row
reset()

// Default CA Rules
let allRules = new Map()
allRules.set('random', [
  [[1,1,1], -1],
  [[1,1,0], -1],
  [[1,0,1], -1],
  [[1,0,0], -1],
  [[0,1,1], -1],
  [[0,1,0], -1],
  [[0,0,1], -1],
  [[0,0,0], -1]])

allRules.set('slideRight', [
  [[1,1,1], 1],
  [[1,1,0], 1],
  [[1,0,1], 1],
  [[1,0,0], 1],
  [[0,1,1], 0],
  [[0,1,0], 0],
  [[0,0,1], 0],
  [[0,0,0], 0]])

allRules.set('rule110', [
  [[1,1,1], 0],
  [[1,1,0], 1],
  [[1,0,1], 1],
  [[1,0,0], 0],
  [[0,1,1], 1],
  [[0,1,0], 1],
  [[0,0,1], 1],
  [[0,0,0], 0]])

allRules.set('rule110Random', [
  [[1,1,1], -1],
  [[1,1,0], 1],
  [[1,0,1], 1],
  [[1,0,0], 0],
  [[0,1,1], 1],
  [[0,1,0], 1],
  [[0,0,1], -1],
  [[0,0,0], 0]])

ruleMap = createRuleMap(allRules.get('random'))

// main event loop
setInterval(function(){newRow(ruleMap, false)}, waittime)


/*
 * Event-based logic
 */

// changes to rule selector
document.querySelector('#rule-selector').onchange = function(){
  let ruleName = this.options[this.selectedIndex].value
  ruleMap = createRuleMap(allRules.get(ruleName))

  if (document.getElementById('reset-on-change').checked) {
    reset()
  }
}

// changes to color picker
document.getElementById('active-color-picker').onchange = setColor
document.getElementById('inactive-color-picker').onchange = setColor

// start over if the window is resized
window.onresize = function() {
  getWindowParams()
  reset()
}
