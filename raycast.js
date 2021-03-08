const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV = 60 * (Math.PI / 180);
const STRIPE_WIDTH = 1;
const RAY_NUM = WINDOW_WIDTH / STRIPE_WIDTH;

const MINIMAP_SCALE = 0.2;

class Map {
	constructor() {
		this.grid = [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
			[1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 3, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		];
	}
	playerInitialize(x, y) {
		this.grid[x][y] = 0;
	}
	checkWall(x, y) {
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
			return true;
		let gridIndexX = Math.floor(x / TILE_SIZE);
		let gridIndexY = Math.floor(y / TILE_SIZE);
		return this.grid[gridIndexY][gridIndexX] > 0;
	}
	render() {
		for (let i = 0; i < MAP_NUM_ROWS; i++) {
			for (let j = 0; j < MAP_NUM_COLS; j++)
			{
				let tileX = j * TILE_SIZE;
				let tileY = i * TILE_SIZE;
				let tileColor = this.grid[i][j] >= 1 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(
					MINIMAP_SCALE * tileX,
					MINIMAP_SCALE * tileY,
					MINIMAP_SCALE * TILE_SIZE,
					MINIMAP_SCALE * TILE_SIZE
				);
			}
		}
	}
}

class Player {
	constructor() {
		this.x = find_playerX();
		this.y = find_playerY();
		this.radius = 3;
		this.turnDirection = 0; // -1 if left, +1 if right;
		this.walkDirection = 0; // -1 if back, +1 if front;
		this.rotationAngle = Math.PI / 2;
		this.moveSpeed = 2.0;
		this.rotationSpeed = 2 * (Math.PI / 180);
	}
	update() {
		this.rotationAngle += this.turnDirection * this.rotationSpeed;
		let step = this.walkDirection * this.moveSpeed;
		let newPlayerX = this.x + step * Math.cos(this.rotationAngle);
		let newPlayerY = this.y + step * Math.sin(this.rotationAngle);
		if (!grid.checkWall(newPlayerX, newPlayerY))
		{
			this.x = newPlayerX;
			this.y = newPlayerY;
		}
	}
	render () {
		noStroke();
		fill("red");
		circle(
			MINIMAP_SCALE * this.x,
			MINIMAP_SCALE * this.y,
			MINIMAP_SCALE * this.radius
		);
	}
}

class Ray {
	constructor(rayAngle) {
		this.rayAngle = limitAngle(rayAngle);
		this.hitX = 0;
		this.hitY = 0;
		this.distance = 0;
		this.hitVertical = false;
		this.isRayDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
		this.isRayUp = !this.isRayDown;
		this.isRayRight = this.rayAngle < Math.PI * 0.5 || this.rayAngle > Math.PI * 1.5;
		this.isRayLeft = !this.isRayRight;
	}
	cast() {
		let sidedistX, sidedistY;
		let xStep, yStep;

		// Horizontal ray grid //
		let horzWallHit = false;
		let horzWallHitX = 0;
		let horzWallHitY = 0;

		sidedistY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		sidedistY += this.isRayDown ? TILE_SIZE : 0;
		sidedistX = player.x + (sidedistY - player.y) / Math.tan(this.rayAngle);
		yStep = TILE_SIZE;
		yStep *= this.isRayUp ? -1 : 1;
		xStep = TILE_SIZE / Math.tan(this.rayAngle);
		xStep *= (this.isRayLeft && xStep > 0) ? -1 : 1;
		xStep *= (this.isRayRight && xStep < 0) ? -1 : 1;

		let nextHorzTouchX = sidedistX;
		let nextHorzTouchY = sidedistY;

		while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT)
		{
			if (grid.checkWall(nextHorzTouchX, nextHorzTouchY - (this.isRayUp ? 1 : 0)))
			{
				horzWallHit = true;
				horzWallHitX = nextHorzTouchX;
				horzWallHitY = nextHorzTouchY;
				break ;
			} else {
				nextHorzTouchX += xStep;
				nextHorzTouchY += yStep;
			}
		}

		// Vertical ray grid //
		let vertWallHit = false;
		let vertWallHitX = 0;
		let vertWallHitY = 0;

		sidedistX = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		sidedistX += this.isRayRight ? TILE_SIZE : 0;
		sidedistY = player.y + (sidedistX - player.x) * Math.tan(this.rayAngle);
		xStep = TILE_SIZE;
		xStep *= this.isRayLeft ? -1 : 1;
		yStep = TILE_SIZE * Math.tan(this.rayAngle);
		yStep *= (this.isRayUp && yStep > 0) ? -1 : 1;
		yStep *= (this.isRayDown && yStep < 0) ? -1 : 1;

