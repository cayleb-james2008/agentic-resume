import '@awesome.me/webawesome/dist/styles/themes/default.css';
import '@awesome.me/webawesome/dist/components/details/details.js';
import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';

const email = 'caylebalvarezjames@gmail.com';

await Promise.all([
  customElements.whenDefined('wa-details'),
  customElements.whenDefined('wa-copy-button'),
]);

for (const link of document.querySelectorAll(`a[href="mailto:${email}"]`)) {
  if (link.textContent.trim().toLowerCase() !== email) continue;
  const button = document.createElement('wa-copy-button');
  button.setAttribute('value', email);
  button.setAttribute('copy-label', 'Copy email address');
  button.setAttribute('success-label', 'Email copied');
  button.setAttribute('error-label', 'Copy failed; select the address instead');
  button.setAttribute('tooltip', 'copy');
  button.className = 'email-copy';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'email-copy__trigger';
  trigger.textContent = 'Copy';
  button.append(trigger);
  link.after(button);
}

const evidenceList = document.querySelector('.resume-evidence-list');
if (evidenceList) {
  for (const article of [...evidenceList.querySelectorAll(':scope > article')]) {
    const title = article.querySelector('h3')?.textContent?.trim();
    if (!title) continue;
    const details = document.createElement('wa-details');
    details.className = 'evidence-disclosure';
    details.setAttribute('summary', title);
    const expand = document.createElement('span');
    expand.slot = 'expand-icon';
    expand.textContent = '+';
    const collapse = document.createElement('span');
    collapse.slot = 'collapse-icon';
    collapse.textContent = '−';
    details.append(expand, collapse);
    article.before(details);
    details.append(article);
  }
}
