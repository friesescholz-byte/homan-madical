/*
  =========================================
  HOMANN-MEDICAL Premium Onepager Logic
  Designed by Scholz & Friese UI/UX Team
  =========================================
*/

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Header Scroll Effect ---
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run once in case page starts scrolled

  // --- 2. Mobile Nav Menu Toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.querySelector('.nav');
  
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    // Close menu when clicking link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }

  // --- 3. Scroll Reveal System ---
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, no need to track it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver not supported
    revealElements.forEach(el => el.classList.add('active'));
  }

  // --- 4. Product Inquiry CTA Auto-fill ---
  const productSelect = document.getElementById('contact-product');
  const inquiryButtons = document.querySelectorAll('.product-inquiry-btn');

  inquiryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const product = button.getAttribute('data-product');
      if (productSelect && product) {
        productSelect.value = product;
      }
    });
  });

  // --- 5. Accessible Modals Toggle ---
  const modalImpressum = document.getElementById('modal-impressum');
  const modalDatenschutz = document.getElementById('modal-datenschutz');
  const modalBarrierefreiheit = document.getElementById('modal-barrierefreiheit');
  
  const openModal = (modal) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Triggers for Impressum
  document.getElementById('impressum-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(modalImpressum);
  });

  // Triggers for Datenschutz
  const openDatenschutz = (e) => {
    e.preventDefault();
    openModal(modalDatenschutz);
  };
  document.getElementById('datenschutz-link')?.addEventListener('click', openDatenschutz);
  document.getElementById('datenschutz-link-footer')?.addEventListener('click', openDatenschutz);

  // Triggers for Barrierefreiheit
  document.getElementById('barrierefreiheit-link-footer')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(modalBarrierefreiheit);
  });

  // Close Modals
  document.querySelectorAll('.modal').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn?.addEventListener('click', () => closeModal(modal));
    overlay?.addEventListener('click', () => closeModal(modal));
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modalImpressum);
      closeModal(modalDatenschutz);
      closeModal(modalBarrierefreiheit);
    }
  });

  // --- 6. Form Submission (Cloudflare Turnstile + Resend API) ---
  const contactForm = document.getElementById('contact-form');
  const successMessage = document.getElementById('form-success');

  if (contactForm && successMessage) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const turnstileToken = window.turnstile ? window.turnstile.getResponse() : '';
      if (!turnstileToken) {
        alert('Bitte bestätigen Sie den Spam-Schutz (Turnstile).');
        return;
      }

      // Show loading/progress state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';

      try {
        const payload = {
          source: 'homan-madical',
          turnstileToken: turnstileToken,
          name: document.getElementById('contact-name').value,
          company: document.getElementById('contact-company').value,
          email: document.getElementById('contact-email').value,
          phone: document.getElementById('contact-phone').value,
          product: document.getElementById('contact-product').value,
          message: document.getElementById('contact-message').value
        };

        const response = await fetch('https://friesescholzwebdesign.pages.dev/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Clear form and reset Turnstile
          contactForm.reset();
          if (window.turnstile) {
            window.turnstile.reset();
          }

          // Show Success
          successMessage.style.display = 'block';
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Hide success message after 8 seconds
          setTimeout(() => {
            successMessage.style.display = 'none';
          }, 8000);
        } else {
          alert('Fehler beim Senden: ' + (result.message || 'Unbekannter Fehler. Bitte versuchen Sie es später erneut.'));
          if (window.turnstile) {
            window.turnstile.reset();
          }
        }
      } catch (err) {
        console.error('Submit error:', err);
        alert('Verbindungsfehler: Die Anfrage konnte nicht gesendet werden.');
        if (window.turnstile) {
          window.turnstile.reset();
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

});

