/**
 * Studojo LinkedIn Connect — Content Script
 *
 * Signals to the page that the Studojo extension is active.
 * The search flow is now handled server-side (Apollo); this script
 * only serves to indicate extension presence for future features.
 */

window.postMessage({ type: 'STUDOJO_EXTENSION_READY' }, '*');
