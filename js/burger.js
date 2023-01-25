let menuBtn = document.querySelector('.menu-btn');
let menu = document.querySelector('.menu');
menuBtn.addEventListener('click', function(){
	menuBtn.classList.toggle('active');
	if (menu.classList.contains('hidden')) {
		menu.classList.remove('hidden')
	} else {
		setTimeout(() => {
			menu.classList.add('hidden');
		}, 500);
	}
	setTimeout(() => {
		menu.classList.toggle('active');
	}, 200);
	
})