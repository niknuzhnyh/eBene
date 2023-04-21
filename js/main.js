const HOST = "https://apivarty.azurewebsites.net/";
const URL = HOST + "api/v2/Schedule/GetDaySchedule?date=";
const AUTH_URL = HOST + "api/v2/Auth";
const MYSHEDULE_URL = HOST + "api/v2/Schedule/GetMySchedule";
const DATERANGE_URL = HOST + "api/v2/Schedule/GetAvailableDates";
const GET_STAFF_WITH_DUTY_URL = HOST + "api/v2//Staff/GetStaffWithDuty";

// const URL = 'example.json';
let authGoogleJWT, accessToken, headers, userFirstName;

// schedule selection
let scheduleBtns = document.getElementsByClassName("scheduleIconBtn");
let scheduleBtn;
let requestedDate;
let apiData;

// dates
let minDate, maxDate;

document.addEventListener("swiped-left", function (e) {
  swipedHandler(1);
});
document.addEventListener("swiped-right", function (e) {
  swipedHandler(-1);
});

let sliderButtonPrev = document.getElementById("sliderButtonPrev");
sliderButtonPrev.onclick = () => {
  swipedHandler(-1);
};
let sliderButtonNext = document.getElementById("sliderButtonNext");
sliderButtonNext.onclick = () => {
  swipedHandler(1);
};

if (navigator.maxTouchPoints > 1) {
  sliderButtonPrev.classList.toggle("hidden");
  sliderButtonNext.classList.toggle("hidden");
}

function swipedHandler(direction) {
  if (requestedDate) {
    var date = new Date(requestedDate);
    date.setDate(date.getDate() + direction);

    getSchedule(date.toISOString());
  }
}

