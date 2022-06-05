//Animals responsiveness

const small = window.matchMedia("(max-width: 900px)");

let section = document.querySelectorAll(".section");
let sect = document.querySelectorAll(".section .div")
let img = document.querySelectorAll(".section img")


// για να εμφανιζονται εναλλαξ
for (let i = 0; i < img.length; i = i + 2) {
    section[i].insertBefore(sect[i], img[i]);
}

console.log(img)
console.log(sect)


small.onchange = (small) => {
    if (small.matches) {
        for (let i = 0; i < img.length; i++) {
            // section[i].insertBefore(img[i], sect[i]);
            section[i].insertBefore(sect[i], img[i]);
        }
    }

    else {
        for (let i = 0; i < img.length; i = i + 2) {
            // section[i].insertBefore(sect[i], img[i]);
            section[i].insertBefore(img[i], sect[i]);
        }
    }
}
