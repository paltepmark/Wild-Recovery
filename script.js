/* Moss & Mercury: simple, readable front-end interactions for the Morrow auth demo. */
const modeButtons = document.querySelectorAll('[data-mode]');
const modeSwitch = document.querySelector('.mode-switch');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const title = document.querySelector('#form-title');
const description = document.querySelector('#form-description');
const statusMessage = document.querySelector('#status-message');

// Keep the two forms in one place so the experience never needs a page refresh.
function switchMode(mode) {
  const isSignup = mode === 'signup';
  loginForm.classList.toggle('is-visible', !isSignup);
  signupForm.classList.toggle('is-visible', isSignup);
  modeSwitch.classList.toggle('signup-active', isSignup);
  title.textContent = isSignup ? 'Create your account' : 'Welcome back';
  description.textContent = isSignup ? 'Join a thoughtful space for your next chapter.' : 'Enter your details to continue where you left off.';
  document.title = isSignup ? 'Morrow — Create account' : 'Morrow — Login';
  statusMessage.className = 'status-message';
  statusMessage.textContent = '';
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('is-active', active);
    if (button.getAttribute('role') === 'tab') button.setAttribute('aria-selected', String(active));
  });
}

modeButtons.forEach((button) => button.addEventListener('click', () => switchMode(button.dataset.mode)));

// Toggle password fields without changing the surrounding layout.
document.querySelectorAll('.password-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    button.textContent = showing ? 'Show' : 'Hide';
    button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });
});

function setError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.querySelector(`[data-error-for="${inputId}"]`);
  const group = input.closest('.field-group');
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  group?.classList.toggle('has-error', Boolean(message));
  if (error) error.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach((error) => { error.textContent = ''; });
  form.querySelectorAll('.field-group').forEach((group) => group.classList.remove('has-error'));
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.setAttribute('aria-invalid', 'false'));
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function setLoading(form, loading) {
  const submit = form.querySelector('.submit-button');
  submit.classList.toggle('is-loading', loading);
  submit.querySelector('span:first-child').textContent = loading ? 'Checking…' : (form.id === 'login-form' ? 'Log in' : 'Create account');
}

function validateLogin() {
  const identity = document.querySelector('#login-identity').value.trim();
  const password = document.querySelector('#login-password').value;
  let valid = true;
  if (!identity) { setError('login-identity', 'Please enter your email or username.'); valid = false; }
  if (!password) { setError('login-password', 'Please enter your password.'); valid = false; }
  return valid;
}

function validateSignup() {
  const name = document.querySelector('#signup-name').value.trim();
  const email = document.querySelector('#signup-email').value.trim();
  const username = document.querySelector('#signup-username').value.trim();
  const password = document.querySelector('#signup-password').value;
  const confirm = document.querySelector('#signup-confirm').value;
  const terms = document.querySelector('#signup-terms').checked;
  let valid = true;
  if (!name) { setError('signup-name', 'Please enter your full name.'); valid = false; }
  if (!email) { setError('signup-email', 'Please enter your email.'); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('signup-email', 'Please enter a valid email address.'); valid = false; }
  if (!username) { setError('signup-username', 'Please choose a username.'); valid = false; }
  if (!password) { setError('signup-password', 'Please create a password.'); valid = false; }
  else if (password.length < 8) { setError('signup-password', 'Use at least 8 characters.'); valid = false; }
  if (!confirm) { setError('signup-confirm', 'Please confirm your password.'); valid = false; }
  else if (password !== confirm) { setError('signup-confirm', 'Passwords do not match.'); valid = false; }
  if (!terms) { setError('signup-terms', 'Please accept the terms to continue.'); valid = false; }
  return valid;
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  clearErrors(form);
  statusMessage.className = 'status-message';
  statusMessage.textContent = '';
  const valid = form.id === 'login-form' ? validateLogin() : validateSignup();
  if (!valid) {
    showStatus('Please review the highlighted fields and try again.', 'error');
    const firstError = form.querySelector('.has-error input, input[aria-invalid="true"]');
    firstError?.focus();
    return;
  }
  setLoading(form, true);
  window.setTimeout(() => {
    setLoading(form, false);
    showStatus(form.id === 'login-form' ? 'Looks good. This demo would now continue to your dashboard.' : 'Your details look good. This demo does not create a real account.', 'success');
  }, 650);
}

loginForm.addEventListener('submit', handleSubmit);
signupForm.addEventListener('submit', handleSubmit);

// Submit on Enter naturally through the form; this listener only keeps the focus behavior friendly.
document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') input.form?.requestSubmit();
  });
});
