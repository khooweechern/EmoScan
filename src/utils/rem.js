// function setZoom() {
//   var t = +window.devicePixelRatio
//   if (!!window.ActiveXObject || 'ActiveXObject' in window) {
//     if (t !== 1) {

//     }
//   } else {
//     if (/Mac/i.test(navigator.platform)) {
//       return true
//     }
//     if (t !== 1) {
//       return 1 / t + 0.2
//     }
//   }
// }

// const zoom = setZoom()

// console.log(zoom)
// const baseSize = 16

function setRem() {
  const dpr = window.devicePixelRatio;
  // 此处适配引用环境（使用引用环境的侧边栏），此处获取应用环境的屏幕像素
  const currentWidth = window.parent.document.documentElement.clientWidth;
  let remSize = 0;
  let scale = 0;
  scale = currentWidth / 1920;
  remSize = 18;
  remSize = remSize * scale;
  document.documentElement.style.fontSize = remSize + 'px';
  document.documentElement.setAttribute('data-dpr', `${dpr}`);
}

setRem()

window.addEventListener('resize', () => { setRem() })