const URL = "https://apivarty.azurewebsites.net/api/v2/Schedule/GetSecuritySchedule?date=";
const AUTH_URL = "https://apivarty.azurewebsites.net/api/v2/Auth";

// const URL = 'example.json';

let authGoogleJWT, accessToken, headers;

// Get today's schedule
const todayBtn = document.getElementById("todayBtn");
todayBtn.onclick = () => {
   hiddenSwitching("startPage", "preloaderSec");
   getSchedule();
};

// go out to schedule
const schedulePrev = document.getElementById("schedulePrev");
schedulePrev.onclick = () => {
   hiddenSwitching("schedule", "startPage");
};

// sign out
const singOutBtn = document
   .getElementById("singOutBtn")
   .addEventListener("click", () => {
      authJWT = "";
      hiddenSwitching("singInBtn", "singOutBtn");
   });

// get schedule by date
const byDateBtn = document.getElementById("byDateBtn");
byDateBtn.onclick = () => {
   hiddenSwitching("startPage", "dateInpt");
};
document.getElementById("datePickerBtn").onclick = () => {
   hiddenSwitching("dateInpt", "preloaderSec");
   let datePicker = document.getElementById("datePicker");
   getSchedule(datePicker.value);
};

function getSchedule(params) {
   let url = URL;
   let date = new Date().toISOString();
   tableRendering();
   if (params) {
      url = `${URL}${params}`;
   } else {
      url = `${URL}${date}`;
   }
   fetch(url, headers)
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         tableRendering(data);
         setTimeout(() => {
            hiddenSwitching("preloaderSec", "schedule");
         }, 1000);
      });
}

function tableRendering(data) {
   if (data) {
      let dateFrom = dateFormta(data.dateFrom);
      let dateTo = dateFormta(data.dateTo);
      let duties = data.duties;
      renderData("dateFrom", dateFrom);
      renderData("dateTo", dateTo);
      renderData("chief", data.сhief);

      document.getElementById("tableBody").innerHTML = "";

      duties.forEach((element) => {
         let guard = "";
         element.guard.forEach((el, index, array) => {
            guard += " ";
            guard += el.split(" ")[0];
            if (index != array.length - 1) {
               guard += "<br>";
            }
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
   } else {
      renderData("dateFrom", "");
      renderData("dateTo", "");
      renderData("chief", "");
      renderData("tableBody", "");
   }
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

// !auth

function handleCredentialResponse(response) {
   authGoogleJWT = response.credential;

   fetch(AUTH_URL, {
      headers: {
         code: authGoogleJWT,
      },
   })
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         let slogan = data.token.slogan;
         accessToken = data.token.accessToken;
         document.getElementById("sloganInner").innerText = slogan;
         console.log(data);
         headers = {
            headers: {
               Authorization: `Bearer ${accessToken}`,
            },
         };
         getDateRange();
         todayBtn.disabled = false;
         byDateBtn.disabled = false;
      });
   hiddenSwitching("singInBtn", "singOutBtn");
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

/////////////
async function getDateRange() {
   let url =
      "https://apivarty.azurewebsites.net/api/v2/Schedule/GetAvailableDates";
   let minDate;
   let maxDate;
   let dateRange = {};
   fetch(url, headers)
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

         let datePicker = document.getElementById("datePicker");
         datePicker.value = new Date().toISOString().split("T")[0];
         datePicker.min = minDate;
         datePicker.max = maxDate;
      });
}

console.log("ok");
