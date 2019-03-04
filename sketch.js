function setup() {

///////these are the parameters you can play with to change behavior of program///////////////
	maxradius = 15; //the size of the circles when theyre drawn to max size
	method = "clickboom"; //can be "mouse", "random walk", or "clickboom"
	moverange = 1.5; //for randomwalk, establishing how far it can jump per move
	momentum = 2; //how many steps to take before changing direction in random walk
	boomrad = 12; //the radius of the boom in clickboom
	timeBetweenStep = 35; //how much time in milliseconds to wait until taking the next step in animation
	rate = 0.95; //general rate of circle size change
	decayspeed = 0.5; //speed of decay of circle size
////////////////////////////////////////////////////////////////////////////////////////////

	var w = window.innerWidth;
	var h = window.innerHeight;
	width = w-maxradius;
	height = h-maxradius;

	createCanvas(width, height);
	noStroke();
	background(0);

	numBallsHoriz = Math.floor(width/(2*maxradius)) + 1;
	numBallsVert = Math.floor(height/(2*maxradius)) + 2;
	//add 1 to cover entire canvas

	pointsqueue = [];
	x = 15;
	y = 15;
	stepmark = millis();
	momentumCounter = 0;
	xadd = 0;
	yadd = 0;

	mousePressFlag = false;
	clicklist = [];

	adder = [];
	size = [];
	direction = [];

	for (var i = 0; i < numBallsHoriz; i++) {
		size[i] = [];
		adder[i] = [];
		direction[i] = [];
		for (var j = 0; j < numBallsVert; j++) {
			size[i][j] = 0;
			adder[i][j] = 0;
			direction[i][j] = 1;
		}
	}
}

function draw() {

	var boompoints = [];
	if("mouse"==method) {
		x = Math.round(mouseX/(2*maxradius));
		y = Math.round(mouseY/(2*maxradius));
	} else if ("random walk" == method) {
		if(millis() - stepmark > timeBetweenStep) {
			stepmark = millis();
			randomWalk();
		}
	} else if ("clickboom" == method) {
		click();
		if(millis() - stepmark > timeBetweenStep) {
			stepmark = millis();
			boompoints = circularBoom();
		}
	}

	if ("clickboom" == method) {
		for(var q = 0; q<boompoints.length; q++) {
			p1 = boompoints[q][0];
			p2 = boompoints[q][1];
			if(p1 >= 0 && p2 >= 0 && p1 <= numBallsHoriz-1 && p2 <= numBallsVert && size[p1][p2] == 0) {
				size[p1][p2] = 3;
				adder[p1][p2] = 1;
				pointsqueue.push([p1, p2]);
			}
		}
	} else {
		if(x >= 0 && y >= 0 && x <= numBallsHoriz-1 && y <= numBallsVert && size[x][y] == 0) {
			size[x][y] = 3;
			adder[x][y] = 1;
			pointsqueue.push([x, y]);
		}
	}

	var len = pointsqueue.length;
	for(var k = 0; k < len; k++) {
		point = pointsqueue.shift();
		i = point[0];
		j = point[1];
		pointsqueue.push([i, j]);

		size[i][j]+=rate*direction[i][j]*adder[i][j];

		if(size[i][j] >= maxradius-1) {
			direction[i][j] = -1*decayspeed;
		}

		if(size[i][j] <= 0) {
			direction[i][j] = 1;
			adder[i][j] = 0;
			size[i][j] = 0;
			pointsqueue.pop();
		}

		//makes movement feel slightly more natural
		if (size[i][j] >= 0.8*maxradius) {
			adder[i][j] = 1.2;
		}

		fill(0);
		circle((2*i+1)*maxradius, (2*j+1)*maxradius, size[i][j] + decayspeed+1);

		var color = ballColor(i, j);
		fill(...color);

		circle((2*i+1)*maxradius, (2*j+1)*maxradius, size[i][j]);
	}
}

