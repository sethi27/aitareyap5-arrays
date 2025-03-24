/**
 * Creative Coding Particle System
 */

let particles = []; 
let colorSchemes = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'], // Original
    ['#FF61D8', '#FF8B6A', '#FFD93D', '#6BCB77', '#4D96FF'], // Bright
    ['#2C3639', '#3F4E4F', '#A27B5C', '#DCD7C9', '#FFFFFF'], // Earthy
    ['#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4']  // Neon
];
let current color scheme = 0;
let colors = colorSchemes[currentColorScheme];
let shapes = ['circle', 'triangle'];


let isLooping = false;
let loopTime = 0;
let loopSpeed = 0.02;

/**
 * Particle class for creating individual particles with physics-based movement
 * Reference: Class implementation pattern from MDN Web Docs
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 */
class Particle {
    /**
     * Constructor initializes particle properties
     * Reference: p5.js Vector creation - https://p5js.org/reference/#/p5.Vector/random2D
     */
    constructor(x, y, shape = null) {
        this.pos = createVector(x, y);
        // Random velocity vector using p5.js Vector methods
        this.vel = p5.Vector.random2D().mult(random(2, 5));
        // Gravity simulation using acceleration vector
        this.acc = createVector(0, 0.1);
        this.color = color(random(colors));
        this.shape = shape || random(shapes);
        this.size = random(10, 30);
        this.life = 255;
        this.initialPos = createVector(x, y);
    }

    /**
     * Updates particle position and physics
     * Reference: Physics simulation concepts from The Nature of Code
     * https://natureofcode.com/book/chapter-2-forces/
     */
    update() {
        if (!isLooping) {
            // Basic physics: velocity adds to position, acceleration adds to velocity
            this.vel.add(this.acc);
            this.pos.add(this.vel);
        } else {
            this.updatePattern();
        }
        this.life -= 1;
    }

    /**
     * Updates particle based on selected pattern
     * Reference: Trigonometric functions for motion from p5.js
     * https://p5js.org/reference/#/p5/sin
     * https://p5js.org/reference/#/p5/cos
     */
    updatePattern() {
        let pattern = document.getElementById('patternSelect').value;
        let centerX = width / 2;
        let centerY = height / 2;
        let radius = 150;

        switch (pattern) {
            case 'circle':
                // Circular motion using parametric equations
                this.pos.x = centerX + cos(loopTime + this.initialPos.x * 0.1) * radius;
                this.pos.y = centerY + sin(loopTime + this.initialPos.x * 0.1) * radius;
                break;
            case 'wave':
                // Sinusoidal wave motion
                this.pos.x = this.initialPos.x;
                this.pos.y = centerY + sin(loopTime + this.initialPos.x * 0.05) * radius * 0.5;
                break;
        }
    }

    /**
     * Renders particle on canvas
     * Reference: p5.js shape drawing - https://p5js.org/reference/#/p5/circle
     * Reference: p5.js color alpha - https://p5js.org/reference/#/p5/alpha
     */
    display() {
        noStroke();
        // Color with alpha transparency for fade effect
        let c = color(this.color.toString());
        c.setAlpha(this.life);
        fill(c);
        
        switch(this.shape) {
            case 'circle':
                // Reference: p5.js circle - https://p5js.org/reference/#/p5/circle
                circle(this.pos.x, this.pos.y, this.size);
                break;
            case 'triangle':
                // Reference: p5.js triangle - https://p5js.org/reference/#/p5/triangle
                triangle(
                    this.pos.x, this.pos.y - this.size/2,
                    this.pos.x - this.size/2, this.pos.y + this.size/2,
                    this.pos.x + this.size/2, this.pos.y + this.size/2
                );
                break;
        }
    }

    /**
     * Checks if particle should be removed
     * Reference: Object lifecycle management pattern from MDN
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Details_of_the_Object_Model
     */
    isDead() {
        return this.life <= 0;
    }
}

/**
 * P5.js setup function - initializes canvas and UI
 * Reference: p5.js setup function - https://p5js.org/reference/#/p5/setup
 */
function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    
    // event listeners to buttons
    document.getElementById('addCircles').addEventListener('click', () => addParticles('circle'));
    document.getElementById('addTriangles').addEventListener('click', () => addParticles('triangle'));
    document.getElementById('clearParticles').addEventListener('click', clearParticles);
    
    // loop toggle listener
    const toggleButton = document.getElementById('toggleLoop');
    toggleButton.addEventListener('click', () => {
        isLooping = !isLooping;
        toggleButton.textContent = isLooping ? 'Stop Loop' : 'Start Loop';
        toggleButton.classList.toggle('active');
        
        // Reset particle positions when starting loop
        if (isLooping) {
            particles.forEach(p => {
                p.initialPos = p.pos.copy();
            });
        }
    });
}

/**
 * P5.js draw function - handles animation frame updates
 * Reference: p5.js draw function - https://p5js.org/reference/#/p5/draw
 */
function draw() {
    background(26, 26, 26, 100);
    
    if (isLooping) {
        loopTime += loopSpeed;
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    text('Particles: ' + particles.length, 10, 10);
    text('Color Scheme: ' + (currentColorScheme + 1), 10, 30);
    if (isLooping) {
        text('Pattern: ' + document.getElementById('patternSelect').value, 10, 50);
    }
}

/**
 * Creates particles on mouse drag
 * Reference: p5.js mouseDragged - https://p5js.org/reference/#/p5/mouseDragged
 */
function mouseDragged() {
    let shape = random(shapes);
    particles.push(new Particle(mouseX, mouseY, shape));
}

/**
 * Adds multiple particles of specified shape
 * Reference: Array manipulation techniques from MDN
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 */
function addParticles(shape) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(random(width), random(height), shape));
    }
}

/**
 * Clears all particles from the system
 * Reference: Array clearing techniques from w3schools
 * https://www.w3schools.com/jsref/jsref_length_array.asp
 */
function clearParticles() {
    particles = [];
}

/**
 * Handles keyboard input for color scheme changes
 * Reference: p5.js keyPressed - https://p5js.org/reference/#/p5/keyPressed
 */
function keyPressed() {
    if (key.toLowerCase() === 'c') {
        currentColorScheme = (currentColorScheme + 1) % colorSchemes.length;
        colors = colorSchemes[currentColorScheme];
    }
}

/**
 * Handles window resize events
 * Reference: p5.js windowResized - https://p5js.org/reference/#/p5/windowResized
 */
function windowResized() {
    resizeCanvas(800, 600);
} 
