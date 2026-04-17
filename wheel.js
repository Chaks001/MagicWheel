export class Wheel {
  constructor(canvas, entries) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entries = entries;
    this.rotation = 0;
    this.isSpinning = false;
    this.velocity = 0;
    this.friction = 0.985;
    
    this.colors = [
      '#38bdf8', '#818cf8', '#c084fc', '#fb7185', 
      '#fb923c', '#facc15', '#4ade80', '#2dd4bf'
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const size = Math.min(this.canvas.parentElement.clientWidth, 600);
    this.canvas.width = size * window.devicePixelRatio;
    this.canvas.height = size * window.devicePixelRatio;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.draw();
  }

  draw() {
    const { width, height } = this.canvas.getBoundingClientRect();
    const radius = width / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    this.ctx.clearRect(0, 0, width, height);

    if (this.entries.length === 0) {
      this.drawEmpty(centerX, centerY, radius);
      return;
    }

    const arcSize = (Math.PI * 2) / this.entries.length;

    this.entries.forEach((entry, i) => {
      const angle = this.rotation + i * arcSize;
      
      // Draw slice
      this.ctx.beginPath();
      this.ctx.fillStyle = this.colors[i % this.colors.length];
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius - 10, angle, angle + arcSize);
      this.ctx.lineTo(centerX, centerY);
      this.ctx.fill();

      // Draw text
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(angle + arcSize / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = 'white';
      this.ctx.font = `bold ${Math.max(12, radius/10)}px Inter`;
      
      // Calculate max text width to prevent overflowing the center or edges
      const maxTextWidth = radius - 50; 
      this.ctx.fillText(entry, radius - 30, 5, maxTextWidth);
      
      this.ctx.restore();
    });

    // Outer ring
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 4;
    this.ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
    this.ctx.stroke();

    // Center point
    this.ctx.beginPath();
    this.ctx.fillStyle = 'white';
    this.ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
  }

  drawEmpty(x, y, r) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#334155';
    this.ctx.setLineDash([5, 5]);
    this.ctx.arc(x, y, r - 10, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '14px Inter';
    this.ctx.fillText('Ajoutez des options pour commencer', x, y);
  }

  spin() {
    if (this.isSpinning || this.entries.length < 2) return;
    
    this.isSpinning = true;
    this.velocity = Math.random() * 0.3 + 0.4; // Initial kick
    this.animate();
  }

  animate() {
    if (!this.isSpinning) return;

    this.rotation += this.velocity;
    this.velocity *= this.friction;

    this.draw();

    if (this.velocity < 0.001) {
      this.isSpinning = false;
      this.velocity = 0;
      this.onSpinEnd();
    } else {
      requestAnimationFrame(() => this.animate());
    }
  }

  onSpinEnd() {
    const arcSize = (Math.PI * 2) / this.entries.length;
    // Normalized rotation (0 to 2PI)
    // The arrow is at the top (-PI/2), so we need to offset
    const normalizedRotation = (3 * Math.PI / 2 - this.rotation) % (Math.PI * 2);
    const positiveRotation = normalizedRotation < 0 ? normalizedRotation + Math.PI * 2 : normalizedRotation;
    const winningIndex = Math.floor(positiveRotation / arcSize);
    
    if (this.onWinner) {
      this.onWinner(this.entries[winningIndex]);
    }
  }

  updateEntries(newEntries) {
    this.entries = newEntries;
    this.draw();
  }
}
