export function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const contactThanks = document.getElementById('contactThanks');
  const contactError = document.getElementById('contactError');
  const submitButton = contactForm.querySelector('.btn-send');
  
  if (!contactThanks || !contactError || !submitButton) {
    console.warn("Contact form is missing required elements (Thanks, Error, or Button).");
    return;
  }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default page reload

    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Sending...</span>';

    const formData = new FormData(contactForm);

    fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json' // Request JSON response
      }
    })
    .then(response => {
        // Check if response is ok, then parse as JSON
        if (response.ok) {
            return response.json();
        }
        // If server returns an error, throw to catch block
        throw new Error(`Server responded with status: ${response.status}`);
    })
    .then(data => {
      // Assuming Web3Forms/Formspree send a success indicator
      // Adjust 'data.success' if your service uses a different key
      if (data.success || data.ok) { 
        contactForm.reset();
        contactThanks.hidden = false;
        contactError.hidden = true;
      } else {
        // Handle server-side validation errors
        console.error(data.message || 'Form submission failed.');
        contactThanks.hidden = true;
        contactError.hidden = false;
      }
    })
    .catch(error => {
      // Handle network errors
      console.error('Form submission network error:', error);
      contactThanks.hidden = true;
      contactError.hidden = false;
    })
    .finally(() => {
      // Always reset button
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    });
  });
}