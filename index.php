<?php
	$mapData = array(
		array(380,280),
		array(420,280),
		array(420,320),
		array(380,320)
	);
?>

<!DOCTYPE html>
<html>
	<head>
		<title>PixelFlood 0.1</title>
		<link rel="stylesheet" type="text/css" href="styles.css">
		<script type="text/javascript" src="scripts.js"></script>
	</head>
	<body onload="initCanvas()">
		<h1>PixelFlood 0.1</h1>
		<div id="CentralPanel">
			<canvas id="World" width="800" height="600" onclick="drawPixel()"></canvas>
		</div>
		<div id="BottomPanel">
			<div id="MapCoords">
			</div>
			<br />
			<br />
			<br />
			<div id="ControlButtons">
				<button onclick="initGame(<?php echo json_encode($mapData); ?>)">Start the Flood</button>
				<button id="PauseButton" onclick="pause()">Pause</button>
			</div>
		</div>
		<div id="LeftSidePanel">
		 <ul id="OutputWindow">
		 </ul>
		</div>
		<div id="RightSidePanel">
		</div>
	</body>
</html>