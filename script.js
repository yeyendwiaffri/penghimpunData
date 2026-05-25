const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUN075nhR3S1_Cw904jQlfB11Ch5nrWzqCql0MlUVjKXM5EkGqPYPPgJwUcjlDq9eupQ/exec";

const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");
let drawing = false;

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getPosition(e) {
  const rect = canvas.getBoundingClientRect();

  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function startDraw(e) {
  drawing = true;
  const pos = getPosition(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();

  const pos = getPosition(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDraw() {
  drawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDraw);

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function fileToBase64(input) {
  return new Promise((resolve, reject) => {
    const file = input.files[0];

    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(",")[1];

      resolve({
        fileName: file.name,
        mimeType: file.type,
        base64: base64
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function submitForm() {
  const status = document.getElementById("status");

  const nama = document.getElementById("nama").value.trim();
  const nim = document.getElementById("nim").value.trim();

  if (!nama || !nim) {
    status.innerText = "Nama dan NIM wajib diisi.";
    return;
  }

  status.innerText = "Mengirim data...";

  const ttdBase64 = canvas.toDataURL("image/png").split(",")[1];

  const payload = {
    nama: nama,
    nim: nim,
    data1: await fileToBase64(document.getElementById("data1")),
    data2: await fileToBase64(document.getElementById("data2")),
    data3: await fileToBase64(document.getElementById("data3")),
    ttd: {
      fileName: ${nim}_ttd.png,
      mimeType: "image/png",
      base64: ttdBase64
    }
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    });

    status.innerText = "Data berhasil dikirim.";
  } catch (error) {
    status.innerText = "Gagal mengirim data.";
  }
}