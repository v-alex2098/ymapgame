const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');
/*signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});
signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});*/




const headerLinks = document.querySelectorAll('header a');
const span = document.querySelector('span');

headerLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const linkCoords = link.getBoundingClientRect();
        const headerCoords = document.querySelector('.header').getBoundingClientRect();
        const spanWidth = link.offsetWidth;

        span.style.width = `${spanWidth}px`;
        span.style.transform = `translateX(${linkCoords.left - headerCoords.left}px)`;
    });
});

const firstLinkCoords = headerLinks[0].getBoundingClientRect();
const headerCoords = document.querySelector('.header').getBoundingClientRect();
span.style.width = '${headerLinks[0].offsetWidth}px';
span.style.transform = 'translateX(${firstLinkCoords.left - headerCoords.left}px)';



const header = document.getElementById("header");
window.addEventListener("scroll", function(){
    const scrollpos = window.scrollY;
    if(scrollpos > 50){
        header.style.opacity = "0.5";
        header.style.padding = "10px 10px";
    }
    else{
        header.style.opacity = "";
        header.style.padding = "";
    }  

});

let scrollThreshold = 200; // Порог прокрутки в пикселях
    let wrapperShown = false;

    window.onscroll = function() {
        if (document.body.scrollTop > scrollThreshold || document.documentElement.scrollTop > scrollThreshold) {
            if (!wrapperShown) {
                document.getElementById("wrapper").style.display = "flex";
                wrapperShown = true;
            }
        }
    };

    //document.getElementById("close-btn").onclick = function() {
    //    document.getElementById("wrapper").style.display = "none";
   // };