for (const el of scheduleBtns) {
  el.onclick = () => {
    scheduleBtn = el.dataset.responsibility;
    tableRendering(
      scheduleBtn,
      "scheduleBody",
      apiData[scheduleBtn],
      apiData.currentUser
    );
    for (const btn of scheduleBtns) {
      btn.classList.remove("active");
    }
    el.classList.add("active");
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
const mySchedulePrev = document.getElementById("mySchedulePrev");
mySchedulePrev.onclick = () => {
  reorderHidden(["startPage"], ["mySchedule"]);
};

// get my schedule
const btnGetMySchedule = document.getElementById("btnGetMySchedule");
btnGetMySchedule.onclick = () => {
  reorderHidden(["preloaderSec"], ["startPage"]);
  getMySchedule();
};

// datePickes
const datePickerMyScheduleFrom = document.getElementById(
  "datePickerMyScheduleFrom"
);
const datePickerMyScheduleTo = document.getElementById(
  "datePickerMyScheduleTo"
);
function datePickerChengeHandler() {
  reorderHidden(["preloaderSec"], ["mySchedule"]);
  getMySchedule(datePickerMyScheduleFrom.value, datePickerMyScheduleTo.value);
}

datePickerMyScheduleFrom.onchange = () => {
  datePickerChengeHandler();
};

datePickerMyScheduleTo.onchange = () => {
  datePickerChengeHandler();
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
    btnGetMySchedule.disabled = true;
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
        let error = new Error(
          `Помилка '${response.statusText}' код відповіді '${response.status}' . Зверніться до адміністратора`
        );
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
    var pageHeaderHtml = `<h2>Розклад з <span id="dateFrom">${dateTimeFormta(
      data.dateFrom
    )}</span> по <span id="dateTo">${dateTimeFormta(data.dateTo)}</span></h2>`;
    document.getElementById(table).innerHTML = pageHeaderHtml;

    switch (type) {
      case "dutyShift":
        var addClass = "";
        if (data.cook === currentUser) addClass = " currentUser";
        var coocHtml = `<div class="tableWrap">
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
        renderPart(table, "Черговий по кухні", data.dutyKitchen, currentUser);

        renderPartOneColumn(table, "В розташуванні", data.atBase, currentUser);

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
          renderPartOneColumn(table, "Відпустка", data.vacation, currentUser);
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
  document.getElementById(table).innerHTML +=
    headerHtml + tableContent + footerHtml;
}

function renderData(id, data) {
  let item = document.getElementById(`${id}`);
  item.innerText = data;
}

function dateTimeFormta(date) {
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

function dateFormta(date) {
  let d = new Intl.DateTimeFormat("uk-UA", {
    year: "numeric",
    month: "long",
    day: "2-digit",
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
        let error = new Error(
          `Помилка '${response.statusText}' код відповіді '${response.status}' . Зверніться до адміністратора`
        );
        throw error;
      }
      return response.json();
    })
    .then((data) => {
      let slogan = data.token.slogan;
      accessToken = data.token.accessToken;
      userFirstName = parseJwt(accessToken).name.split(" ")[0];
      if (
        userFirstName == "Нужних" ||
        userFirstName == "Пономаренко" ||
        userFirstName == "Фунер" ||
        userFirstName == "Мартиненко" ||
        userFirstName == "Хижняк"
      ) {
        document.getElementById("testBtn").classList.toggle("hidden");
      }

      document.getElementById("sloganInner").innerText = slogan;
      headers = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      // console.log(headers.headers.Authorization);
      getDateRange();
      todayBtn.disabled = false;
      byDateBtn.disabled = false;
      btnGetMySchedule.disabled = false;
      hiddenSwitching("singInBtn", "singOutBtn");
    })
    .catch((e) => {
      alert(e);
      console.log(e);
    });
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
  fetch(DATERANGE_URL, headers)
    .then((response) => {
      if (response.status != 200) {
        let error = new Error(
          `Помилка '${response.statusText}' код відповіді '${response.status}' . Зверніться до адміністратора`
        );
        throw error;
      }
      return response.json();
    })
    .then((data) => {
      minDate = data[0].split("T")[0];
      maxDate = data[`${data.length - 1}`].split("T")[0];
    })
    .then(() => {
      let datePicker = document.getElementById("datePicker");
      datePicker.value = new Date().toISOString().split("T")[0];
      datePicker.min = minDate;
      datePicker.max = maxDate;

      datePickerMyScheduleFrom.min = minDate;
      datePickerMyScheduleFrom.max = maxDate;
      datePickerMyScheduleTo.min = minDate;
      datePickerMyScheduleTo.max = maxDate;
    })
    .catch((e) => {
      alert(e);
      console.log("Error: getDateRange");
    });
}
if (navigator.serviceWorker.controller) {
  console
    .log
    // "[PWA Builder] active service worker found, no need to register"
    ();
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

function diffDates(day_one, day_two) {
  return (day_one - day_two) / (60 * 60 * 24 * 1000);
}

function getMySchedule(dateFrom, dateTo) {
  tableRendering(undefined, "scheduleBody", undefined);

  if (!dateFrom || !dateTo) {
    dateFrom = new Date();
    dateTo = new Date();
    let dateToSet = maxDate > (dateFrom.getDate() + 15) ? maxDate : (dateFrom.getDate() + 10);
    dateTo.setDate(dateToSet);

    datePickerMyScheduleFrom.value = dateFrom.toISOString().split("T")[0];
    datePickerMyScheduleTo.value = dateTo.toISOString().split("T")[0];

    datePickerMyScheduleFrom.max = datePickerMyScheduleTo.value;
    datePickerMyScheduleTo.min = datePickerMyScheduleFrom.value;
  }

  var url = `${MYSHEDULE_URL}?dateFrom=${datePickerMyScheduleFrom.value}&dateTo=${datePickerMyScheduleTo.value}`;

  fetch(url, headers)
    .then((response) => {
      if (response.status != 200) {
        let error = new Error(
          `Помилка '${response.statusText}' код відповіді '${response.status}' . Зверніться до адміністратора`
        );
        throw error;
      }
      return response.json();
    })
    .then((data) => {
      var htmlTableHeader = `<div class="tableWrap"><div>`;
      var htmlTableContent = "";

      var shiftType = "";
      var elDateSchdule = new Date();
      data.forEach((element) => {
        if (element.shiftType !== shiftType) {
          shiftType = element.shiftType;
          elDateSchdule = dateFormta(element.from);

          var iconImg = "";
          switch (element.shiftType) {
            case "Vacation":
              iconImg = "car (1).png";
              break;
            case "Security":
              iconImg = "bridge (2).png";
              break;
            case "Duty":
              iconImg = "home (3).png";
              break;
          }

          htmlTableContent += `
                            </div>
                        </div>
                        <div class="tableWrap">
                            <div class="myScheduleDataIcon"><img class="scheduleIcon" src="images/${iconImg}" alt=""></div>
                            <div style="width:100%" >
                                <div class="tRow">
					                <div class="rowDateHeader">${elDateSchdule}</div>
                                </div>`;
        }

        if (elDateSchdule !== dateFormta(element.from)) {
          elDateSchdule = dateFormta(element.from);
          htmlTableContent += `
                                <div class="tRow">
					                <div class="rowDateHeader">${elDateSchdule}</div>
                                </div>`;
        }

        htmlTableContent += `  
                <div class="tRow df">
					<div class="rowTimeDesc rowItem">${element.period}</div>
					<div class="rowGuardDesc rowItem">${convertMyScheduleType(
            element.periodType
          )}</div>
				</div>`;
      });
      var htmlTableFooter = "</div></div>";

      document.getElementById("myScheduleBody").innerHTML =
        htmlTableHeader + htmlTableContent + htmlTableFooter;
    })
    .then(() => {
      reorderHidden(["mySchedule"], ["preloaderSec"]);
    })
    .catch((e) => {
      reorderHidden(["startPage"], ["mySchedule", "preloaderSec"]);
      console.log("Error: getMySchedule");
      alert(e);
    });
}

function convertMyScheduleType(inType) {
  outType = "";
  switch (inType) {
    case "SecurityChief":
      outType = "Начальник варти";
      break;
    case "SecurityGuard":
      outType = "Чатовий";
      break;
    case "DutyChief":
      outType = "Черговий";
      break;
    case "DutyGuard":
      outType = "Днювальний (охорона)";
      break;
    case "DutyCleaning":
      outType = "Днювальний (прибирання)";
      break;
    case "DutyKitchen":
      outType = "Помічник по кухні";
      break;
    case "Vacation":
      outType = "Відпустка";
      break;
    case "AtBase":
      outType = "В розташуванні";
      break;
    case "Reserve":
      outType = "Резерв";
      break;
    case "Practice":
      outType = "Тренування";
      break;
    case "SickDay":
      outType = "Лікарняний";
      break;
  }

  return outType;
}

////////////// ? Test

const testBtn = document.getElementById("testBtn");
const logo = document.getElementById("logo");

testModeActivate(logo);

function testModeActivate(btn) {
  let count = 0;
  let timerId;
  btn.onclick = () => {
    count++;
    if (count === 5) {
      testBtn.classList.toggle("hidden");
      return;
    }
    if (timerId) window.clearTimeout(timerId);
    timerId = setTimeout(() => {
      count = 0;
    }, 500);
  };
}

const note = document.getElementById("note");

testBtn.onclick = () => {
  note.innerHTML = "";
  reorderHidden(["preloaderSec"], ["startPage"]);
  
  let dailyDutyArr = ["DutyChief", "DutyCleaning", "DutyKitchen", "DutyGuard"];

  //Create array of options to be added
  let optionsArray = [
    "Варта",
    "Добовий наряд",
    "Відпустка (квиток)",
    "Стаціонар (Шпиталь/Лікарня)",
    "Звільнення",
    "Розташування",
    "Інше",
  ];
  //Create array of options value to be added
  let optionsValueArray = [
    "guard",
    "dailyDuty",
    "vacation",
    "sickDay",
    "reserve",
    "atBase",
    "some",
  ];

  let url = `${GET_STAFF_WITH_DUTY_URL}?date=${new Date().toISOString()}`;

  fetch(url, headers)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      reorderHidden(["note"], ["preloaderSec"]);
      selectListRender(data);
    });

  function selectListRender(data) {
    let dutyType;
    data.forEach((element) => {
      switch (element.dutyType) {
        case "SecurityChief":
          dutyType = "guard";
          break;
        case "SecurityGuard":
          dutyType = "guard";
          break;
        case "Cook":
          dutyType = "dailyDuty";
          break;
        case "DutyChief":
          startPage;
          dutyType = "dailyDuty";
          break;
        case "DutyGuard":
          dutyType = "dailyDuty";
          break;
        case "DutyKitchen":
          dutyType = "dailyDuty";
          break;
        case "DutyCleaning":
          dutyType = "dailyDuty";
          break;
        case "Vacation":
          dutyType = "vacation";
          break;
        case "SickDay":
          dutyType = "sickDay";
          break;
        case "Reserve":
          dutyType = "reserve";
          break;
        case "AtBase":
          dutyType = "atBase";
          break;
        default:
          dutyType = "some";
          break;
      }

      let div = document.createElement("div");
      div.classList.add("df", "sli", "aic", "jcsb");

      let p = document.createElement("p");
      p.innerText = element.fullName;

      div.appendChild(p);

      //Create and append select list
      let select = document.createElement("select");
      select.classList.add("selectItem");
      //Create and append the options
      for (let i = 0; i < optionsArray.length; i++) {
        let option = document.createElement("option");
        option.value = optionsValueArray[i];
        option.text = optionsArray[i];
        select.appendChild(option);
      }
      select.dataset.person = element.fullName;
      select.value = dutyType;

      div.appendChild(select);
      note.appendChild(div);
    });
    let div = document.createElement("div");
    div.classList.add("df", "jcsa", "aic");
    let btn = document.createElement("button");
    btn.classList.add("bmenu");
    btn.setAttribute("id", "stuffWihtDutyNextBtn");
    btn.append("Далі");
    div.appendChild(btn);
    note.appendChild(div);
    document.getElementById("stuffWihtDutyNextBtn").onclick = () => {
      renderStuffOnDutyShedule();
    };
  }

  function renderStuffOnDutyShedule() {
    window.scrollTo( 0, 0 );
    let selectsCollection = document.getElementsByClassName("selectItem");
    let taskGroups = {
      guard: [],
      dailyDuty: [],
      vacation: [],
      sickDay: [],
      reserve: [],
      atBase: [],
      some: [],
    };
    for (const item of selectsCollection) {
      let val = item.value;
      let person = item.dataset.person;
      person = person.split(" ")[0];
      person = " " + person;
      if (val) {
        taskGroups[val].push(person);
      }
    }
    let listLength = selectsCollection.length;
    let noteHeaderItems = {
      "За штатом": 27,
      "За списком": listLength,
      "В наявності": taskGroups.atBase.length + taskGroups.dailyDuty.length,
      Відсутні:
        taskGroups.guard.length +
        taskGroups.vacation.length +
        taskGroups.reserve.length +
        taskGroups.some.length,
    };
    let noteBodyItems = {
      Варта: taskGroups.guard,
      "Добовий наряд": taskGroups.dailyDuty,
      Відпустка: taskGroups.vacation,
      Звільнення: taskGroups.reserve,
      Інше: taskGroups.some,
    };

    let section = document.createElement("section");
    section.classList.add("noteSection");
    const noteHeader = document.createElement("div");
    noteHeader.classList.add("noteHeader");
    const noteBody = document.createElement("div");
    noteBody.classList.add("noteBody");

    notePartRender(noteHeader, noteHeaderItems);
    section.appendChild(noteHeader);

    let h = document.createElement("h2");
    h.classList.add("tac");
    h.textContent = "По категоріях";
    section.appendChild(h);

    notePartRender(noteBody, noteBodyItems);
    let btn = document.createElement("button");
    btn.innerText = "Назад";
    btn.classList.add("bmenu");
    btn.onclick = () => {
      note.innerHTML = "";
      reorderHidden(["startPage"], ["note"]);
    };
    section.appendChild(noteBody);
    section.appendChild(btn);

    note.innerHTML = "";
    note.appendChild(section);
  }
  function notePartRender(part, obj) {
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        let div = document.createElement("div");
        div.classList.add("df", "jcsb");
        let p = document.createElement("p");
        p.innerText = key;
        let res = document.createElement("p");
        res.innerText = element;
        let hr = document.createElement("hr");
        div.appendChild(p);
        if (Array.isArray(element)) {
          let resCount = document.createElement("p");
          resCount.innerText = `(${element.length})`;
          div.appendChild(resCount);
        }
        div.appendChild(res);
        part.appendChild(div);
        part.appendChild(hr);
      }
    }
  }
};

////////////// ? Test

console.log("ok");