		let nextVertTouchX = sidedistX;
		let nextVertTouchY = sidedistY;


		while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT)
		{
			if (grid.checkWall(nextVertTouchX - (this.isRayLeft ? 1 : 0), nextVertTouchY))
			{
				vertWallHit = true;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;
				break ;
			} else {
				nextVertTouchX += xStep;
				nextVertTouchY += yStep;
			}
		}

		//  choose nearest wallhit point
		let horzWallDist = (horzWallHit) ? setWallDist(player.x, player.y, horzWallHitX, horzWallHitY): Number.MAX_VALUE;
		let vertWallDist = (vertWallHit) ? setWallDist(player.x, player.y, vertWallHitX, vertWallHitY): Number.MAX_VALUE;

		if (horzWallDist <  vertWallDist) {
			this.hitX = horzWallHitX;
			this.hitY = horzWallHitY;
			this.distance = horzWallDist;
			this.hitVertical = false;
		} else {
			this.hitX = vertWallHitX;
			this.hitY = vertWallHitY;
			this.distance = vertWallDist;
			this.hitVertical = true;
		}
	}
	render() {
		stroke("rgba(255, 0, 0, 0.3)");
		line(
			MINIMAP_SCALE * player.x,
			MINIMAP_SCALE * player.y,
			MINIMAP_SCALE * this.hitX,
			MINIMAP_SCALE * this.hitY,
			);
	}
}

let grid = new Map();
let player = new Player();
let rays = [];

function find_playerX() {
	for (let i = 0; i < MAP_NUM_ROWS; i++) {
		for (let j = 0; j < MAP_NUM_COLS; j++) {
			if (grid.grid[i][j] == 3)
				return ((i * TILE_SIZE) + TILE_SIZE / 2);
		}
	}
	return WINDOW_WIDTH / 2;
}

function find_playerY() {
	for (let i = 0; i < MAP_NUM_ROWS; i++) {
		for (let j = 0; j < MAP_NUM_COLS; j++) {
			if (grid.grid[i][j] == 3)
			{
				grid.playerInitialize(i, j);
				return ((j * TILE_SIZE) + TILE_SIZE / 2);
			}
		}
	}
	return WINDOW_HEIGHT / 2;

}

function castAllRays() {
	let rayAngle = player.rotationAngle - (FOV / 2);
	rays = [];
	for (let col = 0; col < RAY_NUM; col++)
	{
		let ray = new Ray(rayAngle);
		ray.cast();
		rays.push(ray);
		rayAngle += FOV / RAY_NUM;
	}
}

function renderWalls() {
	for (let i = 0; i < RAY_NUM; i++)
	{
		let ray = rays[i];
		let rayDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
		let planeDistance = (WINDOW_WIDTH / 2) / Math.tan(FOV / 2);
		let stripeHeight = (TILE_SIZE / rayDistance) * planeDistance;
		let ceilFloorHeight = WINDOW_HEIGHT / 2 - stripeHeight / 2;

		fill("rgba(220, 220, 220, 1.0)");
		noStroke();
		rect(i * STRIPE_WIDTH, 0, STRIPE_WIDTH, ceilFloorHeight);
		fill("rgba(50, 50, 50, 1.0)");
		noStroke();
		rect(i * STRIPE_WIDTH, WINDOW_HEIGHT / 2 + stripeHeight / 2, STRIPE_WIDTH, ceilFloorHeight);

		let opacity = 170 / rayDistance;
		if (ray.hitVertical)
		{
			if (ray.isRayRight)
				fill(`rgba(255, 0, 0, ${opacity})`);
			else
				fill(`rgba(0, 255, 0, ${opacity})`);
		} else {
			if (ray.isRayUp)
				fill(`rgba(0, 0, 255, ${opacity})`);
			else
				fill(`rgba(255, 165, 0, ${opacity})`);
		}
		noStroke();
		rect(
			i * STRIPE_WIDTH,
			WINDOW_HEIGHT / 2 - stripeHeight / 2,
			STRIPE_WIDTH,
			stripeHeight
		);
	}
}

function limitAngle(rayAngle) {
	rayAngle = rayAngle % (2 * Math.PI);
	if (rayAngle < 0)
		rayAngle = (2 * Math.PI) + rayAngle;
	return rayAngle;
}

function setWallDist(x1, y1, x2, y2)
{
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function keyPressed() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = +1;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = -1;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = +1;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = -1;
	}
}

function keyReleased() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 0;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = 0;
	}
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
	player.update();
	castAllRays();
}

function draw() {
	clear("#212121");
	update();
	renderWalls();
	grid.render();
	for (ray of rays) {
		ray.render();
	}
	player.render();
}
