let button = document.getElementById("button");
let select_wrap = document.getElementById("select_wrap");
let select = document.getElementById("select");
let btn_timer;
button.onmousedown = () => {
   btn_timer = setTimeout(() => {
      select_wrap.classList.remove("hidden");
   }, 800);
};
button.onmouseup = () => {
   clearTimeout(btn_timer);
};
select.onchange = () => {
   let val = select.value;
   alert(val);
   select_wrap.classList.add("hidden");
};
