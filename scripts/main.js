function randomBool() {
  return Math.random() > 0.5
}

function dec2bin(dec, minDigits) {
  // convert decimal integer to binary
  let bin = dec.toString(2)

  // pad with zeroes to achieve minDigits
  let pad = Math.max(minDigits - bin.length + 1, 1)
  let zeroes =  Array(pad).join('0')

  return zeroes + bin
}

function computedHeight(id) {
  var elem = document.getElementById(id)
  var styles = window.getComputedStyle(elem)
  var computed = Math.ceil(elem.offsetHeight +
                           parseFloat(styles['margin-top']) +
                           parseFloat(styles['margin-bottom']))
  console.log(computed)

  if (isNaN(computed)) {
    return computed
  } else {
    return elem.offsetHeight
  }
}

function getWindowParams() {
  // menuHeight = document.getElementById('menu-bar').offsetHeight +
  // menuHeight = computedHeight('menu-bar') +  // correct, but doesn't work because 'menu-bar' height is wrong...
  menuHeight = 49 +  // 'menu-bar' height w/ padding + margin
               document.getElementById('rule-visualizer').offsetHeight +
               document.getElementById('footer').offsetHeight
  cellsInRow = Math.floor(window.innerWidth/10)
  maxRows = Math.floor((window.innerHeight - menuHeight)/10)

  document.getElementById('automaton').style.maxHeight = maxRows * 10
}

function divsToBool(tuple) {
  return tuple.map(function(e){
    return e.classList.contains('active') ? 1 : 0
  }).join('')
}

function setState(node, stateNum, inAutomata) {
  // remove all existing classes
  node.classList.remove('active')
  node.classList.remove('inactive')
  node.classList.remove('random')

  targetClass = stateNumToString.get(stateNum)
  if (targetClass == 'random' && inAutomata) {
    targetClass = randomBool() ? 'active' : 'inactive'
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
        parentRow[(i+1) % cellsInRow]])

      setState(div, rule.get(parentTuple), true)
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
    let binrep = dec2bin(7-i, 3)
    map.set(binrep, ruleList[i])

    // adjust visualizer colors based on map
    let strrep = binrep
    let selector = `#rule-box-${strrep} tr .toggle`
    node = document.querySelector(selector)

    setState(node, ruleList[i], false)
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

function toggleRuleVisualization(){
  rulevis = document.getElementById('rule-visualizer')
  if (rulevis.style.display == 'none') {
    rulevis.style.display = ''
  } else {
    rulevis.style.display = 'none'
  }
}


/*
 * Main
 */

let waittime = 100 // milliseconds

// hide rule visualization bar
toggleRuleVisualization()

// setup # of rows and row sizes
getWindowParams()

// initialize first row
reset()


let stateStringToNum = new Map([
  ['random', -1],
  ['inactive', 0],
  ['active', 1]
])

let stateNumToString = new Map([
  [-1, 'random'],
  [0, 'inactive'],
  [1, 'active']
])

// Default CA Rules
let allRules = new Map()
allRules.set('random', [-1, -1, -1, -1, -1, -1, -1, -1])
allRules.set('slideRight', [1, 1, 1, 1, 0, 0, 0, 0])
allRules.set('rule30', [0, 0, 0, 1, 1, 1, 1, 0])
allRules.set('rule110', [0, 1, 1, 0, 1, 1, 1, 0])
allRules.set('rule110Random', [-1, 1, 1, 0, 1, 1, -1, 0])
allRules.set('rule126', [0, 1, 1, 1, 1, 1, 1, 0])
allRules.set('rule150', [1, 0, 0, 1, 0, 1, 1, 0])
allRules.set('rule182', [1, 0, 1, 1, 0, 1, 1, 0])

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

// visualize button click
document.getElementById('visualize-button').onclick = toggleRuleVisualization

// rule toggles (i.e. how to change the active rules)
//
// Add onclick event to each item in the list; Probably not the most idiomatic
// way to do this...
document.querySelectorAll('table tbody tr .toggle').forEach(function(e) {
  e.onclick = function() {
    let currentStateNum = 1337  // not a valid state
    let validStates = ['active', 'inactive', 'random']
    for (let i = 0; i < e.classList.length; i++) {
      if (validStates.indexOf(e.classList[i]) >= 0) {
        currentStateNum = stateStringToNum.get(e.classList[i])
        break
      }
    }

    // validate we actually found a valid state
    if (currentStateNum == 1137) {
      throw new Error("element has no valid CA states : " + e.classList.toString())
    }

    // ♪ ring around the rosey ♪
    let newStateNum = ((currentStateNum+2) % 3) - 1
    let newStateStr = stateNumToString.get(newStateNum)

    // get rule key (i.e. 111, 101, ...)
    // given parentID "rule-box-101", we want "101"
    let parentID = e.parentElement.parentElement.parentElement.id
    let ruleKey = parentID.substring(9)

    // update rule
    ruleMap.set(ruleKey, newStateNum)

    // update visualization
    setState(e, newStateNum, false)
  }
})

// start over if the window is resized
window.onresize = function() {
  getWindowParams()
  reset()
}