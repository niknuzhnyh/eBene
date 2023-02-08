const URL =
   "https://apivarty.azurewebsites.net/api/v2/Schedule/GetDaySchedule?date=";
const AUTH_URL = "https://apivarty.azurewebsites.net/api/v2/Auth";

// const URL = 'example.json';
let authGoogleJWT, accessToken, headers;

// schedule selection
let scheduleBtns = document.getElementsByClassName("scheduleIconBtn");
let scheduleBtn;
let requestedDate;
let apiData;

document.addEventListener("swiped-left", function (e) {
   if (requestedDate) {
      var date = new Date(requestedDate);
      date.setDate(date.getDate() + 1);

      getSchedule(date.toISOString());
   }
});
document.addEventListener("swiped-right", function (e) {
   if (requestedDate) {
      var date = new Date(requestedDate);
      date.setDate(date.getDate() - 1);

      getSchedule(date.toISOString());
   }
});

for (const el of scheduleBtns) {
   el.onclick = () => {
      scheduleBtn = el.dataset.responsibility;
      tableRendering(
         scheduleBtn,
         "scheduleBody",
         apiData[scheduleBtn],
         apiData.currentUser
      );
   };
}
// Get today's schedule
const todayBtn = document.getElementById("todayBtn");
todayBtn.onclick = () => {
   reorderHidden(["preloaderSec"], ["startPage"]);
   getSchedule();
};
// get schedule by date
const byDateBtn = document.getElementById("byDateBtn");
byDateBtn.onclick = () => {
   reorderHidden(["dateInpt"], ["startPage"]);
};
document.getElementById("datePickerBtn").onclick = () => {
   reorderHidden(["preloaderSec"], ["dateInpt"]);
   let datePicker = document.getElementById("datePicker");
   getSchedule(datePicker.value);
};

// go out to schedule
const schedulePrev = document.getElementById("schedulePrev");
schedulePrev.onclick = () => {
   requestedDate = undefined;
   reorderHidden(["startPage"], ["schedule"]);
};

// !sign out
const singOutBtn = document
   .getElementById("singOutBtn")
   .addEventListener("click", () => {
      authGoogleJWT = "";
      accessToken = "";
      headers = "";
      reorderHidden(["singInBtn"], ["singOutBtn"]);
      todayBtn.disabled = true;
      byDateBtn.disabled = true;
      reorderHidden(["startPage"], ["schedule"]);
   });

function getSchedule(params) {
   let url = URL;
   let date = new Date().toISOString();
   tableRendering(undefined, "scheduleBody", undefined);
   if (params) {
      requestedDate = params;
      url = `${URL}${params}`;
   } else {
      requestedDate = date;
      url = `${URL}${date}`;
   }

   reorderHidden(["preloaderSec"], ["schedule"]);
   fetch(url, headers)
      .then((response) => {
         if (response.status != 200) {
            let error = new Error(`Помилка '${response.statusText}' код відповіді '${response.status}' . Зверніться до адміністратора`);
            throw error;
         }
         return response.json();
      })
      .then((data) => {
         apiData = data;
         if (scheduleBtn == undefined) {
            scheduleBtn = "securityShift";
         }
         markRender(data);
         tableRendering(
            scheduleBtn,
            "scheduleBody",
            data[scheduleBtn],
            data.currentUser
         );
      })
      .then(() => {
         reorderHidden(["schedule"], ["preloaderSec"]);
      })
      .catch((e) => {
         reorderHidden(["startPage"], ["schedule", "preloaderSec"]);
         console.log("Error: getSchedule");
         alert(e);
      });
}

function tableRendering(type, table, data, currentUser) {
   if (data) {
      var pageHeaderHtml = `<h2>Розклад з <span id="dateFrom">${dateFormta(
         data.dateFrom
      )}</span> по <span id="dateTo">${dateFormta(data.dateTo)}</span></h2>`;
      document.getElementById(table).innerHTML = pageHeaderHtml;

      switch (type) {
         case "dutyShift":
            var addClass = "";
            if (data.cook === currentUser) addClass = " currentUser";
            var coocHtml = 
               `<div class="tableWrap">
                  <div class="tRow df" >
                  <div class="rowItem rowChiefDesc">Мастер шеф</div>
                  <div class="rowItem rowChief${addClass}" id="chief">${data.cook}</div>
                  </div>
				   </div>`;
            document.getElementById(table).innerHTML += coocHtml;

            renderPart(table, "Черговий", data.chief, currentUser);
            renderPart(
               table,
               "Днювальний (охорона)",
               data.dutySecurity,
               currentUser
            );
            renderPart(
               table,
               "Днювальний (прибирання)",
               data.dutyCleaning,
               currentUser
            );
            renderPart(
               table,
               "Черговий по кухні",
               data.dutyKitchen,
               currentUser
            );

            renderPartOneColumn(
               table,
               "В розташуванні",
               data.atBase,
               currentUser
            );

            break;

         case "securityShift":
            var headerHtml = `<div class="tableWrap" id="tableWrap">
						<div id="tableBody">`;

            var addClass = "";
            if (data.chief === currentUser) addClass = " currentUser";

            var chiefHtml = `   <div class="tRow df" >
							<div class="rowItem rowChiefDesc" id="chiefPos">
								Начальник варти
							</div>
							<div class="rowItem rowChief${addClass}" id="chief">
								${data.chief}
							</div>
						</div>
						<div class="tRow df">
							<div class="rowTimeDesc rowItem">
								Час варти
							</div>
							<div class="rowGuardDesc rowItem">
								Чатові
							</div>
						</div>`;

            document.getElementById(table).innerHTML += headerHtml + chiefHtml;

            data.duties.forEach((element) => {
               let guard = "";
               element.guard.forEach((el, index, array) => {
                  var isCurrent = el === currentUser;
                  guard += " ";

                  if (isCurrent) {
                     guard += "<marquee behavior='alternate'><em><strong>";
                  }
                  guard += el.split(" ")[0];
                  if (isCurrent) {
                     guard += "</strong></em></marquee>";
                  }
                  if (index != array.length - 1) {
                     guard += "<br>";
                  }
               });
               let rowTemplate = `  
                     <div class="tRow df">
                        <div class="rowTimeDesc rowItem">
                           ${element.period}
                        </div>
                        <div class="rowGuardDesc rowItem${addClass}">
                           ${guard}
                        </div>
                     </div>`;

               document.getElementById(table).innerHTML += rowTemplate;
            });

            var footerHtml = `</div>
                  </div>`;
            document.getElementById(table).innerHTML += footerHtml;
            break;

         case "vacationShift":
            if (data.reserve.length > 0) {
               renderPartOneColumn(table, "В резерві", data.reserve, currentUser);
            }

            if (data.vacation.length > 0) {
               renderPartOneColumn(
                     table,
                     "Відпустка",
                     data.vacation,
                     currentUser
               );
            }

            if (data.training.length > 0) {
               renderPartOneColumn(table, "Тренування", data.training, currentUser);
            }

            if (data.sickLeave.length > 0) {
               renderPartOneColumn(table, "Лікування", data.sickLeave, currentUser);
            }
            break;
      }
   } else {
      document.getElementById(table).innerHTML = "";
   }
}

