/** The request modal composes an email to Cayleb; nothing is sent from the page. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True for each field that needs fixing. */
export const validate = ({ name, email, msg }) => ({
  name: !name.trim(),
  email: !EMAIL_RE.test(email.trim()),
  msg: !msg.trim(),
});

export function composeMail({ name, email, msg, topic }, to) {
  const subject = `${topic || 'Project'}: ${name.trim()}`;
  const body = `${msg.trim()}\n\n${name.trim()}\n${email.trim()}`;
  return {
    subject,
    body,
    href: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    text: `To: ${to}\nSubject: ${subject}\n\n${body}`,
  };
}
