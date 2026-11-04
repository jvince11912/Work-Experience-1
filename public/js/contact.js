const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

// Record time when the script loads
const pageLoadTime = Date.now();
const allowedTime = 3; // set to 3 seconds when go live. Set to 30 sec for testing

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  statusEl.textContent = '';
  statusEl.className = 'form-status';

  // Calculate the time taken to fill out the form
  const submissionTime = Date.now();
  const secondsElapsed = (submissionTime - pageLoadTime) / 1000;

    // If it took less than xx seconds, intercept it
    if (secondsElapsed < allowedTime) {
        event.preventDefault(); // Stop the form from executing the actual network submit
        
        console.warn("Spam submission blocked via timer.");
        
       resetFormMessage();
       return; 

    }
  // continue with the form submission if it took more than xx seconds

  const data = Object.fromEntries(new FormData(form));

  //CHECK FOR HONEYPOT FIELD, RETURN IF SPAM. Destructure the data object to get the honeypot field value
  const { name, email, website , message} = data;

   if (website) {
       console.warn(`Spam detected from ${name} <${email}>: ${message}`);
       //continue processing below form-status--success!! the request without throwing an error
       resetFormMessage();
       return;
    }

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
 
    if (!result.ok) {
      throw new Error(result.error || 'Something went wrong.');
    }
    resetFormMessage();

  } catch (error) {
    statusEl.textContent = error.message || 'Something went wrong. Please email hello@calicomedia.co instead.';
    statusEl.classList.add('form-status--error');
  } finally {
    button.disabled = false;
  }
});


function resetFormMessage() {
  form.reset
  statusEl.textContent = "Thanks, we'll be in touch within one business day.";
  statusEl.classList.add('form-status--success');
}
