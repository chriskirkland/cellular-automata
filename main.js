// automatic sizing
let cellsInRow = window.innerWidth/10
let maxRows = window.innerHeight/10 - 1

let waittime = 100 // milliseconds

function randomBool() {
  return Math.random() > 0.5
}

function divsToBool(tuple) {
  return tuple.map(function(e){
    return e.classList.contains('active') ? 1 : 0
  })
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
        parentRow[(i-1 +cellsInRow) % cellsInRow],
        parentRow[i],
        parentRow[(i+1) % cellsInRow]]).toString()

      switch(rule.get(parentTuple)) {
        case 1:
          targetClass = 'active'
          break;
        case 0:
          targetClass = 'inactive'
          break;
        case -1:
          targetClass = randomBool() ? 'active' : 'inactive'
      }
      div.classList.add(targetClass)
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

  newRow({}, true)
}

function createRuleMap(ruleList) {
  let map = new Map()
  for (let i = 0; i < ruleList.length; i++) {
    map.set(ruleList[i][0].toString(), ruleList[i][1])
  }

  return map
}

// initialize first row
reset()

let allRules = new Map()
// random rule
allRules.set('random', [
  [[1,1,1], -1],
  [[1,1,0], -1],
  [[1,0,1], -1],
  [[1,0,0], -1],
  [[0,1,1], -1],
  [[0,1,0], -1],
  [[0,0,1], -1],
  [[0,0,0], -1]])

// slide right
allRules.set('slideRight', [
  [[1,1,1], 1],
  [[1,1,0], 1],
  [[1,0,1], 1],
  [[1,0,0], 1],
  [[0,1,1], 0],
  [[0,1,0], 0],
  [[0,0,1], 0],
  [[0,0,0], 0]])

// rule 110
allRules.set('rule110', [
  [[1,1,1], 0],
  [[1,1,0], 1],
  [[1,0,1], 1],
  [[1,0,0], 0],
  [[0,1,1], 1],
  [[0,1,0], 1],
  [[0,0,1], 1],
  [[0,0,0], 0]])

// rule 110 + some randomness
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
// listen for updates to the selector
document.querySelector('#rule-selector').onchange = function(){
  let ruleName = this.options[this.selectedIndex].value
  ruleMap = createRuleMap(allRules.get(ruleName))

  if (document.getElementById('reset-on-change').checked) {
    reset()
  }
}

setInterval(function(){newRow(ruleMap, false)}, waittime)
