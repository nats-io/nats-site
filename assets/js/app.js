const navbarToggle = () => {
    const burger = $('.navbar-burger'),
      menu = $('.navbar-menu');
  
    burger.click(() => {
      [burger, menu].forEach((el) => el.toggleClass('is-active'));
    });
  }

  // On page load
$(function() {
    navbarToggle();
  
  });