function renderPart(table, header, data, currentUser) {
   var headerHtml = `<h2>${header}</h2>
            <div class="tableWrap" id="tableWrap">
			<div id="tableBody">
               <div class="tRow df">
					<div class="rowTimeDesc rowItem">
						Час
					</div>
					<div class="rowGuardDesc rowItem">
						ПІБ
					</div>
				</div>`;
   document.getElementById(table).innerHTML += headerHtml;

   data.forEach((element) => {
      var addClass = "";
      if (element.person === currentUser) {
         addClass = " currentUser";
         element.person = `<marquee behavior='alternate'>${element.person}</marquee>`;
      }

      var rowTemplate = `  
                     <div class="tRow df">
                        <div class="rowTimeDesc rowItem">
                           ${element.period}
                        </div>
                        <div class="rowGuardDesc rowItem${addClass}">
                           ${element.person}
                        </div>
                     </div>`;

      document.getElementById(table).innerHTML += rowTemplate;
   });

   var footerHtml = `       </div>
            </div>`;
   document.getElementById(table).innerHTML += footerHtml;
}

function renderPartOneColumn(table, header, data, currentUser) {
   var headerHtml = `<h2>${header}</h2>
      <div class="tableWrap">`;

   var tableContent = "";
   data.forEach((element) => {
      var addClass = "";
      if (element === currentUser) {
         addClass = " currentUser";
         element = `<marquee behavior='alternate'>${element}</marquee>`;
      }
      var rowTemplate = `  
                     <div class="tRow df">
                        <div class="rowGuardDesc rowItem${addClass}">
                           ${element}
                        </div>
                     </div>`;
      tableContent += rowTemplate;
   });

   var footerHtml = `</div>`;
   document.getElementById(table).innerHTML += headerHtml + tableContent + footerHtml;
}

function renderData(id, data) {
   let item = document.getElementById(`${id}`);
   item.innerText = data;
}

function dateFormta(date) {
   let d = new Intl.DateTimeFormat("uk-UA", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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

function reorderHidden(visibleIds, hiddenIds) {
   visibleIds.forEach((elem) => {
      var element = document.getElementById(elem);
      element.classList.remove("hidden");
   });
   hiddenIds.forEach((elem) => {
      var element = document.getElementById(elem);
      element.classList.remove("hidden");
      element.classList.add("hidden");
   });
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
         if (response.status != 200) {
            let error = new Error(`Помилка '${response.statusText}' код відповіді '${response.status}' . Зверніться до адміністратора`);
            throw error;
         }
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
         todayBtn.disabled = false;
         byDateBtn.disabled = false;
         hiddenSwitching("singInBtn", "singOutBtn");
      })
      .catch((e) => {
         alert(e);
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
         if (response.status != 200) {
            let error = new Error(`Помилка '${response.statusText}' код відповіді '${response.status}' . Зверніться до адміністратора`);
            throw error;
         }
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
         alert(e);
         console.log("Error: getDateRange");
      });
}

if (navigator.serviceWorker.controller) {
   // console.log(
   //    "[PWA Builder] active service worker found, no need to register"
   // );
} else {
   navigator.serviceWorker
      .register("sw.js", {
         scope: "./",
      })
      .then(function (reg) {
         // console.log(
         //    "Service worker has been registered for scope:" + reg.scope
         // );
      });
}

function markRender(data) {
   let marks = document.getElementsByClassName("mark");
   for (const el of marks) {
      el.innerHTML = "";
   }
   if (data.countUserSecurityShift) {
      document.getElementById(
         "countUserSecurityShift"
      ).innerHTML = `<span class="markItem">${data.countUserSecurityShift}</span>`;
   }
   if (data.countUserDutyShift) {
      document.getElementById(
         "countUserDutyShift"
      ).innerHTML = `<span class="markItem">${data.countUserDutyShift}</span>`;
   }
   if (data.countUserVacationShift) {
      document.getElementById(
         "countUserVacationShift"
      ).innerHTML = `<span class="markItem">${data.countUserVacationShift}</span>`;
   }
}

console.log("ok");
