// TODO for now it cannot be const due to re-assigning in insertMapCoord()
// but this should be changed...
let playerArea = [
	[380,280],
	[420,280],
	[420,320],
	[380,320],
];

function initMap() {
	// resize canvas to fit into page (thanks http://stackoverflow.com/a/8626338/3204544)
	const pane = document.getElementById("Content");
	
	const canvas = document.getElementById("World");
	canvas.width = pane.clientWidth;
	canvas.height = pane.clientHeight;

	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.fillStyle = "#006600";
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

function initGame() {
	initMap();
	drawPlayersArea();
	timerStart();
}

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

function timerStart() {
	gameTick = setInterval(expand, 5);
}

function timerStop() {
	clearInterval(gameTick);
}

/* player's area repaint */
/* periodically in each "frame" while timer is active */
function drawPlayersArea() {
	var canvas = document.getElementById("World");
	// flood fill with green color
	var ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.fillStyle = "#006600";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	// enclose whole area using stored vertexs
	ctx.fillStyle = "#FF0000";
	ctx.beginPath();
	ctx.moveTo(playerArea[0][0],playerArea[0][1]);
	index = 1;
	while (index < playerArea.length) {
		ctx.lineTo(playerArea[index][0],playerArea[index][1]); 
		index += 1;
	} 
	ctx.lineTo(playerArea[0][0],playerArea[0][1]);
	ctx.closePath();
	ctx.fill();
}

/* expand player's area  */
/* somewhere on the "edge" of it */
function expand() {
	let rand_vertex = 0;
	let options = [];
	while (options.length < 1) {
		// randomly select vertex to be expanded
		rand_vertex = getRandomVertex();
 		// get available expansions (0-3)
		options = analyzePoint(playerArea[rand_vertex][0], playerArea[rand_vertex][1]);
		// if 0 options: vertex got enclosed by others => remove it
		if (options.length < 1) {
			playerArea.splice(rand_vertex, 1)
		}
	}
	
	const expansion = Math.round(Math.random() * (options.length - 1)); // radomly select one of available
	playerArea[rand_vertex] = options[expansion]; // expand map in selected direction
	drawPlayersArea(); // repaint player's area
}

/* randomly select vertex of player's area */
/* either random existing one or split random line to create new */
function getRandomVertex() {
	// decide between selecting and splitting (0.1% chance) // TODO test ideal probability...
	if (Math.random()>0.999) {
		// split line
		// first - select one of vertexes
		var v1 = Math.round(Math.random() * (playerArea.length - 1));
		// second - get vertex on the line with this vertex
		var v2;
		if (v1 == playerArea.length - 1) {
			v2 = 0;
		} else {
			v2 = v1 + 1;
		}
		// get the midpoint
		var x_mid = Math.round((playerArea[v1][0] + playerArea[v2][0]) / 2);
		var y_mid = Math.round((playerArea[v1][1] + playerArea[v2][1]) / 2);
		// create new point
		var newPoint = [x_mid, y_mid];
		// insert it into existing vertexes (what, where)
		insertMapCoord(newPoint, v1);
		//
		return v1 + 1;
	} else {
		// just select existing vertex
		var v1 = Math.round(Math.random() * (playerArea.length - 1));	
		//
		return v1;
	}
}

/* check for given point neighbours */
/* find those that are available for expansion (not red) */
function analyzePoint(x, y) {
	const results = [];
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
	var ctx = canvas.getContext('2d', { willReadFrequently: true });
	// get color of pixel
	data = ctx.getImageData(x, y, 1, 1).data;
	// build hex string from extracted data
	return data[0].toString(16) + data[1].toString(16) + data[2].toString(16);
}

/* insert given point into existing map coordinates */
/* create new vertex AFTER given index */
function insertMapCoord(point, index) {
	if (index == playerArea.length - 1) {
		// just append the element to the end
		playerArea.push(point);
	} else {
		// new array must be created from:
		// part until index (including) + new element at index+1 + rest of orig array
		arr1 = playerArea.slice(0, index + 1);
		arr2 = [point];
		arr3 = playerArea.slice(index + 1);
		//
		playerArea = arr1.concat(arr2, arr3);
	}
}

/* draw random pixel (test purposes) */
/*
function drawPixel() {
	var canvas = document.getElementById("World");
	var ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.fillStyle = "#FF0000";
	var x = Math.floor((Math.random() * canvas.width) + 1); // random x-coord
	var y = Math.floor((Math.random() * canvas.height) + 1); // random y-coord
	ctx.fillRect( x, y, 5, 5 ); // draw "pixel"
}
*/