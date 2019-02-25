// let direction;
// let size;
// let width, heigth, numBallsHoriz, numBallsVert, maxradius;
// let rate;

function setup() {

	maxradius = 15;
	var w = window.innerWidth;
	var h = window.innerHeight;
	width = w-maxradius;
	height = h-maxradius;

	createCanvas(width, height);
	noStroke();
	background(0);

	numBallsHoriz = Math.floor(width/(2*maxradius)) + 2;
	numBallsVert = Math.floor(height/(2*maxradius)) + 2;
	//for some reason adding 2 to both  fixes a weird bug -
	rate = 0.45;

	adder = [];
	size = [];
	direction = []
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
	pointsqueue = [];
	x = 15;
	y = 15;
	mark = millis();
	moverange = 1.7;

	method = "mouse"; //can be "mouse" or "random walk"

}

function draw() {

	if("mouse"==method) {
		x = Math.round(mouseX/(2*maxradius));
		y = Math.round(mouseY/(2*maxradius));
	} else if ("random walk" == method) {
		if(millis() - mark > 150) {
			mark = millis();
			randomWalk();
		}
	}

	if(size[x][y] == 0) {
		size[x][y] = 3;
		adder[x][y] = 1;
		pointsqueue.push([x, y]);
	}

	len = pointsqueue.length;
	for(var k = 0; k < len; k++) {
		point = pointsqueue.shift();
		i = point[0];
		j = point[1];
		pointsqueue.push([i, j]);

		size[i][j]+=rate*direction[i][j]*adder[i][j];

		if(size[i][j] >= maxradius-1) {
			direction[i][j] = -1;
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
		circle((2*i+1)*maxradius, (2*j+1)*maxradius, size[i][j] + 2);
		fill(255);
		circle((2*i+1)*maxradius, (2*j+1)*maxradius, size[i][j]);

	}

}

function randomWalk() {
	do {
		var add1 = round(Math.random()*2*moverange - moverange);
		var add2 = round(Math.random()*2*moverange - moverange);
		console.log(add1);
	} while(!(x+add1>0 && x+add1<numBallsHoriz-2 && y+add2>0 && y+add2<numBallsVert-2));
	x+=add1;
	y+=add2;

}
