document.addEventListener('DOMContentLoaded', function() {
  // Wait for the page to fully load
  setTimeout(function() {
    // Store the original showModal function if it exists
    const originalShowModal = window.showModal;
    
    // Override the showModal function
    window.showModal = function(errorType) {
      const modal = document.getElementById('globalErrorModal');
      const messageEl = document.getElementById('modalErrorMessage');
      
      if (!modal || !messageEl) {
        // Fall back to original function if available
        if (originalShowModal) return originalShowModal(errorType);
        return;
      }
      
      // Set appropriate message based on error type
      switch(errorType) {
        case 'password_mismatch':
          messageEl.textContent = 'Your passwords do not match. Please make sure both password fields contain the same password.';
          break;
        case 'password_length':
          messageEl.textContent = 'Your password must be at least 8 characters long.';
          break;
        case 'missing_required':
          messageEl.textContent = "You're missing some required fields. Please fill in all areas marked in red.";
          break;
        case 'notification':
          messageEl.textContent = 'Please select at least one notification method.';
          break;
        case 'terms':
          messageEl.textContent = 'Please accept the terms and conditions to continue.';
          break;
        case 'multiple':
          messageEl.textContent = 'There are several issues with your form. Please review all areas marked in red.';
          break;
        default:
          messageEl.textContent = "You're missing some required fields. Please fill in all areas marked in red.";
      }
      
      // Show the modal
      modal.classList.add('active');
      var overlay = document.getElementById('signupLocalOverlay');
      if (overlay) overlay.classList.add('active');
    };
    
    // Also override the validate function to detect specific error types
    const originalValidate = window.validate;
    
    if (typeof originalValidate === 'function') {
      window.validate = function(showErrorsOnSubmit) {
        // Get the form elements
        const form = document.getElementById('signupForm');
        if (!form) return originalValidate(showErrorsOnSubmit);
        
        const password = form.querySelector('#password');
        const confirmPassword = form.querySelector('#confirmPassword');
        const terms = form.querySelector('#terms');
        const notifyEmail = form.querySelector('#notifyEmail');
        const notifyPhone1 = form.querySelector('#notifyPhone1');
        const notifyPhone2 = form.querySelector('#notifyPhone2');
        
        // Determine the error type
        let errorType = 'missing';
        
        if (password && confirmPassword && 
            password.value && confirmPassword.value && 
            password.value !== confirmPassword.value) {
          errorType = 'password_mismatch';
        } else if (password && password.value && password.value.length < 8) {
          errorType = 'password_length';
        } else if (terms && !terms.checked) {
          errorType = 'terms';
        } else if (notifyEmail && notifyPhone1 && notifyPhone2 && 
                  !notifyEmail.checked && !notifyPhone1.checked && !notifyPhone2.checked) {
          errorType = 'notification';
        }
        
        // Call the original validate function
        const result = originalValidate(showErrorsOnSubmit);
        
        // If validation failed and we're showing errors, update the error message
        if (!result && showErrorsOnSubmit) {
          window.showModal(errorType);
        }
        
        return result;
      };
    }
  }, 1000); // Wait 1 second for everything to load
});