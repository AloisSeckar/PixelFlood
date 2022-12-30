// TODO for now it cannot be const due to re-assigning in insertMapCoord()
// but this should be changed...
let player = {
	color: "#0066FF",
	area: [
		{ x: 240, y: 240, options: [[239,240],[240,239]] },
		{ x: 280, y: 240, options: [[281,240],[280,239]] },
		{ x: 280, y: 280, options: [[281,280],[280,281]] },
		{ x: 240, y: 280, options: [[239,280],[240,281]] },
	]
};

let pc1 = {
	color: "#FF0000",
	area: [
		{ x: 40, y: 40, options: [[39,40],[40,39]] },
		{ x: 80, y: 40, options: [[81,40],[80,39]] },
		{ x: 80, y: 80, options: [[81,80],[80,81]] },
		{ x: 40, y: 80, options: [[39,80],[40,81]] },
	]
};

let pc2 = {
	color: "#FFCC00",
	area: [
		{ x: 440, y: 440, options: [[439,440],[440,439]] },
		{ x: 480, y: 440, options: [[481,440],[480,439]] },
		{ x: 480, y: 480, options: [[481,480],[480,481]] },
		{ x: 440, y: 480, options: [[439,480],[440,481]] },
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
	expansion = setInterval(expandAll, 5);
	repaint = setInterval(repaintMap, 20);
	score = setInterval(countScore, 200);
}

function timerStop() {
	clearInterval(expansion);
	clearInterval(repaint);
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
	ctx.moveTo(area[0].x,area[0].y);
	index = 1;
	while (index < area.length) {
		ctx.lineTo(area[index].x,area[index].y); 
		index += 1;
	} 
	ctx.lineTo(area[0].x,area[0].y);
	ctx.closePath();
	ctx.fill();
}

function expandAll() {
	expand(player);
	expand(pc1);
	expand(pc2);
}

/* expand player's area  */
/* somewhere on the "edge" of it */
function expand(entity) {
	// randomly select vertex to be expanded
	const rand_vertex = getRandomExpandableVertex(entity);
	if (rand_vertex && rand_vertex.options.length > 0) {
		// radomly select one of available
		const expansion = Math.round(Math.random() * (rand_vertex.options.length - 1));
		// expand map in selected direction
		rand_vertex.x = rand_vertex.options[expansion][0];
		rand_vertex.y = rand_vertex.options[expansion][1];
		// analyze further expansion options
		rand_vertex.options = analyzePoint(rand_vertex.x, rand_vertex.y);
	} else {
		// TODO handle stop expanding when out of options
	}
}

/* randomly select vertex of player's area */
/* either random existing one or split longest line to create new */
function getRandomExpandableVertex(entity) {
	// decide between selecting and splitting (0.1% chance) // TODO test ideal probability...
	if (Math.random()>0.999) {
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
			
			const a = area[i1].x - area[i1].x;
			const b = area[i1].y - area[i2].y;
			const c = Math.sqrt( a*a + b*b );

			if (c > longest.length) {
				longest.length = c;
				longest.from = i1;
				longest.to = i2;
			}
		}
		// split it in half
		// get the midpoint
		const x_mid = Math.round((area[longest.from].x + area[longest.to].x) / 2);
		const y_mid = Math.round((area[longest.from].y + area[longest.to].y) / 2);
		// create new vertex
		const newVertex = {
			x: x_mid, 
			y: y_mid,
			options: analyzePoint(x_mid, y_mid) // TODO won't work if no options...
		}
		// insert it into existing vertexes (what, where)
		insertMapCoord(entity, newVertex, longest.from);
		//
		return entity.area[longest.from + 1];
	} else {
		// just select existing vertex
		const expandableVertices = entity.area.filter(v => v.options.length > 0);
		if (expandableVertices) {
			const rand = Math.round(Math.random() * (entity.area.length - 1));
			return expandableVertices[rand];
		} else {
			return null;
		}
	}
}

/* check for given point neighbours */
/* find those that are available for expansion (still green) */
function analyzePoint(x, y) {
	const options = [];
	// check "left"
	if (getPixelColor(x-1,y)=="006600") {
		options.push([x-1,y]);
	}
	// check "right"
	if (getPixelColor(x+1,y)=="006600") {
		options.push([x+1,y]);
	}
	// check "up"
	if (getPixelColor(x,y-1)=="006600") {
		options.push([x,y-1]);
	}
	// check "down"
	if (getPixelColor(x,y+1)=="006600") {
		options.push([x,y+1]);
	}
	//
	return options;
}

/* get current color of given pixel */
/* in hex format */
function getPixelColor(x, y) {
	var canvas = document.getElementById('World');
	var ctx = canvas.getContext('2d');
	// get color of pixel
	data = ctx.getImageData(x, y, 1, 1).data;
	// build hex string from extracted data
	return data[0].toString(16).padStart(2, '0') + data[1].toString(16).padStart(2, '0') + data[2].toString(16).padStart(2, '0');
}

/* create new vertex AFTER given index */
function insertMapCoord(entity, newVertex, index) {
	if (index == entity.area.length - 1) {
		// just append the element to the end
		entity.area.push(newVertex);
	} else {
		// new array must be created from:
		// part until index (including) + new element at index+1 + rest of orig array
		arr1 = entity.area.slice(0, index + 1);
		arr2 = [newVertex];
		arr3 = entity.area.slice(index + 1);
		//
		entity.area = arr1.concat(arr2, arr3);
	}
}

function countScore() {
	let currentScore = '';
	currentScore += "PLR: " + calcArea(player.area) + '<br />';
	currentScore += "PC1: " + calcArea(pc1.area) + '<br />';
	currentScore += "PC2: " + calcArea(pc2.area) + '<br />';

	const scores = document.getElementById('Scores');
	scores.innerHTML = currentScore;
}

function calcArea(vertices) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i].x;
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      var subY = vertices[i].y;

      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }

    return Math.abs(total);
}