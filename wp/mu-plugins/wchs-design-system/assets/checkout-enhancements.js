(function () {
	'use strict';

	var TIMER_KEY = 'wchs_checkout_timer_end';
	var TIMER_SECONDS = 6 * 60;

	function pad(n) {
		return n < 10 ? '0' + n : String(n);
	}

	function initTimer() {
		var el = document.querySelector('[data-wchs-checkout-timer]');
		if (!el) return;

		var end = sessionStorage.getItem(TIMER_KEY);
		if (!end) {
			end = String(Date.now() + TIMER_SECONDS * 1000);
			sessionStorage.setItem(TIMER_KEY, end);
		}
		end = parseInt(end, 10);

		function tick() {
			var left = Math.max(0, Math.floor((end - Date.now()) / 1000));
			var m = Math.floor(left / 60);
			var s = left % 60;
			el.textContent = m + ':' + pad(s);
			if (left > 0) {
				window.setTimeout(tick, 250);
			}
		}
		tick();
	}

	function relocateSidebar() {
		var sidebar = document.querySelector('.wchs-checkout-sidebar');
		var orderReview = document.getElementById('order_review');
		if (!sidebar || !orderReview) return;

		var table = orderReview.querySelector('table.woocommerce-checkout-review-order-table');
		if (!table) return;

		if (sidebar.parentElement !== orderReview || sidebar.previousElementSibling !== table) {
			table.insertAdjacentElement('afterend', sidebar);
		}
	}

	function relocatePayment() {
		var payment = document.getElementById('payment');
		var customerDetails = document.getElementById('customer_details');
		if (!payment || !customerDetails) return;

		var column = document.querySelector('.wchs-checkout-payment-column');
		if (!column) {
			column = document.createElement('div');
			column.className = 'wchs-checkout-payment-column';
			customerDetails.insertAdjacentElement('afterend', column);
		}

		if (payment.parentElement !== column) {
			column.appendChild(payment);
		}
	}

	function initReviews() {
		var root = document.querySelector('[data-wchs-reviews]');
		if (!root) return;

		var slides = root.querySelectorAll('[data-wchs-review-slide]');
		var dots = root.querySelectorAll('[data-wchs-review-dot]');
		if (!slides.length) return;

		var index = 0;
		var timer = null;

		function show(i) {
			index = (i + slides.length) % slides.length;
			slides.forEach(function (slide, si) {
				var active = si === index;
				slide.classList.toggle('is-active', active);
				slide.hidden = !active;
			});
			dots.forEach(function (dot, di) {
				var active = di === index;
				dot.classList.toggle('is-active', active);
				dot.setAttribute('aria-selected', active ? 'true' : 'false');
			});
		}

		function next() {
			show(index + 1);
		}

		dots.forEach(function (dot) {
			dot.addEventListener('click', function () {
				var target = parseInt(dot.getAttribute('data-wchs-review-dot') || '0', 10);
				show(target);
				if (timer) window.clearInterval(timer);
				timer = window.setInterval(next, 7000);
			});
		});

		timer = window.setInterval(next, 7000);
	}

	function boot() {
		relocatePayment();
		relocateSidebar();
		initTimer();
		initReviews();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}

	// Checkout AJAX refresh re-renders the order review fragment.
	if (typeof jQuery !== 'undefined') {
		jQuery(document.body).on('updated_checkout', function () {
			relocatePayment();
			relocateSidebar();
		});
	}
})();
