// --- REDIRECT LOGIC ---
const REDIRECT_DELAY_SECONDS = 15;
const REDIRECT_URL = "/CyberChef";

let countdown = REDIRECT_DELAY_SECONDS;
const countdownText = document.getElementById('countdown-text');
const timerProgress = document.querySelector('.timer-progress');
const circumference = 2 * Math.PI * 45; // 2 * PI * r

timerProgress.style.strokeDasharray = circumference;
timerProgress.style.strokeDashoffset = circumference;

const countdownInterval = setInterval(() => {
    countdown--;
    countdownText.textContent = countdown;
    
    const progress = (REDIRECT_DELAY_SECONDS - countdown) / REDIRECT_DELAY_SECONDS;
    const dashoffset = circumference * (1 - progress);
    timerProgress.style.strokeDashoffset = dashoffset;

    if (countdown <= 0) {
        clearInterval(countdownInterval);
        document.body.style.transition = 'opacity 1s ease-out';
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 1000); // Wait for fade out
    }
}, 1000);


// --- INTERACTIVE PARTICLE CANVAS ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const numberOfParticles = 150;

const mouse = {
    x: null,
    y: null,
    radius: 100 // Area of effect for mouse interaction
}

window.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', function(){
    mouse.x = undefined;
    mouse.y = undefined;
});

window.addEventListener('click', function() {
    for (let i = 0; i < 10; i++) { // Create a burst of particles on click
        particlesArray.push(new Particle(mouse.x, mouse.y));
    }
});


class Particle {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${200 + Math.random() * 60}, 100%, 50%)`;
    }
    update(){
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius){
            this.x -= directionX;
            this.y -= directionY;
        } else {
             if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx/10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy/10;
            }
        }
        
        // Add wandering behavior
        this.x += this.speedX;
        this.y += this.speedY;

        // Boundary check
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function init() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++){
        particlesArray.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++){
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connect();
    requestAnimationFrame(animate);
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
            + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

            if (distance < (canvas.width/7) * (canvas.height/7)) {
                opacityValue = 1 - (distance/20000);
                ctx.strokeStyle = `rgba(0, 255, 255, ${opacityValue})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

init();
animate();