// Simple modal for showing information and errors

/**
 * Show an information modal
 * @param {string} message - The message to display
 * @param {Function} callback - Optional callback to execute after closing
 */
function showInfoModal(message, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Information</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="modal-ok-btn">OK</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button
  const closeBtn = modal.querySelector('.modal-close');
  const okBtn = modal.querySelector('.modal-ok-btn');
  
  const closeModal = () => {
    modal.remove();
    if (typeof callback === 'function') {
      callback();
    }
  };
  
  closeBtn.addEventListener('click', closeModal);
  okBtn.addEventListener('click', closeModal);
}

/**
 * Show an error modal
 * @param {string} message - The error message to display
 * @param {Function} callback - Optional callback to execute after closing
 */
function showErrorModal(message, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content error">
      <div class="modal-header">
        <h3>Error</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="modal-ok-btn">OK</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button
  const closeBtn = modal.querySelector('.modal-close');
  const okBtn = modal.querySelector('.modal-ok-btn');
  
  const closeModal = () => {
    modal.remove();
    if (typeof callback === 'function') {
      callback();
    }
  };
  
  closeBtn.addEventListener('click', closeModal);
  okBtn.addEventListener('click', closeModal);
}

// Export functions
export { showInfoModal, showErrorModal };