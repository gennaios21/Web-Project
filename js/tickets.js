let cart = document.querySelector(".ticket-money");
const selectorAdults = document.querySelector("#select-adults");
const selectorChildren = document.querySelector("#select-children");
const selectorAmea = document.querySelector("#select-amea");
const selectorManyChildren = document.querySelector("#select-manychildren");
const selectorStudents = document.querySelector("#select-students");

const datem = document.querySelector("#calendar");

const buyButton = document.querySelector(".buy-button");
buyButton.addEventListener('click', function () {

    const money = selectorAdults.value * 10 + selectorChildren.value * 5 +
        selectorManyChildren.value * 4 + selectorStudents.value * 7 + selectorAmea.value * 1;
    // window.open("http://www.ece.upatras.gr/index.php/el/");
    if (money == 0) {
        window.alert('Δεν έχετε επιλέξει εισιτήριο!')
    }
    if (datem.valueAsDate.getDay() === 0 || datem.valueAsDate.getDay() === 3) {
        window.alert("Είμαστε κλειστά Τετάρτη και Κυριακή...");
    }
    else {
        window.alert("Θα σας περιμένουμε!")
    }
})

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