function randomWalk() {
	if(!momentumCounter) {
		do {
			xadd = round(moverange*(Math.random()*2 - 1));
			yadd = round(moverange*(Math.random()*2 - 1));
		} while(!(x+(xadd*momentum)>0 && x+(xadd*momentum)<numBallsHoriz-2 && y+(yadd*momentum)>1 && y+(yadd*momentum)<numBallsVert-2));
	}
	momentumCounter = (momentumCounter+1)%momentum;
	x+=xadd;
	y+=yadd;

}

function ballColor(i, j) {
	//this is an arbitrary color map - it can be made into a simple array which can then change value
	//can play around with this, for example turning it into a heat map of some sort
	var dist = ((i/numBallsHoriz) + (j/numBallsVert)) / 2; //manhattan distance (from 0 for top left corner to 1 for bottom right)
	var rotatedDist = (((numBallsHoriz - i)/numBallsHoriz) + (j/numBallsVert)) / 2;
	return [300*(1 - dist), 255 * rotatedDist, 300*(dist)]; //rgb caps out at 255 but you can put in higher, itll just put out 255
}

function click() {
	if (mousePressFlag) {
		mousePressFlag = false;
		x = Math.round(mouseX/(2*maxradius));
		y = Math.round(mouseY/(2*maxradius));
		clicklist.push([x, y, boomrad]); //put point in list for animation with 3rd parameter being number of steps for boom animation left
	}
}

function boom() {
	var boompoints = [];
	var len = clicklist.length;
	for(var k = 0; k < len; k++) {
		point = clicklist.shift();
		var [i, j, dec] = point;
		if (dec) {
			clicklist.push([i, j, dec-1]);
			var radius = (boomrad - dec);
			for(var q = 0; q<=2*radius; q++) { //add all points with manhattan radius of boomrad-dec to pointslist
				nonRepeatPush(boompoints, [(i + radius), (j - radius + q)]);
				nonRepeatPush(boompoints, [(i + radius - q), (j + radius)]);
				nonRepeatPush(boompoints, [(i - radius), (j + radius - q)]);
				nonRepeatPush(boompoints, [(i - radius + q), (j - radius)]);
			}
		}
	}
	return boompoints;
}

function circularBoom() {
	var boompoints = [];
	var len = clicklist.length;
	for(var k = 0; k < len; k++) {
		point = clicklist.shift();
		var [i, j, dec] = point;
		if (dec >= 0) {
			clicklist.push([i, j, dec-1]);
			var radius = (boomrad - dec);
			for (var q = 0; q<=radius; q++) {

				//the idea here is that we look at horizontal and vertical orientation
				//and then also look at floor and ceiling
				//but we can simply check to see if something is in the list to avoid duplicates
				var offset1 = Math.floor(Math.sqrt(radius*radius - q*q));
				var offset2 = Math.ceil(Math.sqrt(radius*radius - q*q));
				nonRepeatPush(boompoints, [(i + q), (j + offset1)]);
				nonRepeatPush(boompoints, [(i + q), (j - offset1)]);
				nonRepeatPush(boompoints, [(i - q), (j + offset1)]);
				nonRepeatPush(boompoints, [(i - q), (j - offset1)]);

				nonRepeatPush(boompoints, [(i + offset1), (j + q)]);
				nonRepeatPush(boompoints, [(i + offset1), (j - q)]);
				nonRepeatPush(boompoints, [(i - offset1), (j + q)]);
				nonRepeatPush(boompoints, [(i - offset1), (j - q)]);

				nonRepeatPush(boompoints, [(i + q), (j + offset2)]);
				nonRepeatPush(boompoints, [(i + q), (j - offset2)]);
				nonRepeatPush(boompoints, [(i - q), (j + offset2)]);
				nonRepeatPush(boompoints, [(i - q), (j - offset2)]);

				nonRepeatPush(boompoints, [(i + offset2), (j + q)]);
				nonRepeatPush(boompoints, [(i + offset2), (j - q)]);
				nonRepeatPush(boompoints, [(i - offset2), (j + q)]);
				nonRepeatPush(boompoints, [(i - offset2), (j - q)]);

			}
		}
	}
	return boompoints;
}

function nonRepeatPush(array, item) {
	if (array.indexOf(item) == -1) {
		array.push(item);
	}
}

function mousePressed() {
	mousePressFlag = true;
	return false;
}
