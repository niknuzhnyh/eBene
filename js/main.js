const URL = "https://apivarty.azurewebsites.net/api/v1/WorkingShift/";
// const URL = 'example.json';

let authJWT;

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

const singOutBtn = document
   .getElementById("singOutBtn")
   .addEventListener("click", () => {
      hiddenSwitching("singInBtn", "singOutBtn");
   });

function getSchedule(params) {
   let url = URL;
   let date = new Date().toISOString();
   if (params) {
      url = `${URL}${params}`;
   } else {
      url = `${URL}${date}`;
   }
   console.log("start");
   console.log(Date.now());
   fetch(url)
      .then((response) => {
         console.log("response");
         console.log(Date.now());
         return response.json();
      })
      .then((data) => {
         console.log("data");
         console.log(Date.now());
         tableRendering(data);

         console.log(Date.now());
         console.log("render is finished");
      });
}

function tableRendering(data) {
   let dateFrom = dateFormta(data.dateFrom);
   let dateTo = dateFormta(data.dateTo);
   let duties = data.duties;
   renderData("dateFrom", dateFrom);
   renderData("dateTo", dateTo);
   renderData("chief", data.сhief);

   document.getElementById("tableBody").innerHTML = "";

   duties.forEach((element) => {
      let guard = "";
      element.guard.forEach((el) => {
         guard += " ";
         guard += el.split(" ")[0];
      });
      let rowTemplate = `  
      <div class="tRow df">
         <div class="rowTimeDesc rowItem">
            ${element.period}
         </div>
         <div class="rowGuardDesc rowItem">
            ${guard}
         </div>
      </div>`;
      document.getElementById("tableBody").innerHTML += rowTemplate;
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
   date = Date.parse(date);
   date = d.format(date);
   return date;
}

function hiddenSwitching(visId, hiddId) {
   const vis = document.getElementById(visId);
   const hidd = document.getElementById(hiddId);

   vis.classList.toggle("hidden");
   hidd.classList.toggle("hidden");
}

function handleCredentialResponse(response) {
   let payload = parseJwt(response.credential);
   authJWT = response.credential;
   hiddenSwitching("singInBtn", "singOutBtn");
   console.log(response.credential);
   console.log(payload);
   console.log(response);
}

function parseJwt(token) {
   var base64Url = token.split(".")[1];
   var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
   var jsonPayload = decodeURIComponent(
      window
         .atob(base64)
         .split("")
         .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
         })
         .join("")
   );

   return JSON.parse(jsonPayload);
}

async function getDateRange() {
   let url =
      "https://apivarty.azurewebsites.net/api/v1/WorkingShift/GetAvailableDates";
   let minDate;
   let maxDate;
   let dateRange = {};
   fetch(url)
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         minDate = data[0].split("T")[0];
         maxDate = data[`${data.length - 1}`].split("T")[0];
      })
      .then(() => {
         dateRange.maxDate = maxDate;
         dateRange.minDate = minDate;
      });
   return dateRange;
}

getDateRange().then((value) => {
   console.log(value);
});

console.log("ok");
