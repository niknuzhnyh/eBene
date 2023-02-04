const URL =
   "https://apivarty.azurewebsites.net/api/v2/Schedule/GetSecuritySchedule?date=";
const AUTH_URL = "https://apivarty.azurewebsites.net/api/v2/Auth";

const authGoogleJWT =
   "eyJhbGciOiJSUzI1NiIsImtpZCI6ImI0OWM1MDYyZDg5MGY1Y2U0NDllODkwYzg4ZThkZDk4YzRmZWUwYWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2NzU0ODI0OTcsImF1ZCI6IjQyNjQzODg5MjAzMS1obDE0cmdmYjEwZnZrMXUwZTY2ajEzYjc5cW90MDN2Ni5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMzI5NDQxNDI2MzI4Mzg0NzE2NiIsImVtYWlsIjoibmlrbnV6aG55aEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiNDI2NDM4ODkyMDMxLWhsMTRyZ2ZiMTBmdmsxdTBlNjZqMTNiNzlxb3QwM3Y2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwibmFtZSI6ItCc0LjQutC-0LvQsCDQndGD0LbQvdC40YUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUVkRlRwNml6cXRyRk9UNGJpMHJkeHM0Y2JPbWhGbDUwXzBSSzZGMmd2U05zQT1zOTYtYyIsImdpdmVuX25hbWUiOiLQnNC40LrQvtC70LAiLCJmYW1pbHlfbmFtZSI6ItCd0YPQttC90LjRhSIsImlhdCI6MTY3NTQ4Mjc5NywiZXhwIjoxNjc1NDg2Mzk3LCJqdGkiOiJiZDA3YjkyZTNiN2Q4NDRhODM2ZjUyNzU1MDM2ZTNiMzdkNjJlNGRiIn0.uUNmnKemqo6-n0Yq2pbpN0DQrZAVe02yPvtc3r2seZfOXt3E6G7LYYJ_PM3_tia9oVQjp1MkkTNsmQl-bl-4awteUQvaVXTg7qG6t1KjKwEx_i99VSbOH32jkXzQ7E2Nd9MjDJ6SqQAVXunwMby3t6ENomvKbFywpCNDKV_BkgQcMGt0RJLLfn49L_vtEC7Xoa_aNJnhbT7-raUB3Y6uTGzJObL_8D1LDyRV9JB2E1losBceAVYkUK6YpAwgmK5S_p5HVrHrPzYv6mkj4Cb3kqmCfLyoN_vx1SKdLQkPULgcDkasjmSawLTVXX3jxf1iJOOu4H3ytDYyWavUmclffQ";

// const URL = 'example.json';

let accessToken, headers;

// schedule selection
let scheduleBtns = document.getElementsByClassName('scheduleIconBtn')
let scheduleBtn;
let testData;


for (const el of scheduleBtns) {
   el.onclick = () => {
      scheduleBtn = el.dataset.responsibility
      console.log(scheduleBtn)
      console.log(testData[scheduleBtn])
      tableRendering(testData[scheduleBtn])
   }
}

fetch('response_1675483498008.json')
   .then((response) => {
      return response.json();
   })
   .then((data) => {
      testData = data;
      // console.log(data['securityShift'])
   });

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

// !sign out
// const singOutBtn = document
//    .getElementById("singOutBtn")
//    .addEventListener("click", () => {
//       authJWT = "";
//       hiddenSwitching("singInBtn", "singOutBtn");
//    });

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
      })
      .catch((e) => {
         console.log("Error: getSchedule");
      });
}

function tableRendering(data) {
   if (data) {
      let dateFrom = dateFormta(data.dateFrom);
      let dateTo = dateFormta(data.dateTo);
      let duties = data.duties;
      renderData("dateFrom", dateFrom);
      renderData("dateTo", dateTo);
      renderData("chief", data.chief);

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

handleCredentialResponse();

function handleCredentialResponse() {
   // console.log(response);

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
         headers = {
            headers: {
               Authorization: `Bearer ${accessToken}`,
            },
         };
         getDateRange();
         // todayBtn.disabled = false;
         // byDateBtn.disabled = false;
         // hiddenSwitching("singInBtn", "singOutBtn");
      })
      .catch((e) => {
         console.log(e);
      });
}

// function parseJwt(token) {
//    var base64Url = token.split(".")[1];
//    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//    var jsonPayload = decodeURIComponent(
//       window
//          .atob(base64)
//          .split("")
//          .map(function (c) {
//             return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//          })
//          .join("")
//    );
//    return JSON.parse(jsonPayload);
// }

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
      })
      .catch((e) => {
         console.log("Error: getDateRange");
      });
}

console.log("ok");