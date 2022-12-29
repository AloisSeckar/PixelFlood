// TODO for now it cannot be const due to re-assigning in insertMapCoord()
// but this should be changed...
let player = {
	color: "#0066FF",
	area: [
		[240,240],
		[280,240],
		[280,280],
		[240,280],
	]
};

let pc1 = {
	color: "#FF0000",
	area: [
		[40,40],
		[80,40],
		[80,80],
		[40,80],
	]
};

let pc2 = {
	color: "#FFCC00",
	area: [
		[440,440],
		[480,440],
		[480,480],
		[440,480],
	]
};

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
	repaintMap();
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
	gameTick = setInterval(expandAll, 5);
	score = setInterval(countScore, 500);
}

function timerStop() {
	clearInterval(gameTick);
	clearInterval(score);
}

/* player's areas repaint */
/* periodically in each "frame" while timer is active */
function repaintMap() {
	var canvas = document.getElementById("World");
	// flood fill with green color
	var ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.fillStyle = "#006600";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	// enclose whole area using stored vertexs
	repaintPlayerArea(ctx, player.color, player.area)
	repaintPlayerArea(ctx, pc1.color, pc1.area)
	repaintPlayerArea(ctx, pc2.color, pc2.area)
}

function repaintPlayerArea(ctx, color, area) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(area[0][0],area[0][1]);
	index = 1;
	while (index < area.length) {
		ctx.lineTo(area[index][0],area[index][1]); 
		index += 1;
	} 
	ctx.lineTo(area[0][0],area[0][1]);
	ctx.closePath();
	ctx.fill();
}

function expandAll() {
	expand(player)
	expand(pc1)
	expand(pc2)
	repaintMap(); // repaint player's area
}

/* expand player's area  */
/* somewhere on the "edge" of it */
function expand(entity) {
	let rand_vertex = 0;
	let options = [];
	while (options.length < 1) {
		// randomly select vertex to be expanded
		rand_vertex = getRandomVertex(entity);
 		// get available expansions (0-3)
		options = analyzePoint(entity.area[rand_vertex][0], entity.area[rand_vertex][1]);
		// if 0 options: vertex got enclosed by others => remove it
		if (options.length < 1) {
			entity.area.splice(rand_vertex, 1)
		}
	}
	
	const expansion = Math.round(Math.random() * (options.length - 1)); // radomly select one of available
	entity.area[rand_vertex] = options[expansion]; // expand map in selected direction
}

/* randomly select vertex of player's area */
/* either random existing one or split longest line to create new */
function getRandomVertex(entity) {
	// decide between selecting and splitting (1% chance) // TODO test ideal probability...
	if (Math.random()>0.99) {
		const area = entity.area
		const longest = { 
			length: -1,
			from: -1,
			to: -1
		 }
		// find the longest line
		for (let index = 0; index < area.length; index++) {
			const i1 = index;
			const i2 = index < area.length - 1 ? index + 1 : 0;
			
			const a = area[i1][0] - area[i1][0];
			const b = area[i1][1] - area[i2][1];
			const c = Math.sqrt( a*a + b*b );

			if (c > longest.length) {
				longest.length = c;
				longest.from = i1;
				longest.to = i2;
			}
		}
		// split it in half
		// get the midpoint
		const x_mid = Math.round((area[longest.from][0] + area[longest.to][0]) / 2);
		const y_mid = Math.round((area[longest.from][1] + area[longest.to][1]) / 2);
		// create new point
		const newPoint = [x_mid, y_mid];
		// insert it into existing vertexes (what, where)
		insertMapCoord(entity, newPoint, longest.from);
		//
		return longest.from + 1;
	} else {
		// just select existing vertex
		return Math.round(Math.random() * (entity.area.length - 1));
	}
}

/* check for given point neighbours */
/* find those that are available for expansion (not red) */
function analyzePoint(x, y) {
	const results = [];
	// check "east"
	if (getPixelColor(x-1,y)=="006600") {
		results.push([x-1,y]);
	}
	// check "west"
	if (getPixelColor(x+1,y)=="006600") {
		results.push([x+1,y]);
	}
	// check "north"
	if (getPixelColor(x,y-1)=="006600") {
		results.push([x,y-1]);
	}
	// check "south"
	if (getPixelColor(x,y+1)=="006600") {
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
	return data[0].toString(16).padStart(2, '0') + data[1].toString(16).padStart(2, '0') + data[2].toString(16).padStart(2, '0');
}

/* insert given point into existing map coordinates */
/* create new vertex AFTER given index */
function insertMapCoord(entity, point, index) {
	if (index == entity.area.length - 1) {
		// just append the element to the end
		entity.area.push(point);
	} else {
		// new array must be created from:
		// part until index (including) + new element at index+1 + rest of orig array
		arr1 = entity.area.slice(0, index + 1);
		arr2 = [point];
		arr3 = entity.area.slice(index + 1);
		//
		entity.area = arr1.concat(arr2, arr3);
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

function countScore() {
	// from blog: 
	// https://www.thecodingcouple.com/counting-pixels-in-the-browser-with-the-html5-canvas-and-the-imagedata-object/

	const canvas = document.getElementById('World');
	const context = canvas.getContext('2d');  
	const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

	const colorCounts = [];
    for(let index = 0; index < data.length; index += 4) {
        const rgba = `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${(data[index + 3] / 255)})`;
        if (rgba in colorCounts) {
            colorCounts[rgba] += 1;
        } else {
            colorCounts[rgba] = 1;
        }
    }

	let currentScore = '';
	currentScore += "PLR: " + colorCounts['rgba(0, 102, 255, 1)'] + '<br />';
	currentScore += "PC1: " + colorCounts['rgba(255, 0, 0, 1)'] + '<br />';
	currentScore += "PC2: " + colorCounts['rgba(255, 204, 0, 1)'] + '<br />';

	const scores = document.getElementById('Scores');
	scores.innerHTML = currentScore;

}