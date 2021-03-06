/* global data */
var globalMap; // info about vertexes of player's area polygon


/* window initialization */
function initCanvas() {
	var canvas = document.getElementById("World");
	// resize canvas to fit into page (thanks http://stackoverflow.com/a/8626338/3204544)
	var pane = document.getElementById("CentralPanel");
	canvas.width = pane.clientWidth;
	canvas.height = pane.clientHeight;
	initMap();
}

/* map initialization */
function initMap() {
	var canvas = document.getElementById("World");
	var ctx = canvas.getContext("2d");
	// flood fill with green color
	ctx.fillStyle = "#006600";
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

/* initialize new game */
/* globalMap - given info about player's area */
function initGame(map) {
	globalMap = map;
	// reset map
	initMap();
	// fill player's initial area
	drawPlayersArea();
	// run game
	timerStart();
}

/* pause button */
function pause() {
	var btn = document.getElementById("PauseButton");
	if (btn.innerHTML=="Pause") {
		btn.innerHTML="Resume";
		timerStop();
	} else {
		btn.innerHTML="Pause";
		timerStart();
	}
}

/* start game timer */
function timerStart() {
	gameTick = setInterval(expand, 50);
}

/* stop game timer */
function timerStop() {
	clearInterval(gameTick);
}

/* player's area repaint */
/* periodically in each "frame" while timer is active */
function drawPlayersArea() {
	var canvas = document.getElementById("World");
	var ctx = canvas.getContext("2d");
	// flood fill with green color
	ctx.fillStyle = "#006600";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	// enclose whole area using stored vertexs
	ctx.fillStyle = "#FF0000";
	ctx.beginPath();
	ctx.moveTo(globalMap[0][0],globalMap[0][1]);
	index = 1;
	while (index < globalMap.length) {
		ctx.lineTo(globalMap[index][0],globalMap[index][1]); 
		index += 1;
	} 
	ctx.lineTo(globalMap[0][0],globalMap[0][1]);
	ctx.closePath();
	ctx.fill();
}

/* expand player's area  */
/* somewhere on the "edge" of it */
function expand() {
	// randomly select vertex to be expanded
	var rand_vertex = getRandomVertex();
	// randomly select expansion direction
	// (must be place that is not occupied already)
	var options = analyzePoint(globalMap[rand_vertex][0], globalMap[rand_vertex][1]); // get available expansions (1-3)
	
	// check for error
	if (options.length < 1) {
		var newElement = document.createElement('p');
		newElement.innerHTML = "encountered problem - nowhere to expand for [" + globalMap[rand_vertex][0] + "," + globalMap[rand_vertex][1] + "] at index " + rand_vertex + "<br /><br />current polygon: " + globalMap;
		document.getElementById("OutputWindow").appendChild(newElement);
	} // if error - following code will crash...
	
	var expansion = Math.round(Math.random() * (options.length - 1)); // radomly select one of available
	globalMap[rand_vertex] = options[expansion]; // expand map in selected direction
	// repaint player's area
	drawPlayersArea();
}

/* randomly select vertex of player's area */
/* either random existing one or split random line to create new */
function getRandomVertex() {
	// decide between selecting and splitting (10% chance) // TODO test ideal probability...
	if (Math.random()>0.9) {
		// split line
		// first - select one of vertexes
		var v1 = Math.round(Math.random() * (globalMap.length - 1));
		// second - get vertex on the line with this vertex
		var v2;
		if (v1 == globalMap.length - 1) {
			v2 = 0;
		} else {
			v2 = v1 + 1;
		}
		// get the midpoint
		var x_mid = Math.round((globalMap[v1][0] + globalMap[v2][0]) / 2);
		var y_mid = Math.round((globalMap[v1][1] + globalMap[v2][1]) / 2);
		// create new point
		var newPoint = [x_mid, y_mid];
		// insert it into existing vertexes (what, where)
		insertMapCoord(newPoint, v1);
		//
		return v1 + 1;
	} else {
		// just select existing vertex
		var v1 = Math.round(Math.random() * (globalMap.length - 1));	
		//
		return v1;
	}
}

/* check for given point neighbours */
/* find those that are available for expansion (not red) */
function analyzePoint(x, y) {
	var results = [];
	// check "east"
	if (getPixelColor(x-1,y)!="ff00") {
		results.push([x-1,y]);
	}
	// check "west"
	if (getPixelColor(x+1,y)!="ff00") {
		results.push([x+1,y]);
	}
	// check "north"
	if (getPixelColor(x,y-1)!="ff00") {
		results.push([x,y-1]);
	}
	// check "south"
	if (getPixelColor(x,y+1)!="ff00") {
		results.push([x,y+1]);
	}
	//
	return results;
}

/* get current color of given pixel */
/* in hex format */
function getPixelColor(x, y) {
	var canvas = document.getElementById("World");
	var ctx = canvas.getContext("2d");
	// get color of pixel
	data = ctx.getImageData(x, y, 1, 1).data;
	// build hex string from extracted data
	return data[0].toString(16) + data[1].toString(16) + data[2].toString(16);
}

/* insert given point into existing map coordinates */
/* create new vertex AFTER given index */
function insertMapCoord(point, index) {
	if (index == globalMap.length - 1) {
		// just append the element to the end
		globalMap.push(point);
	} else {
		// new array must be created from:
		// part until index (including) + new element at index+1 + rest of orig array
		arr1 = globalMap.slice(0, index + 1);
		arr2 = [point];
		arr3 = globalMap.slice(index + 1);
		//
		globalMap = arr1.concat(arr2, arr3);
	}
}

/* draw random pixel (test purposes) */
/*
function drawPixel() {
	var canvas = document.getElementById("World");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";
	var x = Math.floor((Math.random() * canvas.width) + 1); // random x-coord
	var y = Math.floor((Math.random() * canvas.height) + 1); // random y-coord
	ctx.fillRect( x, y, 5, 5 ); // draw "pixel"
}
*/