const url = "example.json";
const headers = {};

const memoInpt = document.getElementById("memoInpt");
const absenteesNumBtn = document.getElementById("absenteesNumBtn");
const absenteesNumInpt = document.getElementById("absenteesNumInpt");
let absenteesNum;   // Відсутні
let platoon;        // Взвод (об'єкт)
let platoonNum;     // За штатом
let dailyDuty;      // Добовий наряд

absenteesNumBtn.onclick = () => {
   absenteesNum = parseInt(absenteesNumInpt.value) || 0;
   console.log(absenteesNum);
   hiddenSwitching("memoInpt", "memorandum");

   fetch('response_1676026310751.json', headers)
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
      console.log(data);
      platoon = data
      platoonNum = platoon.length
   })
   .then(
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
         console.log(data);
         memoRender("memorandum", absenteesNum, data);
      })
      .catch((e) => {
         // reorderHidden(["startPage"], ["schedule", "preloaderSec"]);
         console.log("Error: getSchedule");
         alert(e);
      })
   );
};

function memoRender(divId, absenteesNum, data) {
   const div = document.getElementById(divId);

   let date = new Date().toISOString();
   date = dateTimeFormta(date);

   let guardArr = [];
   data.securityShift.duties.forEach((element) => {
      guardArr = [...guardArr, ...element.guard,]
   });
   guardArr.push(data.securityShift.chief);
   const uniqueGuardArr = [...new Set(guardArr)];

   let dailyDutyArr = [...data.dutyShift.chief, ...data.dutyShift.dutyCleaning, ...data.dutyShift.dutySecurity, ...data.dutyShift.dutyKitchen,]

   let dailyDutyPersonArr = []

   dailyDutyArr.forEach((element) => {
      if (element.hasOwnProperty("person")) {
         dailyDutyPersonArr.push(element.person)
      }
   });
   dailyDutyPersonArr.push(data.dutyShift.cook)
   const uniqueDailyDutyArr = [...new Set(dailyDutyPersonArr)];


   let memoTamplate = `<p>
<b>СТРОЙОВА ЗАПИСКА</b>
</p>
<p><b>3-го взводу 5 роти 1 батальйону</b></p>
<p>Станом на ${date}</p>
<table width="100%" cellpadding="7" cellspacing="0">
<tr>
   <td width="50%" valign="top" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <font face="Calibri, serif">
            <font size="4" style="font-size: 16pt">Кількість</font>
         </font>
      </p>
   </td>
   <td width="50%" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="center" style="orphans: 2; widows: 2">
         <font face="Calibri, serif">
            <font size="4" style="font-size: 16pt"></font>
         </font>
      </p>
   </td>

</tr>
<tr>
   <td width="50%" valign="top" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <font face="Calibri, serif">
            <font size="4" style="font-size: 16pt">За
               штатом</font>
         </font>
      </p>
   </td>
   <td width="50%" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <br />

      </p>
</tr>
<tr>
   <td width="50%" valign="top" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <font face="Calibri, serif">
            <font size="4" style="font-size: 16pt">За
               списком</font>
         </font>
      </p>
   </td>
   <td width="50%" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <br />

      </p>
   </td>
</tr>
<tr>
   <td width="50%" valign="top" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <font face="Calibri, serif">
            <font size="4" style="font-size: 16pt">В
               наявності</font>
         </font>
      </p>
   </td>
   <td width="50%" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <br />

      </p>
   </td>
</tr>
<tr>
   <td width="50%" valign="top" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <font face="Calibri, serif">
            <font size="4" style="font-size: 16pt">Відсутні</font>
         </font>
      </p>
   </td>
   <td width="50%" style="border: 1px solid #000000; padding: 0cm 0.19cm">
      <p align="left" style="orphans: 2; widows: 2">
         <br />

      </p>
   </td>
</tr>
</table>
<p style="line-height: 108%; margin: 20px ">Відсутні
по категоріях:</p>
<table width="100%" cellpadding="7" cellspacing="0">
<table>
   <tr valign="top">
      <td class="tdlh tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="3" style="font-size: 12pt"><b>Категорія</b></font>
            </font>
         </p>
      </td>
      <td class="tdlh tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="3" style="font-size: 12pt"><b>Прізвище</b></font>
            </font>
         </p>
      </td>
      <td class="tdsh tds">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="3" style="font-size: 12pt"><b>Всього
                     по категорії</b></font>
            </font>
         </p>
      </td>
   </tr>
   <tr>
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="2" style="font-size: 11pt">Варта</font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <p align="left" style="orphans: 2; widows: 2">
            ${arrToSurnameList(uniqueGuardArr)}
         </p>
      </td>
      <td class="tds">
         <p align="center" style="orphans: 2; widows: 2">
            ${uniqueGuardArr.length}
         </p>
      </td>
   </tr>
   <tr>
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="2" style="font-size: 11pt">Добовий
                  наряд</font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <p align="left" style="orphans: 2; widows: 2">
         ${arrToSurnameList(uniqueDailyDutyArr)}
         </p>
      </td>
      <td class="tds">
         <p align="center" style="orphans: 2; widows: 2">
            ${uniqueDailyDutyArr.length}
         </p>
      </td>
   </tr>
   <tr>
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="2" style="font-size: 11pt">Відпустка
                  (квиток)</font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <p align="left" style="orphans: 2; widows: 2">
            ${arrToSurnameList(data.vacationShift.vacation)}
         </p>
      </td>
      <td class="tds">
         <p align="center" style="orphans: 2; widows: 2">
         ${data.vacationShift.vacation.length}
         </p>
      </td>
   </tr>
   <tr>
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="2" style="font-size: 11pt">Стаціонар
                  (Шпиталь/Лікарня)</font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <p align="left" style="orphans: 2; widows: 2">
            ${arrToSurnameList(data.vacationShift.sickLeave)}
         </p>
      </td>
      <td class="tds">
         <p align="center" style="orphans: 2; widows: 2">
            ${data.vacationShift.sickLeave.length}
         </p>
      </td>
   </tr>
   <tr>
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="2" style="font-size: 11pt">Амбулаторно
                  (лікарня)</font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <p align="left" style="orphans: 2; widows: 2">
            <br />

         </p>
      </td>
      <td class="tds">
         <p align="center" style="orphans: 2; widows: 2">
            0
         </p>
      </td>
   </tr>
   <tr>
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="2" style="font-size: 11pt">Звільнення</font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <p align="left" style="orphans: 2; widows: 2">
            <br />

         </p>
      </td>
      <td class="tds">
         <p align="left" style="orphans: 2; widows: 2">
            <br />

         </p>
      </td>
      </td>
   </tr>
   <tr>
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="2" style="font-size: 11pt">Інше</font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <!-- <div class="tableForm df">
      <input class="tableInpt" type="number" name="beAway" id="beAway">
      <button class="tableBtn" id="tableBtn">ok</button>
   </div> -->
      </td>
      <td class="tds">
         <p align="left" style="orphans: 2; widows: 2">
            <br />

         </p>
      </td>
   </tr>
   <tr valign="top">
      <td class="tdl">
         <p align="center" style="orphans: 2; widows: 2">
            <font face="Calibri, serif">
               <font size="4" style="font-size: 16pt"><b>Всього
                     відсутні</b></font>
            </font>
         </p>
      </td>
      <td class="tdl">
         <p align="left" style="orphans: 2; widows: 2">
            <br />

         </p>
      </td>
   </tr>
</table>`;
   div.innerHTML = memoTamplate;
}

function arrToSurnameList(arr) {
   let surnameList = "";
   let length = arr.length - 1;
   arr.forEach((el, index) => {
      surnameList += " ";
      surnameList += el.split(" ")[0];
      if (index != length) {
         surnameList += "<br>";
      }
   })
   return surnameList
}
function arrToDailyDutyList(arr) {
   let surnameList = "";
   let length = arr.length - 1;
   arr.forEach((el, index) => {
      surnameList += " ";
      surnameList += el.split(" ")[0];
      if (index != length) {
         surnameList += "<br>";
      }
   })
   return surnameList
}



////////////////////////////////////////////////////////////
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
function hiddenSwitching(visId, hiddId) {
   const vis = document.getElementById(visId);
   const hidd = document.getElementById(hiddId);

   vis.classList.toggle("hidden");
   hidd.classList.toggle("hidden");
}
