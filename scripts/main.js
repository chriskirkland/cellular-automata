function randomBool() {
  return Math.random() > 0.5;
}

function dec2bin(dec, minDigits) {
  // convert decimal integer to binary
  var bin = dec.toString(2);

  // pad with zeroes to achieve minDigits
  var pad = Math.max(minDigits - bin.length + 1, 1);
  var zeroes =  Array(pad).join("0");

  return zeroes + bin;
}

function getWindowParams() {
  menuHeight = document.getElementById("menu-bar").offsetHeight +
               document.getElementById("rule-visualizer").offsetHeight +
               document.getElementById("footer").offsetHeight;
  cellsInRow = Math.floor(window.innerWidth/10);
  maxRows = Math.floor((window.innerHeight - menuHeight)/10);
}

function divsToBool(tuple) {
  return tuple.map(function(e){
    return e.classList.contains("active") ? 1 : 0;
  }).join("");
}

function setState(node, stateNum, inAutomata) {
  // remove all existing classes
  node.classList.remove("active");
  node.classList.remove("inactive");
  node.classList.remove("random");

  targetClass = stateNumToString.get(stateNum);
  if (targetClass == "random" && inAutomata) {
    targetClass = randomBool() ? "active" : "inactive";
  }
  node.classList.add(targetClass);
}

function newRow(rule, firstRow) {
  var row = document.createElement("div");
  row.classList.add("row");

  if (!firstRow) {
    parentRow = document.querySelector("#automaton").lastChild.children;
  }

  var targetClass = "";

  for (var i = 0; i < cellsInRow; i++) {
    var div = document.createElement("div");
    if (firstRow) {
      // just randomize
      div.classList.add(randomBool() ? "active" : "inactive");
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
        parentRow[(i+1) % cellsInRow]]);

      setState(div, rule.get(parentTuple), true);
    }
    row.appendChild(div);
  }

  // devare a row if necessary
  allRows = document.querySelectorAll(".row");
  if (allRows.length >= maxRows) {
    firstRow = allRows[0];
    firstRow.parentElement.removeChild(firstRow);
  }

  document.querySelector("#automaton").appendChild(row);
}

function reset() {
  var automaton = document.getElementById("automaton");
  while (automaton.firstChild) {
    automaton.removeChild(automaton.firstChild);
  }

  // setup colors
  setColor();

  // populate first row
  newRow({}, true);
}

function createRuleMap(ruleList) {
  var map = new Map();
  for (var i = 0; i < ruleList.length; i++) {
    // create the map
    var binrep = dec2bin(7-i, 3);
    map.set(binrep, ruleList[i]);

    // adjust visualizer colors based on map
    var strrep = binrep;
    // var selector = `#rule-box-${strrep} tr .toggle`;  // 'illegal character' in FireFox
    var selector = "#rule-box-" + strrep + " tr .toggle";
    node = document.querySelector(selector);

    setState(node, ruleList[i], false);
  }

  return map;
}

function setColor() {
  // delete existing styles
  var allStyle = document.querySelectorAll("html > head > style");
  Array.prototype.forEach.call(allStyle, function(node) {
    if (node.tagName == "STYLE") {
      node.parentNode.removeChild(node);
    }
  });

  // add new styles
  var classes = ["active", "inactive"];
  Array.prototype.forEach.call(classes, function(entry) {
    // var color = document.getElementById(`${entry}-color-picker`).value;  // 'illegal character' in FireFox
    var color = document.getElementById(entry + "-color-picker").value;

    // css = `.${entry} { background-color: ${color}; }`;  // 'illegal character' in FireFox
    css = "." + entry + " { background-color: " + color + "; }";
    style = document.createElement("style");
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  });
}

function toggleRuleVisualization(){
  rulevis = document.getElementById("rule-visualizer");
  if (rulevis.style.display == "none") {
    rulevis.style.display = "";
  } else {
    rulevis.style.display = "none";
  }
}


/*
 * Main
 */

var waittime = 200; // milliseconds

// setup # of rows and row sizes
getWindowParams();

// initialize first row
reset();

// hide rule visualization bar
toggleRuleVisualization();


var stateStringToNum = new Map([
  ["random", -1],
  ["inactive", 0],
  ["active", 1]
]);

var stateNumToString = new Map([
  [-1, "random"],
  [0, "inactive"],
  [1, "active"]
]);

// Default CA Rules
var allRules = new Map();
allRules.set("random", [-1, -1, -1, -1, -1, -1, -1, -1]);
allRules.set("slideRight", [1, 1, 1, 1, 0, 0, 0, 0]);
allRules.set("rule30", [0, 0, 0, 1, 1, 1, 1, 0]);
allRules.set("rule110", [0, 1, 1, 0, 1, 1, 1, 0]);
allRules.set("rule110Random", [-1, 1, 1, 0, 1, 1, -1, 0]);
allRules.set("rule126", [0, 1, 1, 1, 1, 1, 1, 0]);
allRules.set("rule150", [1, 0, 0, 1, 0, 1, 1, 0]);
allRules.set("rule182", [1, 0, 1, 1, 0, 1, 1, 0]);

ruleMap = createRuleMap(allRules.get("random"));

// main event loop
setInterval(function(){
  newRow(ruleMap, false);
}, waittime);


/*
 * Event-based logic
 */

// changes to rule selector
document.querySelector("#rule-selector").onchange = function(){
  var ruleName = this.options[this.selectedIndex].value;
  ruleMap = createRuleMap(allRules.get(ruleName));

  if (document.getElementById("reset-on-change").checked) {
    reset();
  }
};

// changes to color picker
document.getElementById("active-color-picker").onchange = setColor;
document.getElementById("inactive-color-picker").onchange = setColor;

// visualize button click
document.getElementById("visualize-button").onclick = toggleRuleVisualization;

// rule toggles (i.e. how to change the active rules)
//
// Add onclick event to each item in the list; Probably not the most idiomatic
// way to do this...
Array.prototype.forEach.call(document.querySelectorAll("table tbody tr .toggle"), function(e) {
  e.onclick = function() {
    var currentStateNum = 1337;  // not a valid state
    var validStates = ["active", "inactive", "random"];
    for (var i = 0; i < e.classList.length; i++) {
      if (validStates.indexOf(e.classList[i]) >= 0) {
        currentStateNum = stateStringToNum.get(e.classList[i]);
        break;
      }
    }

    // validate we actually found a valid state
    if (currentStateNum == 1137) {
      throw new Error("element has no valid CA states : " + e.classList.toString());
    }

    // ♪ ring around the rosey ♪
    var newStateNum = ((currentStateNum+2) % 3) - 1;
    var newStateStr = stateNumToString.get(newStateNum);

    // get rule key (i.e. 111, 101, ...)
    // given parentID "rule-box-101", we want "101"
    var parentID = e.parentElement.parentElement.parentElement.id;
    var ruleKey = parentID.substring(9);

    // update rule
    ruleMap.set(ruleKey, newStateNum);

    // update visualization
    setState(e, newStateNum, false);
  };
});

// start over if the window is resized
window.onresize = function() {
  getWindowParams();
  reset();
};
