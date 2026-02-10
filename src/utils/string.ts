/**
 * HTML 특수문자를 이스케이프하여 XSS 방지
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
