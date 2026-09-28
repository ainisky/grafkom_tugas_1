const canvas = document.getElementById('glCanvas');
const ctx = canvas.getContext('2d');

function drawScene() {
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(100, 400, canvas.width, 200);

    ctx.beginPath();
    ctx.arc(50, 550, 250, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";

    ctx.moveTo(50, 550); //progres
    ctx.lineTo(50, 300); //progres
    ctx.fill();

}

drawScene();
