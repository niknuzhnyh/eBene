const URL = 'https://apivarty.azurewebsites.net/api/v1/WorkingShift/';
// const URL = 'example.json';

const auth = localStorage.getItem("auth");
if (auth) {
   hiddenSwitching("authorization", "startPage");
}

// log in
const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = () => {
   const pass = document.getElementById("authPass").value;
   if (pass === "2023") {
      localStorage.setItem("auth", true);
      hiddenSwitching("authorization", "startPage");
   } else {
      document.getElementById("authInput").innerHTML = "<h1>Допобачення</h1>";
      loginBtn.textContent = "OK";
      loginBtn.onclick = () => location.reload();
   }
};

// log out
const logOutBtn = document.getElementById("logOut");

logOutBtn.onclick = () => {
   localStorage.removeItem("auth");
   location.reload();
};

// Get today's schedule
const todayBtn = document.getElementById("todayBtn");
todayBtn.onclick = () => {
   hiddenSwitching("startPage", "schedule");
   getSchedule();
};

// go out to schedule
const schedulePrev = document.getElementById("schedulePrev");
schedulePrev.onclick = () => {
   hiddenSwitching("schedule", "startPage");
};



function getSchedule(params) {
   let url = URL;
   let date = new Date().toISOString()
   if (params) {
      url = `${URL}?${params}`;
   } else {
      url = `${URL}${date}`;
   }
   fetch(url)
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         tableRendering(data);
      });
}

function tableRendering(data) {

   let dateFrom = dateFormta(data.dateFrom);
   let dateTo = dateFormta(data.dateTo);
   let duties = data.duties;
   renderData("dateFrom", dateFrom);
   renderData("dateTo", dateTo);
   renderData("chief", data.сhief);

   duties.forEach((element) => {
      let guard =''
      element.guard.forEach((el) => {
         guard += ' '
         guard +=  el.split(' ')[0]
      })
      let rowTemplate = `  
      <div class="tRow df">
         <div class="rowTimeDesc rowItem">
            ${element.period}
         </div>
         <div class="rowGuardDesc rowItem">
            ${guard}
         </div>
      </div>`;
      document.getElementById('tableWrap').innerHTML += rowTemplate
   });
}


function renderData(id, data) {
   let item = document.getElementById(`${id}`);
   item.innerText = data;
}

function dateFormta(date) {
   let d = new Intl.DateTimeFormat("ua", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
   });
   date = date.parse;
   date = d.format(date);
   return date;
}

function hiddenSwitching(visId, hiddId) {
   const vis = document.getElementById(visId);
   const hidd = document.getElementById(hiddId);

   vis.classList.toggle("hidden");
   hidd.classList.toggle("hidden");
}

console.log("ok");
