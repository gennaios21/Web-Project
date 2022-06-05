// 20 select options

let allSelect = document.querySelectorAll("select");

for (let i = 0; i < allSelect.length; i++) {
    for (let j = 0; j <= 20; j++) {
        const option = document.createElement("option");
        option.value = j;
        option.textContent = j;
        allSelect[i].appendChild(option);
    }
}

//  ανανεωση cart

let cart = document.querySelector(".ticket-money");
const selectorAdults = document.querySelector("#select-adults");
const selectorChildren = document.querySelector("#select-children");
const selectorAmea = document.querySelector("#select-amea");
const selectorManyChildren = document.querySelector("#select-manychildren");
const selectorStudents = document.querySelector("#select-students");

const datem = document.querySelector("#calendar");

// const buyButton = document.querySelector(".buy-button");
// buyButton.addEventListener('click', function () {

//     const money = selectorAdults.value * 10 + selectorChildren.value * 5 +
//         selectorManyChildren.value * 4 + selectorStudents.value * 7 + selectorAmea.value * 1;
    // if (money == 0) {
    //     window.alert('Δεν έχετε επιλέξει εισιτήριο!')
    // }
    // if (datem.valueAsDate.getDay() === 0 || datem.valueAsDate.getDay() === 3) {
    //     window.alert("Είμαστε κλειστά Τετάρτη και Κυριακή :( ");
    // }
    // else {
    //     window.alert("Θα σας περιμένουμε!")
    // }
// })

selectorAdults.addEventListener("change", updateMoney);
selectorChildren.addEventListener("change", updateMoney);
selectorAmea.addEventListener("change", updateMoney);
selectorManyChildren.addEventListener("change", updateMoney);
selectorStudents.addEventListener("change", updateMoney);


function updateMoney() {
    cart.textContent = `${selectorAdults.value * 10 + selectorChildren.value * 5 +
        selectorManyChildren.value * 4 + selectorStudents.value * 7 + selectorAmea.value * 1
        }€`;
}

// ελεγχος ημερομηνιας, ελαχιστη ημερομηνια = σημερινη

let todayDate = new Date();
let todayDay = todayDate.getDate();
let todayMonth = todayDate.getMonth() + 1;

if (todayDate.getHours() >= 20) {   // μετα τις 20:00, η σημερινη μερα δεν ειναι διαθεσιμη
    todayDay++;
}

if (todayDay < 10) {
    todayDay = '0' + todayDay;
}

if (todayMonth < 10) {
    todayMonth = '0' + todayMonth;
}


datem.setAttribute("min", todayDate.getFullYear() + "-" +
    todayMonth + "-" + todayDay);

datem.setAttribute("max", (todayDate.getFullYear()+1) + "-" +
    todayMonth + "-" + todayDay);
