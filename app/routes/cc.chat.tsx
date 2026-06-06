import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components";

export function meta() {
  return [{ title: "CareerDojo Chat | Studojo" }];
}

export function links() {
  return [{ rel: "stylesheet", href: "data:text/css,body{background:%23130D24}" }];
}

const CC_API = "/api/v1/cc";
const STORAGE_KEY = "studojo_student_id";

const HOOK_STATS = [
  { main: "B.Tech students applying on LinkedIn get a 1.4% callback rate.", emphasis: "Students who cold outreach hiring managers directly get 12 to 18%.", hook: "Let's figure out which companies you should be reaching." },
  { main: "Most applications are filtered by software before any human reads them.", emphasis: "A keyword-optimised resume gets through. A generic one gets rejected in seconds.", hook: "Let's see exactly where you stand right now." },
  { main: "The average student who books an interview has a readiness score of 74.", emphasis: "Most students start at 40 to 50.", hook: "Let's find your number and close the gap." },
  { main: "Sending 30 targeted cold emails gets replies in 1 to 2 weeks on average.", emphasis: "The same 30 applications on Naukri gets close to zero.", hook: "Let's build your outreach strategy, specific to your profile." },
];
const SOCIAL_PROOF = [
  "A B.Tech CSE student from Hyderabad improved their readiness from 38 to 71 in 3 weeks.",
  "A BCom student from Mumbai got a reply from a hiring manager at Deloitte using cold outreach.",
  "12 students in the Finance stream got internship replies this week.",
  "A BMS student targeting product roles went from 0 applications to 3 interview calls in 10 days.",
  "A student from a Tier-2 college landed a Data Analyst role by skipping job boards entirely.",
];

const CSS = `
.cc-root *,.cc-root *::before,.cc-root *::after{box-sizing:border-box;margin:0;padding:0;}
/* headings use Clash Display, body uses Satoshi (both loaded app-wide in app.css) */
.cc-root #cc-float-logo,.cc-root .hook-logo,.cc-root .chat-setup-header-title,
.cc-root .scard h3,.cc-root .xp-hero-role,.cc-root .xp-dash-name,
.cc-root .commit-q,.cc-root .hook-stat,.cc-root #cc-ready-pop .rp-title{font-family:"Clash Display",ui-sans-serif,system-ui,sans-serif;}
/* Light-only theme — matches the rest of studojo (Satoshi body, brand violet,
   brutalist border + shadow). Dark mode has been removed; the chat now reads
   as part of the main app, not a separate product. */
.cc-root{--bg-primary:#FAFAF7;--bg-secondary:#F2F1ED;--bg-white:#FFFFFF;--bg-raised:#F6F5F1;--text-primary:#0E0E12;--text-secondary:#52525B;--text-muted:#9CA3AF;--border:#E5E5EA;--border-light:rgba(0,0,0,0.08);--shadow-c:rgba(25,26,35,1);--accent-purple:#7C3AED;--accent-purple-muted:#6D28D9;--accent-lavender:#7C3AED;--accent-glow:rgba(124,58,237,0.30);--accent-light:#F1ECFE;--success:#10B981;--warning:#F59E0B;--gradient-primary:#7C3AED;--gradient-soft:linear-gradient(135deg,rgba(124,58,237,0.10) 0%,rgba(196,181,253,0.04) 100%);--sidebar-w:580px;height:calc(100dvh - 64px);font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow:hidden;display:flex;flex-direction:column;}
@media (min-width: 768px) { .cc-root { height: calc(100dvh - 96px); } }
/* Main app Header provides the studojo logo and avatar dropdown above
   the chat surface. The floating logo / floating avatar inside the chat
   are hidden — they were duplicates from when this was a standalone page. */
#cc-float-logo{display:none;}
#cc-user-wrap{display:none;}
.cc-dot{display:none;}
/* panel toggle sits below the main Header (24px clear, ~64-96px header) and
   slides horizontally with the sidebar */
#cc-float-toggle{position:fixed;top:84px;z-index:60;display:flex;align-items:center;gap:7px;cursor:pointer;border:2px solid var(--border);border-radius:999px;padding:8px 16px;background:#fff;color:var(--text-primary);box-shadow:3px 3px 0 var(--shadow-c);font-size:0.8rem;font-weight:700;transition:right 0.28s ease,transform 0.15s,box-shadow 0.15s;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
@media (max-width: 767px) { #cc-float-toggle{top:72px;} }
/* Header's avatar is in the top bar now; toggle just clears the sidebar */
#cc-float-toggle.open{right:calc(var(--sidebar-w) + 24px);}
#cc-float-toggle.closed{right:24px;}
#cc-float-toggle.cc-toggle-pulse{border-color:#7c3aed;color:#fff;background:#7c3aed;box-shadow:3px 3px 0 var(--shadow-c);animation:ccTogglePulse 1.1s ease-in-out infinite;}
@keyframes ccTogglePulse{0%,100%{transform:translateX(0) scale(1);box-shadow:3px 3px 0 var(--shadow-c);}50%{transform:translateX(-4px) scale(1.05);box-shadow:6px 6px 0 var(--shadow-c);}}
#cc-float-toggle:hover{transform:translateY(-1px);box-shadow:4px 4px 0 var(--shadow-c);}

/* PROFILE MENU (top-right avatar + dropdown). Mirrors the main platform header. */
#cc-user-wrap{position:fixed;top:14px;right:22px;z-index:130;}
#cc-user-btn{display:flex;align-items:center;gap:6px;background:transparent;border:none;padding:0;cursor:pointer;font-family:inherit;}
.cc-user-avatar{height:40px;width:40px;border-radius:50%;background:var(--accent-purple);border:2px solid var(--border);box-shadow:0 4px 14px -4px var(--accent-glow);display:flex;align-items:center;justify-content:center;}
.cc-user-avatar span{font-family:"Clash Display",ui-sans-serif,system-ui,sans-serif;font-size:0.95rem;font-weight:800;color:#fff;letter-spacing:-0.01em;user-select:none;}
.cc-user-chev{color:var(--text-secondary);transition:transform 0.18s;}
.cc-user-chev.up{transform:rotate(180deg);color:var(--text-primary);}
#cc-user-menu{position:absolute;top:calc(100% + 8px);right:0;width:248px;background:var(--bg-white);border:1px solid var(--border);border-radius:18px;box-shadow:0 18px 40px -12px rgba(0,0,0,0.7),0 2px 0 rgba(124,58,237,0.08) inset;padding:8px;display:flex;flex-direction:column;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}
.cc-user-item{display:flex;align-items:center;gap:11px;padding:9px 11px;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;font-size:0.86rem;font-weight:600;color:var(--text-primary);background:transparent;border:none;border-radius:10px;text-decoration:none;cursor:pointer;text-align:left;transition:background 0.12s;}
.cc-user-item:hover{background:rgba(124,58,237,0.10);color:#fff;}
.cc-user-icon{width:18px;height:18px;flex-shrink:0;color:var(--text-secondary);}
.cc-user-item:hover .cc-user-icon{color:var(--accent-lavender);}
.cc-user-sep{height:1px;background:var(--border-light);margin:6px 8px;}
.cc-user-item-toggle{justify-content:space-between;}
.cc-user-item-toggle > span:first-of-type{margin-right:auto;}
.cc-user-switch{flex-shrink:0;width:30px;height:18px;background:var(--bg-raised);border:1px solid var(--border);border-radius:999px;position:relative;transition:background 0.18s;}
.cc-user-switch > span{position:absolute;top:1px;left:1px;width:14px;height:14px;border-radius:50%;background:var(--text-secondary);transition:transform 0.18s,background 0.18s;}
.cc-user-switch.on{background:var(--accent-purple);border-color:transparent;}
.cc-user-switch.on > span{transform:translateX(12px);background:#fff;}
#cc-layout{flex:1;display:flex;min-height:0;}
#cc-chat-col{flex:1;display:flex;flex-direction:column;min-width:0;padding:16px 16px 16px;}
#cc-chat-inner{flex:1;display:flex;flex-direction:column;max-width:820px;margin:0 auto;width:100%;min-height:0;}
.chat-card{flex:1;display:flex;flex-direction:column;border:2px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:4px 4px 0 var(--shadow-c);background:var(--bg-white);min-height:0;}
.chat-setup-header{padding:14px 26px;flex-shrink:0;background:linear-gradient(135deg,#F1ECFE 0%,#FAF6FF 100%);border-bottom:1px solid rgba(124,58,237,0.18);}
.chat-setup-header.hidden{display:none;}
.chat-setup-header-title{font-size:1rem;font-weight:800;}
.chat-setup-header-sub{font-size:0.78rem;color:var(--text-muted);margin-top:2px;}
#cc-messages{flex:1;overflow-y:auto;padding:22px 26px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth;min-height:0;}
#cc-messages::-webkit-scrollbar{width:4px;}
#cc-messages::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:2px;}
.msg-row{display:flex;gap:12px;align-items:flex-end;}
.msg-row.agent{justify-content:flex-start;}
.msg-row.user{justify-content:flex-end;}
.agent-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;border:2px solid var(--border);overflow:hidden;background:#7c3aed;display:flex;align-items:center;justify-content:center;box-shadow:2px 2px 0 var(--shadow-c);}
.agent-avatar img{width:100%;height:100%;object-fit:cover;object-position:center top;}
.msg-bubble-wrap{display:flex;flex-direction:column;max-width:82%;}
.msg-bubble{padding:13px 17px;font-size:0.92rem;line-height:1.55;border:2px solid var(--border);white-space:pre-wrap;}
.msg-row.agent .msg-bubble{background:var(--bg-raised);border-radius:4px 18px 18px 18px;box-shadow:3px 3px 0 var(--shadow-c);}
.msg-row.user .msg-bubble{background:#7C3AED;border-color:transparent;border-radius:18px 4px 18px 18px;box-shadow:3px 3px 0 var(--shadow-c);color:#fff;}
.msg-row.user .msg-bubble-wrap{align-items:flex-end;}
.msg-bubble a{color:var(--accent-purple);font-weight:600;}
.msg-row.user .msg-bubble a{color:#fff;text-decoration:underline;}
.msg-time{font-size:10px;color:var(--text-muted);margin-top:4px;}
.report-link-btn{align-self:flex-start;margin-top:5px;background:none;border:none;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;font-size:0.7rem;font-weight:600;color:var(--text-muted);cursor:pointer;text-decoration:underline;padding:0;}
.report-link-btn:hover{color:var(--accent-purple);}
/* Inline Resume Maker upload button — hides the raw URL */
.rm-upload-btn{display:flex;align-items:center;gap:11px;margin-top:10px;padding:11px 14px;background:var(--accent-light);border:2px solid var(--accent-purple);border-radius:14px;text-decoration:none;color:var(--text-primary);box-shadow:3px 3px 0 var(--shadow-c);transition:all 0.15s;}
.rm-upload-btn:hover{transform:translateY(-1px);box-shadow:5px 5px 0 var(--shadow-c);}
.rm-upload-icon{font-size:1.2rem;flex-shrink:0;}
.rm-upload-title{display:block;font-size:0.86rem;font-weight:800;color:var(--text-primary);}
.rm-upload-sub{display:block;font-size:0.74rem;color:var(--text-secondary);margin-top:2px;line-height:1.4;}
/* Inline link-as-button for studojo tool/dojo URLs mentioned in chat */
.cc-link-btn{display:flex;width:fit-content;align-items:center;gap:7px;margin-top:10px;padding:10px 16px;background:var(--accent-purple);border:2px solid var(--accent-purple);border-radius:12px;text-decoration:none;color:#fff;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;font-size:0.84rem;font-weight:700;box-shadow:3px 3px 0 var(--shadow-c);transition:all 0.15s;white-space:nowrap;}
.cc-link-btn:hover{transform:translateY(-1px);box-shadow:5px 5px 0 var(--shadow-c);}
.cc-link-btn-icon{font-size:1rem;}
.typing-dots{display:flex;gap:5px;padding:4px 0;}
.typing-dots span{width:7px;height:7px;border-radius:50%;background:var(--accent-purple);animation:dotPulse 600ms ease-in-out infinite alternate;opacity:0.3;}
.typing-dots span:nth-child(2){animation-delay:200ms;}
.typing-dots span:nth-child(3){animation-delay:400ms;}
@keyframes dotPulse{to{opacity:1;transform:translateY(-2px);}}
.panel-cta{border:2px solid var(--border);border-radius:14px;padding:14px 18px;background:var(--accent-light);cursor:pointer;transition:all 0.2s ease;margin:2px 0 2px 44px;display:flex;align-items:center;justify-content:space-between;box-shadow:3px 3px 0 var(--shadow-c);max-width:76%;}
.panel-cta:hover{transform:translateY(-2px);box-shadow:5px 5px 0 var(--shadow-c);}
.panel-cta .cta-text{font-size:0.92rem;font-weight:700;}
.panel-cta .cta-sub{font-size:0.76rem;color:var(--text-secondary);margin-top:2px;}
.panel-cta .cta-arrow{font-size:1.25rem;color:var(--accent-purple);}
/* staged resume chip sitting above the input bar */
#cc-pending-resume{flex-shrink:0;display:flex;align-items:center;gap:10px;margin:0 22px;padding:9px 13px;background:var(--accent-light);border:2px solid var(--accent-purple);border-radius:12px;font-size:0.82rem;}
#cc-pending-resume .pr-icon{font-size:1.05rem;flex-shrink:0;}
#cc-pending-resume .pr-name{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;}
#cc-pending-resume .pr-hint{font-size:0.72rem;color:var(--text-secondary);margin-left:auto;}
#cc-pending-resume .pr-remove{background:none;border:none;color:var(--text-secondary);font-size:1rem;cursor:pointer;padding:0 4px;line-height:1;font-family:inherit;}
#cc-pending-resume .pr-remove:hover{color:var(--text-primary);}
#cc-pending-resume .pr-remove:disabled{opacity:0.4;cursor:not-allowed;}
/* Profiling progress strip — sits above the input during PROFILING */
#cc-profile-progress{flex-shrink:0;margin:0 22px 4px;padding:10px 14px;background:var(--accent-light);border:2px solid var(--accent-purple);border-radius:12px;box-shadow:3px 3px 0 var(--shadow-c);}
#cc-profile-progress .pf-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px;}
#cc-profile-progress .pf-msg{font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;font-size:0.82rem;font-weight:700;color:var(--text-primary);line-height:1.35;}
#cc-profile-progress .pf-meta{flex-shrink:0;font-size:0.72rem;font-weight:700;color:var(--accent-purple);white-space:nowrap;}
#cc-profile-progress .pf-bar-track{height:8px;border-radius:999px;background:rgba(124,58,237,0.15);overflow:hidden;}
#cc-profile-progress .pf-bar-fill{height:100%;border-radius:999px;background:var(--accent-purple);transition:width 0.6s ease;}
#cc-profile-progress .pf-idle{margin-top:7px;font-size:0.74rem;color:var(--text-secondary);line-height:1.4;}
#cc-profile-progress .pf-skip{margin-top:8px;background:none;border:none;padding:0;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;font-size:0.76rem;font-weight:700;color:var(--accent-purple);}
#cc-profile-progress .pf-skip:hover{text-decoration:underline;}
/* PREMIUM INPUT AREA — translucent surface, soft border, integrated attach
   + send, suggestion chips floating above, glow-on-focus halo. */
#cc-input-area{flex-shrink:0;background:transparent;border-top:none;padding:10px 22px 18px;display:flex;flex-direction:column;gap:10px;}
/* placeholder for the cycling ghost-text suggestion in the textarea */
#cc-chat-input::placeholder{color:var(--text-muted);opacity:0.85;transition:opacity 0.3s ease;}
#cc-input-shell{display:flex;align-items:flex-end;gap:8px;background:linear-gradient(180deg,rgba(28,28,38,0.85) 0%,rgba(19,19,26,0.85) 100%);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:22px;padding:8px 8px 8px 14px;box-shadow:0 8px 24px -10px rgba(0,0,0,0.55),0 0 0 0 transparent;transition:border-color 0.18s,box-shadow 0.22s;}
#cc-input-shell:focus-within{border-color:rgba(124,58,237,0.55);box-shadow:0 10px 28px -10px rgba(0,0,0,0.6),0 0 0 4px rgba(124,58,237,0.18);}
#cc-attach-btn{width:38px;height:38px;border-radius:50%;flex-shrink:0;background:transparent;color:var(--text-secondary);border:none;cursor:pointer;font-size:1.05rem;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
#cc-attach-btn:hover{color:var(--accent-lavender);background:rgba(124,58,237,0.10);}
#cc-chat-input{flex:1;border:none;background:transparent;padding:10px 4px;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;font-size:0.95rem;color:var(--text-primary);resize:none;min-height:42px;max-height:140px;outline:none;line-height:1.5;}
#cc-send-btn{width:40px;height:40px;border-radius:14px;flex-shrink:0;background:var(--accent-purple);border:none;color:white;font-size:1rem;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px -4px var(--accent-glow);}
#cc-send-btn:hover:not(:disabled){background:#A87DFF;transform:translateY(-1px);box-shadow:0 6px 18px -4px var(--accent-glow);}
#cc-send-btn:disabled{opacity:0.4;cursor:not-allowed;box-shadow:none;}
#cc-sidebar{width:var(--sidebar-w);flex-shrink:0;background:var(--bg-white);border-left:2px solid var(--border);display:flex;flex-direction:column;transition:margin-right 0.28s ease;overflow:hidden;}
#cc-sidebar.collapsed{margin-right:calc(-1 * var(--sidebar-w));}
#cc-sidebar.expanded{position:fixed;inset:0;width:100vw;z-index:200;border-left:none;}
/* collapsed-panel nav: pill buttons, same system as the expanded view */
#cc-sidebar-nav{display:flex;flex-direction:column;gap:8px;padding:14px;border-bottom:2px solid var(--border);flex-shrink:0;background:var(--bg-white);}
#cc-sidebar-tabs{display:flex;gap:6px;}
.side-tab{flex:1;min-width:0;padding:8px 8px;text-align:center;cursor:pointer;font-size:0.74rem;font-weight:700;color:var(--text-primary);background:var(--bg-raised);border:2px solid var(--border);border-radius:999px;box-shadow:2px 2px 0 var(--shadow-c);transition:all 0.15s;user-select:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.side-tab.active{background:var(--gradient-primary);color:white;border-color:transparent;}
.side-tab:hover:not(.active){background:var(--bg-secondary);}
.side-tab .tab-short{display:none;}
.side-action-row{display:flex;gap:8px;}
.side-action-btn{flex:1;min-width:0;border:2px solid var(--border);border-radius:999px;background:var(--bg-raised);color:var(--text-primary);padding:7px 10px;font-size:0.72rem;font-weight:700;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;box-shadow:2px 2px 0 var(--shadow-c);transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;}
.side-action-btn:hover{transform:translateY(-1px);box-shadow:3px 3px 0 var(--shadow-c);}
.side-action-close{display:none;}
#cc-sidebar-body{flex:1;overflow-y:auto;padding:18px;}
#cc-sidebar.expanded #cc-sidebar-body{max-width:760px;margin:0 auto;width:100%;}
#cc-sidebar-body::-webkit-scrollbar{width:5px;}
#cc-sidebar-body::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:3px;}
.side-empty{text-align:center;color:var(--text-muted);font-size:0.85rem;padding:48px 16px;line-height:1.6;}
.side-empty .se-icon{font-size:2rem;margin-bottom:12px;}
/* Skeleton shimmer for Career Analysis loading state */
@keyframes shimmer{0%{background-position:-600px 0;}100%{background-position:600px 0;}}
.skel-wrap{padding:4px 0 20px;display:flex;flex-direction:column;gap:14px;}
.skel-card{border:2px solid var(--border);border-radius:14px;padding:18px;background:var(--bg-raised);box-shadow:3px 3px 0 var(--shadow-c);}
.hist-wrap{padding:8px 0 20px;display:flex;flex-direction:column;gap:6px;}
.hist-day{margin-bottom:2px;}
.hist-day-label{font-size:0.68rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);padding:10px 4px 6px;}
.hist-msg{border:2px solid var(--border);border-radius:12px;padding:10px 13px;background:var(--bg-raised);box-shadow:2px 2px 0 var(--shadow-c);}
.hist-msg.user{background:var(--bg-secondary);}
.hist-msg.agent{background:var(--bg-white);}
.hist-role{font-size:0.66rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;}
.hist-role.agent{color:var(--accent-purple);}
.hist-body{font-size:0.82rem;line-height:1.55;color:var(--text-primary);white-space:pre-wrap;word-break:break-word;}
.hist-empty{padding:32px 16px;text-align:center;color:var(--text-muted);font-size:0.85rem;}
/* New-chat button + conversation thread list */
.hist-new-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:11px;background:var(--accent-purple);border:2px solid var(--accent-purple);border-radius:12px;color:#fff;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;font-size:0.86rem;font-weight:700;cursor:pointer;box-shadow:3px 3px 0 var(--shadow-c);transition:all 0.15s;}
.hist-new-btn:hover{transform:translateY(-1px);box-shadow:5px 5px 0 var(--shadow-c);}
.hist-conv-list{display:flex;flex-direction:column;gap:8px;margin-top:14px;}
.hist-conv-card{display:flex;flex-direction:column;gap:5px;text-align:left;width:100%;padding:12px 14px;background:var(--bg-white);border:2px solid var(--border);border-radius:12px;cursor:pointer;box-shadow:2px 2px 0 var(--shadow-c);transition:all 0.15s;}
.hist-conv-card:hover{transform:translateY(-1px);box-shadow:4px 4px 0 var(--shadow-c);border-color:var(--accent-purple);}
.hist-conv-card.active{border-color:var(--accent-purple);background:var(--accent-light);}
.hist-conv-title{font-size:0.86rem;font-weight:700;color:var(--text-primary);line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.hist-conv-meta{display:flex;align-items:center;gap:6px;font-size:0.72rem;color:var(--text-muted);font-weight:500;}
.hist-conv-badge{margin-left:auto;padding:1px 8px;background:var(--accent-purple);color:#fff;border-radius:999px;font-size:0.64rem;font-weight:700;letter-spacing:0.04em;}
.skel-line{height:12px;border-radius:6px;background:linear-gradient(90deg,var(--bg-secondary) 25%,var(--border) 50%,var(--bg-secondary) 75%);background-size:600px 100%;animation:shimmer 1.4s infinite linear;margin-bottom:10px;}
.skel-line.short{width:40%;}
.skel-line.medium{width:65%;}
.skel-line.full{width:100%;}
.skel-line.heading{height:22px;width:55%;margin-bottom:14px;}
.skel-pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}
.skel-pill{height:26px;border-radius:999px;background:linear-gradient(90deg,var(--bg-secondary) 25%,var(--border) 50%,var(--bg-secondary) 75%);background-size:600px 100%;animation:shimmer 1.4s infinite linear;}
.skel-score{display:flex;align-items:center;gap:16px;margin-top:6px;}
.skel-ring{width:72px;height:72px;border-radius:50%;background:linear-gradient(90deg,var(--bg-secondary) 25%,var(--border) 50%,var(--bg-secondary) 75%);background-size:600px 100%;animation:shimmer 1.4s infinite linear;flex-shrink:0;}
.skel-building{font-size:0.72rem;color:var(--text-muted);display:flex;align-items:center;gap:6px;margin-top:10px;}
.skel-pulse{width:7px;height:7px;border-radius:50%;background:var(--accent-purple);animation:dsPulse 1.6s ease-out infinite;flex-shrink:0;}
.scard{border:2px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px;background:var(--bg-raised);box-shadow:3px 3px 0 var(--shadow-c);}
.scard-title{font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;}
.scard h3{font-size:1.05rem;font-weight:800;margin-bottom:4px;}
.scard .sub{font-size:0.8rem;color:var(--text-secondary);}
.scard ul{margin:6px 0 2px;padding-left:18px;}
.scard li{font-size:0.82rem;line-height:1.55;margin-bottom:4px;color:var(--text-secondary);}
.pill{display:inline-block;font-size:0.74rem;font-weight:600;padding:4px 11px;border-radius:999px;border:1.5px solid var(--border);margin:3px 4px 3px 0;}
.pill.have{background:#10341F;color:#6EE7B7;border-color:#1C5235;}
.pill.top{background:#2E2547;color:#C4B5FD;border-color:#473A6B;}
.gap-item{border:1.5px solid var(--border-light);border-radius:10px;padding:11px 13px;margin-bottom:8px;}
.gap-item .gi-skill{font-size:0.86rem;font-weight:700;}
.gap-item .gi-how{font-size:0.78rem;color:var(--text-secondary);margin-top:3px;line-height:1.5;}
.gi-prio{font-size:0.62rem;font-weight:700;padding:2px 7px;border-radius:999px;text-transform:uppercase;}
.gi-prio.high{background:#3F1D1D;color:#FCA5A5;}
.gi-prio.medium{background:#3D2E11;color:#FCD34D;}
.gi-prio.low{background:#1E2147;color:#A5B4FC;}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.stat-box{border:2px solid var(--border);border-radius:12px;padding:12px;background:var(--accent-light);box-shadow:2px 2px 0 var(--shadow-c);}
.stat-box:nth-child(1){background:#F1ECFE;border-color:#C4B5FD;}
.stat-box:nth-child(2){background:#ECFDF5;border-color:#6EE7B7;}
.stat-box:nth-child(3){background:#FEF3C7;border-color:#FCD34D;}
.stat-box:nth-child(4){background:#EFF6FF;border-color:#93C5FD;}
.stat-box .sb-num{font-size:1.5rem;font-weight:800;line-height:1;}
.stat-box .sb-label{font-size:0.68rem;color:var(--text-secondary);margin-top:4px;font-weight:600;}
/* interactive roadmap step — expands on hover */
.rm-step{border:2px solid var(--border);border-radius:12px;padding:13px 14px;margin-bottom:10px;background:var(--bg-raised);box-shadow:3px 3px 0 var(--shadow-c);cursor:pointer;transition:all 0.18s ease;}
.rm-step:hover{box-shadow:5px 5px 0 var(--accent-purple);transform:translateY(-1px);}
.rm-step-head{display:flex;gap:11px;align-items:flex-start;}
.rm-num{width:24px;height:24px;border-radius:50%;background:var(--gradient-primary);border:2px solid var(--border);color:white;font-size:0.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rm-action{font-size:0.86rem;font-weight:700;line-height:1.45;}
.rm-detail{max-height:0;overflow:hidden;transition:max-height 0.25s ease,margin 0.25s ease,opacity 0.2s ease;opacity:0;}
.rm-step:hover .rm-detail{max-height:340px;opacity:1;margin-top:10px;}
.rm-detail .rm-why{font-size:0.78rem;color:var(--text-secondary);line-height:1.55;}
.rm-detail ul{margin:7px 0 2px;padding-left:18px;}
.rm-detail li{font-size:0.78rem;color:var(--text-secondary);line-height:1.5;margin-bottom:3px;}
.rm-hint{font-size:0.68rem;color:var(--text-muted);margin-top:4px;font-style:italic;}
.task-item{display:flex;align-items:center;gap:9px;padding:8px 0;font-size:0.84rem;cursor:pointer;border-bottom:1px solid var(--border-light);}
.task-item:last-child{border-bottom:none;}
.task-item input{width:17px;height:17px;accent-color:var(--accent-purple);cursor:pointer;flex-shrink:0;}
.task-weekly{border:2px solid var(--accent-purple);border-radius:12px;padding:12px 13px;background:var(--accent-light);margin-top:10px;}
.task-weekly .tw-label{font-size:0.66rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--accent-purple);margin-bottom:6px;}
.checkin-card{border:2px solid var(--accent-purple);border-radius:14px;padding:15px;margin-bottom:14px;background:var(--accent-light);}
.btn-sm{background:var(--gradient-primary);border:2px solid var(--border);border-radius:999px;box-shadow:2px 2px 0 var(--shadow-c);padding:8px 18px;color:white;font-weight:700;font-size:0.8rem;cursor:pointer;transition:all 0.15s;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
.btn-sm:hover:not(:disabled){transform:translateY(-1px);box-shadow:3px 3px 0 var(--shadow-c);}
.btn-sm:disabled{opacity:0.5;cursor:not-allowed;}
.btn-primary{background:var(--gradient-primary);border:3px solid var(--border);border-radius:999px;box-shadow:4px 4px 0 var(--shadow-c);padding:11px 22px;color:white;font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;width:100%;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:6px 6px 0 var(--shadow-c);}
.btn-ghost{background:var(--bg-raised);color:var(--text-primary);border:2px solid var(--border);border-radius:999px;box-shadow:3px 3px 0 var(--shadow-c);padding:9px 18px;font-weight:700;font-size:0.8rem;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;width:100%;transition:all 0.15s;}
.btn-ghost:hover{transform:translateY(-1px);background:var(--bg-secondary);}
.cc-unsaved-banner{position:fixed;top:0;left:0;right:0;z-index:300;background:#1e1344;border-bottom:2px solid var(--border);padding:9px 16px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:0.8rem;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
.cc-unsaved-banner span{color:#c4b5fd;}
.cc-unsaved-banner a{color:#a78bfa;font-weight:700;text-decoration:underline;cursor:pointer;}
.cc-unsaved-banner button{margin-left:auto;background:transparent;border:none;color:#c4b5fd;cursor:pointer;font-size:1rem;line-height:1;padding:0 4px;}
#cc-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--bg-raised);color:var(--text-primary);border:2px solid var(--border);padding:12px 22px;border-radius:999px;font-size:0.85rem;font-weight:600;z-index:500;transition:transform 0.3s ease;box-shadow:4px 4px 0 var(--shadow-c);}
#cc-toast.show{transform:translateX(-50%) translateY(0);}
/* analysis-ready popup, shown only when panel is collapsed */
#cc-ready-pop{position:fixed;bottom:24px;right:24px;z-index:400;background:var(--bg-raised);border:2px solid var(--border);border-radius:16px;box-shadow:5px 5px 0 var(--shadow-c);padding:16px 18px;max-width:300px;transform:translateY(140px);opacity:0;transition:transform 0.35s ease,opacity 0.35s ease;}
#cc-ready-pop.show{transform:translateY(0);opacity:1;}
#cc-ready-pop .rp-title{font-size:0.92rem;font-weight:800;margin-bottom:3px;}
#cc-ready-pop .rp-sub{font-size:0.76rem;color:var(--text-secondary);margin-bottom:11px;line-height:1.5;}
#cc-ready-pop .rp-btns{display:flex;gap:8px;}
#cc-ready-pop .rp-open{flex:1;background:var(--gradient-primary);color:white;border:2px solid var(--border);border-radius:999px;padding:7px 12px;font-weight:700;font-size:0.76rem;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
#cc-ready-pop .rp-later{background:var(--bg-secondary);color:var(--text-primary);border:2px solid var(--border);border-radius:999px;padding:7px 12px;font-weight:700;font-size:0.76rem;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
/* skills-unlocked banner — appears at bottom of screen after weekly check-in */
#cc-skills-unlocked{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(160px);z-index:500;background:var(--bg-raised);border:2px solid var(--accent-purple);border-radius:18px;box-shadow:6px 6px 0 rgba(139,92,246,0.35);padding:18px 20px;width:min(420px,92vw);opacity:0;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;}
#cc-skills-unlocked.show{transform:translateX(-50%) translateY(0);opacity:1;}
#cc-skills-unlocked .su-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
#cc-skills-unlocked .su-icon{width:36px;height:36px;background:var(--accent-purple);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
#cc-skills-unlocked .su-title{font-family:"Clash Display",ui-sans-serif,system-ui,sans-serif;font-size:1rem;font-weight:800;color:var(--text-primary);}
#cc-skills-unlocked .su-sub{font-size:0.76rem;color:var(--text-secondary);margin-top:1px;}
#cc-skills-unlocked .su-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
#cc-skills-unlocked .su-chip{background:rgba(139,92,246,0.12);border:1.5px solid var(--accent-purple);border-radius:999px;padding:3px 10px;font-size:0.72rem;font-weight:700;color:var(--accent-purple);}
#cc-skills-unlocked .su-btns{display:flex;gap:8px;}
#cc-skills-unlocked .su-add{flex:1;background:var(--accent-purple);color:white;border:2px solid var(--border);border-radius:999px;padding:9px 14px;font-weight:700;font-size:0.78rem;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
#cc-skills-unlocked .su-later{background:var(--bg-secondary);color:var(--text-primary);border:2px solid var(--border);border-radius:999px;padding:9px 14px;font-weight:700;font-size:0.78rem;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
#cc-hook{position:fixed;inset:0;z-index:600;background:var(--bg-primary);display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 0.45s ease,transform 0.45s ease;}
#cc-hook.dismissing{opacity:0;transform:translateY(-24px);pointer-events:none;}
.hook-inner{max-width:580px;width:90%;text-align:center;}
.hook-logo{font-size:1.6rem;font-weight:900;letter-spacing:-0.055em;line-height:1;margin-bottom:40px;text-align:center;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
.hook-stat{font-size:clamp(1.35rem,3vw,1.75rem);font-weight:800;letter-spacing:-0.03em;line-height:1.3;margin-bottom:16px;min-height:4.5em;transition:opacity 0.3s ease;}
.hook-stat .hs-main{color:var(--text-primary);display:block;margin-bottom:6px;}
.hook-stat .hs-emphasis{color:var(--accent-purple);display:block;}
.hook-hook{font-size:1rem;color:var(--text-secondary);margin-bottom:36px;font-weight:500;}
.hook-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:var(--gradient-primary);color:white;border:2px solid var(--border);border-radius:999px;font-weight:700;font-size:1rem;cursor:pointer;box-shadow:4px 4px 0 var(--shadow-c);transition:all 0.15s;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;}
.hook-cta:hover{transform:translateY(-2px);box-shadow:5px 6px 0 var(--shadow-c);}
.hook-meta{font-size:0.75rem;color:var(--text-muted);margin-top:16px;}
.hook-dots{display:flex;justify-content:center;gap:6px;margin-top:28px;}
.hook-dot{width:7px;height:7px;border-radius:50%;background:var(--border-light);transition:background 0.3s;cursor:pointer;border:none;}
.hook-dot.active{background:var(--accent-purple);}
.commit-q{font-size:1.3rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:10px;line-height:1.4;}
.commit-sub{font-size:0.9rem;color:var(--text-secondary);margin-bottom:28px;}
.commit-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.commit-btn{padding:13px 28px;border:2px solid var(--border);border-radius:16px;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:3px 3px 0 var(--shadow-c);transition:all 0.15s;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;background:var(--bg-raised);color:var(--text-primary);}
.commit-btn:hover{transform:translateY(-2px);}
.commit-btn.active-btn{background:var(--gradient-primary);color:white;border-color:transparent;}
.social-ticker{margin-top:24px;padding:10px 16px;background:var(--bg-secondary);border-radius:10px;font-size:0.75rem;color:var(--text-secondary);min-height:36px;display:flex;align-items:center;justify-content:center;transition:opacity 0.35s;}
.social-ticker .st-dot{width:6px;height:6px;border-radius:50%;background:var(--success);margin-right:8px;flex-shrink:0;}
.session-divider{text-align:center;font-size:0.72rem;color:var(--text-muted);padding:8px 0 4px;}
/* ===== DETECTED SO FAR (pre-DNA live panel) ===== */
.ds-empty{padding:60px 22px;text-align:center;color:var(--text-muted);}
.ds-empty-icon{font-size:2.2rem;color:var(--accent-purple);margin-bottom:14px;text-shadow:0 0 18px var(--accent-glow);}
.ds-empty-title{font-size:1rem;font-weight:800;color:var(--text-primary);margin-bottom:6px;}
.ds-empty-sub{font-size:0.82rem;line-height:1.55;max-width:280px;margin:0 auto;}
.ds-wrap{padding:4px 2px 24px;}
.ds-header{padding:18px 20px;border:1px solid var(--border);border-radius:18px;background:var(--gradient-soft);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);margin-bottom:14px;}
.ds-eyebrow{font-size:0.62rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent-lavender);margin-bottom:6px;}
.ds-title{font-size:1.15rem;font-weight:800;letter-spacing:-0.02em;}
.ds-sub{font-size:0.78rem;color:var(--text-secondary);margin-top:4px;line-height:1.5;}
.ds-conf-row{display:flex;align-items:center;gap:12px;margin-top:14px;}
.ds-conf-track{flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;}
.ds-conf-fill{height:100%;background:linear-gradient(90deg,var(--accent-purple-muted) 0%,var(--accent-purple) 100%);box-shadow:0 0 14px var(--accent-glow);transition:width 0.5s ease;}
.ds-conf-pct{font-size:0.82rem;font-weight:800;color:var(--accent-lavender);min-width:36px;text-align:right;}
.ds-conf-label{font-size:0.66rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-top:4px;}
.ds-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.ds-tile{border:1px solid var(--border);border-radius:14px;background:var(--bg-raised);padding:13px 14px;transition:border-color 0.18s,transform 0.18s;}
.ds-tile:hover{border-color:rgba(124,58,237,0.45);transform:translateY(-1px);}
.ds-tile-wide{grid-column:span 2;}
.ds-tile-label{font-size:0.6rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;}
.ds-tile-body{font-size:0.86rem;font-weight:600;line-height:1.45;color:var(--text-primary);text-transform:capitalize;}
.ds-tile-chips{display:flex;flex-wrap:wrap;gap:6px;}
.ds-tile-skel{opacity:0.55;border-style:dashed;}
.ds-tile-skel:hover{transform:none;border-color:var(--border);}
.ds-skel-lines{display:flex;flex-direction:column;gap:6px;}
.ds-skel-line{height:9px;border-radius:6px;background:linear-gradient(90deg,rgba(124,58,237,0.10),rgba(124,58,237,0.20),rgba(124,58,237,0.10));background-size:200% 100%;animation:dsShimmer 1.5s ease-in-out infinite;}
.ds-skel-line.short{width:55%;}
.ds-skel-hint{font-size:0.7rem;color:var(--text-muted);margin-top:2px;}
@keyframes dsShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
.ds-chip{display:inline-block;font-size:0.74rem;font-weight:600;padding:4px 11px;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text-secondary);}
.ds-chip-have{background:rgba(52,211,153,0.10);border-color:rgba(52,211,153,0.35);color:#6EE7B7;}
.ds-chip-glow{background:rgba(124,58,237,0.12);border-color:rgba(124,58,237,0.4);color:var(--accent-lavender);box-shadow:0 0 10px rgba(124,58,237,0.18);}
.ds-footer{display:flex;align-items:center;gap:9px;font-size:0.74rem;color:var(--text-muted);padding:10px 6px 2px;line-height:1.5;}
.ds-pulse{width:8px;height:8px;border-radius:50%;background:var(--accent-purple);box-shadow:0 0 0 0 var(--accent-glow);animation:dsPulse 1.6s ease-out infinite;flex-shrink:0;}
@keyframes dsPulse{0%{box-shadow:0 0 0 0 var(--accent-glow);}70%{box-shadow:0 0 0 8px transparent;}100%{box-shadow:0 0 0 0 transparent;}}

/* ===== EXPANDED FULL-PAGE VIEW ===== */
#cc-xp-nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 26px;border-bottom:2px solid var(--border);background:var(--bg-white);flex-shrink:0;}
#cc-xp-back{background:var(--bg-raised);color:var(--text-primary);border:2px solid var(--border);border-radius:999px;box-shadow:3px 3px 0 var(--shadow-c);padding:8px 16px;font-size:0.8rem;font-weight:700;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;transition:all 0.15s;white-space:nowrap;}
#cc-xp-back:hover{transform:translateY(-1px);box-shadow:4px 4px 0 var(--shadow-c);}
#cc-xp-tabs{display:flex;gap:6px;}
.cc-xp-tab{background:var(--bg-raised);color:var(--text-primary);border:2px solid var(--border);border-radius:999px;padding:8px 20px;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:"Satoshi",ui-sans-serif,system-ui,sans-serif;transition:all 0.15s;}
.cc-xp-tab:hover:not(.active){background:var(--bg-secondary);}
.cc-xp-tab.active{background:var(--gradient-primary);color:white;border-color:transparent;box-shadow:3px 3px 0 var(--shadow-c);}
.xp{max-width:760px;margin:0 auto;padding:8px 4px 40px;}
.xp-hero{border:2px solid var(--border);border-radius:20px;background:linear-gradient(135deg,#F1ECFE 0%,#FAF6FF 100%);box-shadow:5px 5px 0 var(--shadow-c);padding:28px;margin-bottom:20px;}
.xp-hero-label{font-size:0.72rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent-purple);margin-bottom:8px;}
.xp-hero-role{font-size:1.9rem;font-weight:800;letter-spacing:-0.03em;line-height:1.15;}
.xp-hero-meta{font-size:0.92rem;color:var(--text-secondary);margin-top:6px;}
.xp-hero-score{display:flex;align-items:center;gap:18px;margin-top:20px;}
.xp-ring{width:84px;height:84px;border-radius:50%;border:3px solid var(--border);background:var(--bg-raised);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:3px 3px 0 var(--shadow-c);}
.xp-ring span{font-size:1.8rem;font-weight:800;}
.xp-hs-num{font-size:1.05rem;font-weight:800;}
.xp-hs-sub{font-size:0.85rem;color:var(--text-secondary);margin-top:3px;line-height:1.5;}
.xp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.xp-card{border:2px solid var(--border);border-radius:16px;background:var(--bg-raised);box-shadow:4px 4px 0 var(--shadow-c);padding:20px;margin-bottom:20px;}
.xp-card-title{font-size:0.78rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;}
.xp-muted{font-size:0.84rem;color:var(--text-muted);}
.xp-callout{border:2px solid var(--accent-purple);border-radius:16px;background:var(--accent-light);padding:20px;margin-bottom:20px;}
.xp-callout-label{font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent-purple);margin-bottom:7px;}
.xp-callout-body{font-size:0.95rem;line-height:1.6;}
.xp-gap{border:1.5px solid var(--border-light);border-radius:12px;padding:14px;margin-bottom:10px;}
.xp-gap:last-child{margin-bottom:0;}
.xp-gap-skill{font-size:0.95rem;font-weight:700;}
.xp-gap-how{font-size:0.85rem;color:var(--text-secondary);margin-top:5px;line-height:1.55;}
.xp-actions{display:flex;flex-direction:column;gap:10px;margin-top:8px;}
/* expanded timeline roadmap */
.xp-timeline{margin-bottom:20px;}
.xp-tl-step{display:flex;gap:16px;}
.xp-tl-rail{display:flex;flex-direction:column;align-items:center;flex-shrink:0;}
.xp-tl-num{width:36px;height:36px;border-radius:50%;background:var(--gradient-primary);border:2px solid var(--border);color:white;font-size:0.95rem;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:2px 2px 0 var(--shadow-c);}
.xp-tl-line{flex:1;width:3px;background:var(--border);margin:4px 0;}
.xp-tl-body{flex:1;border:2px solid var(--border);border-radius:14px;background:var(--bg-raised);box-shadow:4px 4px 0 var(--shadow-c);padding:18px;margin-bottom:18px;cursor:pointer;transition:box-shadow 0.18s,transform 0.15s;}
.xp-tl-body:hover{box-shadow:5px 5px 0 var(--accent-purple);transform:translateY(-1px);}
.xp-tl-body.open{border-color:var(--accent-purple);background:#FDFCFF;}
.xp-tl-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px;}
.xp-tl-action{font-size:1.02rem;font-weight:800;line-height:1.35;}
.xp-tl-why{font-size:0.84rem;color:var(--text-secondary);line-height:1.55;margin-bottom:4px;}
.xp-tl-block{margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);}
.xp-tl-block-label{font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--accent-purple);margin-bottom:8px;}
.xp-tl-block-text{font-size:0.86rem;color:var(--text-secondary);line-height:1.6;}
.xp-tl-block ul{list-style:none;display:flex;flex-direction:column;gap:6px;}
.xp-tl-block ul li{display:flex;gap:8px;font-size:0.86rem;color:var(--text-secondary);line-height:1.5;}
.xp-tl-block ul li::before{content:"→";color:var(--accent-purple);flex-shrink:0;font-weight:800;}
.xp-tl-tool{margin-top:12px;padding:8px 12px;border-radius:8px;background:var(--accent-light);font-size:0.82rem;color:var(--accent-purple);font-weight:700;border:1px solid rgba(124,58,237,0.2);}
/* expanded dashboard */
.xp-dash-banner{display:flex;justify-content:space-between;align-items:center;gap:20px;border:2px solid var(--border);border-radius:20px;background:linear-gradient(135deg,#1B1340 0%,#2A1C4F 100%);color:#fff;box-shadow:5px 5px 0 var(--shadow-c);padding:26px 28px;margin-bottom:18px;}
.xp-dash-banner .xp-hero-label{color:#C4B5FD;}
.xp-dash-banner .xp-hero-meta{color:#DDD6FE;}
.xp-dash-name{font-size:1.6rem;font-weight:800;letter-spacing:-0.03em;margin-top:4px;}
.level-badge{display:inline-block;margin-top:10px;padding:5px 12px;background:var(--gradient-primary);color:#fff;border:2px solid var(--border);border-radius:999px;font-size:0.74rem;font-weight:800;letter-spacing:0.02em;box-shadow:2px 2px 0 var(--shadow-c);}
.xp-dash-ring{width:96px;height:96px;border-radius:50%;background:var(--gradient-primary);border:3px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;color:white;}
.xp-dash-ring span{font-size:2rem;font-weight:800;line-height:1;}
.xp-dash-ring small{font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.85;}
.xp-statrow{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
.xp-stat{border:2px solid var(--border);border-radius:14px;background:var(--bg-raised);box-shadow:3px 3px 0 var(--shadow-c);padding:16px;text-align:center;}
.xp-stat:nth-child(1){background:#F1ECFE;border-color:#C4B5FD;}
.xp-stat:nth-child(2){background:#ECFDF5;border-color:#6EE7B7;}
.xp-stat:nth-child(3){background:#FEF3C7;border-color:#FCD34D;}
.xp-stat:nth-child(4){background:#EFF6FF;border-color:#93C5FD;}
.xp-stat-num{font-size:1.7rem;font-weight:800;line-height:1;}
.xp-stat-label{font-size:0.68rem;color:var(--text-secondary);margin-top:6px;font-weight:600;}
.xp-chart{display:flex;align-items:flex-end;gap:8px;height:160px;padding-top:18px;}
.xp-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%;}
.xp-bar{width:100%;background:var(--gradient-primary);border:2px solid var(--border);border-radius:6px 6px 0 0;min-height:8px;display:flex;align-items:flex-start;justify-content:center;position:relative;margin-top:auto;}
.xp-bar-val{position:absolute;top:-16px;font-size:0.68rem;font-weight:800;color:var(--text-primary);}
.xp-bar-date{font-size:0.62rem;color:var(--text-muted);margin-top:5px;}
.xp-weekly{border-color:var(--accent-purple);background:var(--accent-light);}
/* skill-gap click-to-expand (expanded career analysis) */
.gap-clickable{cursor:pointer;transition:border-color 0.15s ease,background 0.15s ease;}
.gap-clickable:hover{border-color:var(--accent-purple);}
.gap-clickable.open{border-color:var(--accent-purple);background:var(--accent-light);}
.gap-chevron{color:var(--accent-purple);font-size:0.95rem;font-weight:800;display:inline-block;min-width:14px;text-align:center;}
/* roadmap intent line */
.rm-intent,.xp-intent{border:2px solid var(--accent-purple);border-radius:14px;background:var(--accent-light);padding:14px 16px;margin-bottom:14px;font-size:0.86rem;line-height:1.6;font-weight:600;color:var(--text-primary);}
.xp-intent{font-size:0.95rem;padding:18px 20px;margin-bottom:20px;}
/* expanded roadmap click-to-expand */
.rm-clickable{cursor:pointer;transition:box-shadow 0.18s ease,transform 0.18s ease,border-color 0.15s ease;}
.rm-clickable:hover{box-shadow:5px 5px 0 var(--accent-purple);transform:translateY(-1px);}
.rm-clickable.open{box-shadow:5px 5px 0 var(--accent-purple);border-color:var(--accent-purple);}
/* dashboard progress tracker */
.trk-row{display:flex;align-items:center;gap:12px;margin:4px 0 6px;}
.trk-bar-track{flex:1;height:14px;background:var(--bg-secondary);border:2px solid var(--border);border-radius:999px;overflow:hidden;}
.trk-bar-fill{height:100%;background:var(--gradient-primary);transition:width 0.5s ease;}
.trk-pct{font-size:0.9rem;font-weight:800;min-width:42px;text-align:right;}
.trk-sub{font-size:0.75rem;color:var(--text-secondary);margin-bottom:6px;}
.trk-milestone{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:0.84rem;border-bottom:1px solid var(--border-light);}
.trk-milestone:last-child{border-bottom:none;}
.trk-dot{width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.66rem;font-weight:800;border:2px solid var(--border);background:var(--bg-secondary);color:var(--text-secondary);}
.trk-dot.done{background:var(--success);border-color:transparent;color:#0E0E12;}
/* dashboard tool buttons */
.tool-btn-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.tool-btn{display:flex;align-items:center;gap:7px;border:2px solid var(--border);border-radius:12px;background:var(--bg-secondary);color:var(--text-primary);box-shadow:2px 2px 0 var(--shadow-c);padding:10px 12px;font-size:0.78rem;font-weight:700;text-decoration:none;transition:all 0.15s;}
.tool-btn:hover{transform:translateY(-1px);box-shadow:3px 3px 0 var(--accent-purple);}
.tool-btn-icon{font-size:0.95rem;}
@media(max-width:900px){
  .cc-root{--sidebar-w:min(360px,92vw);}
  #cc-sidebar{position:fixed;top:0;right:0;bottom:0;z-index:90;box-shadow:-4px 0 0 var(--shadow-c);}
  #cc-chat-col{padding:8px;}
  .xp-grid2{grid-template-columns:1fr;}
  .xp-statrow{grid-template-columns:1fr 1fr;}
  /* hide the floating "Hide panel" pill on mobile — it overlaps the panel's
     own tab pills. The in-panel "Close" button replaces it. */
  #cc-float-toggle{display:none;}
  .side-tab .tab-full{display:none;}
  .side-tab .tab-short{display:inline;}
  .side-action-close{display:flex;}
  /* narrow the floating logo on mobile so it doesn't dominate the navbar area */
  #cc-float-logo{font-size:1.4rem;top:14px;left:16px;}
  /* compact profile avatar */
  #cc-user-wrap{top:10px;right:14px;}
  .cc-user-avatar{height:34px;width:34px;}
  .cc-user-avatar span{font-size:0.82rem;}
  #cc-user-menu{width:220px;}
}
@media(max-width:480px){
  .cc-root{--sidebar-w:100vw;}
  #cc-sidebar{border-left:none;}
}

/* Light-theme surface overrides (merged into base now that dark mode is gone) */
.msg-row.agent .msg-bubble{background:#F1ECFE;color:var(--text-primary);}
.msg-row.user .msg-bubble{color:#fff;}
#cc-input-shell{background:linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(246,245,241,0.9) 100%);box-shadow:0 8px 24px -12px rgba(15,15,25,0.18);}
.ds-chip{background:rgba(15,15,25,0.04);color:var(--text-secondary);}
.ds-chip-glow{background:rgba(124,58,237,0.10);color:#5B21B6;box-shadow:none;}
.ds-chip-have{background:rgba(16,185,129,0.10);color:#065F46;border-color:rgba(16,185,129,0.35);}
.xp-dash-banner .xp-hero-label{color:#C4B5FD;}
.xp-dash-banner .xp-hero-meta{color:#DDD6FE;}
#cc-user-menu{box-shadow:0 18px 40px -12px rgba(15,15,25,0.18);}
.cc-user-item:hover{background:#F1ECFE;color:var(--accent-lavender);}
`;

type Msg = { role: string; content: string; state?: string; time: string; cta?: string };
type CtaKind = "analysis" | "roadmap" | "dashboard" | "history";

// Recognise any spelling of the Resume Maker URL: with or without protocol,
// optional www, trailing slash or path tail.
const RESUME_MAKER_RE = /(?:https?:\/\/)?(?:www\.)?studojo\.com\/resume-maker[^\s)]*/gi;

// Known studojo tool/dojo links the agent mentions — rendered as a button
// instead of a raw URL. Each entry: a matcher regex, the button label, an icon,
// and the canonical href.
const STUDOJO_LINK_BUTTONS: { re: RegExp; label: string; icon: string; href: string }[] = [
  { re: /(?:https?:\/\/)?(?:www\.)?studojo\.com\/dojos\/internships[^\s)]*/gi, label: "Browse Internship Dojo", icon: "", href: "https://studojo.com/dojos/internships" },
  { re: /(?:https?:\/\/)?(?:www\.)?studojo\.com\/outreach[^\s)]*/gi, label: "Open Outreach Dojo", icon: "✉️", href: "https://studojo.com/outreach" },
  { re: /(?:https?:\/\/)?(?:www\.)?studojo\.com\/reports[^\s)]*/gi, label: "Browse Reports", icon: "📊", href: "https://studojo.com/reports" },
  { re: /(?:https?:\/\/)?(?:www\.)?studojo\.com\/dojos\/ai-risk[^\s)]*/gi, label: "Open AI Risk Dojo", icon: "🤖", href: "https://studojo.com/dojos/ai-risk" },
];

// Render a plain-text bubble:
// - capitalize the first letter
// - if the bubble mentions the Resume Maker URL, strip it and render the
//   styled Resume Maker button instead
// - if the bubble mentions a known studojo dojo/tool URL, strip it and render
//   a button at the end of the bubble
// - any other URLs are linkified normally
function renderBubbleText(text: string) {
  let t = String(text || "");
  t = t.replace(/^(\s*)([a-z])/, (_m, ws, ch) => ws + ch.toUpperCase());

  // Detect Resume Maker URL, strip it (and a leading colon/dash before it).
  const hasResumeUrl = RESUME_MAKER_RE.test(t);
  RESUME_MAKER_RE.lastIndex = 0;
  if (hasResumeUrl) {
    t = t.replace(/[\s:,\-—.]*(here\s*[:\-]?\s*)?(?:https?:\/\/)?(?:www\.)?studojo\.com\/resume-maker[^\s)]*/gi, "").trim();
    t = t.replace(/\s{2,}/g, " ").replace(/[\s,;.]+$/, "");
  }

  // Detect known studojo dojo/tool links, strip them and queue buttons.
  const linkButtons: { label: string; icon: string; href: string }[] = [];
  for (const b of STUDOJO_LINK_BUTTONS) {
    b.re.lastIndex = 0;
    if (b.re.test(t)) {
      b.re.lastIndex = 0;
      t = t.replace(b.re, "").trim();
      // Clean up a dangling "here:" / colon / trailing punctuation the URL left behind
      t = t.replace(/\s*:\s*$/, "").replace(/\s{2,}/g, " ").replace(/[\s,;.]+$/, "");
      linkButtons.push({ label: b.label, icon: b.icon, href: b.href });
    }
  }

  const urlRe = /(https?:\/\/[^\s)]+)/g;
  const parts = t.split(urlRe);
  const rendered: JSX.Element[] = parts.map((part, i) =>
    urlRe.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
      : <span key={i}>{part}</span>
  );

  if (hasResumeUrl) {
    rendered.push(
      <a key="rm-btn" className="rm-upload-btn" href="https://studojo.com/resume-maker" target="_blank" rel="noopener noreferrer">
        <span className="rm-upload-icon">📄</span>
        <span>
          <span className="rm-upload-title">Resume Maker</span>
          <span className="rm-upload-sub">If you don't have a resume, make one here. If you already have one, just keep chatting.</span>
        </span>
      </a>
    );
  }

  linkButtons.forEach((b, i) => {
    rendered.push(
      <a key={`lnk-${i}`} className="cc-link-btn" href={b.href} target="_blank" rel="noopener noreferrer">
        {b.icon && <span className="cc-link-btn-icon">{b.icon}</span>}
        <span>{b.label}</span>
        <span aria-hidden="true">→</span>
      </a>
    );
  });

  return rendered;
}

export default function CcChat() {
  const [agentState, setAgentState] = useState("GREETING");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [returning, setReturning] = useState(false);

  // sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [panel, setPanel] = useState<CtaKind>("analysis");
  const [sidebarData, setSidebarData] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [dnaRefreshing, setDnaRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  // List of past chat threads, shown as resumable buttons in the history panel
  const [conversations, setConversations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<{ daily: any[]; weekly: any } | null>(null);
  const [taskBoxes, setTaskBoxes] = useState<Record<string, boolean>>({});
  // staged resume file shown as a chip above the input until the student hits Send
  const [pendingResume, setPendingResume] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  // Context-aware example prompts the input bar cycles through as ghost
  // text when the textarea is empty. Tab fills it, typing replaces it.
  const [chips, setChips] = useState<string[]>([
    "Tell me what to expect",
    "What if I'm still figuring it out?",
    "Upload my resume to fast-track this",
  ]);
  const [ghostIdx, setGhostIdx] = useState(0);
  const [inputEmpty, setInputEmpty] = useState(true);

  // profile dropdown menu (top-right avatar)
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Require login to use the career coach. Once the session check resolves with
  // no session, send the student to sign in and return here afterward.
  useEffect(() => {
    if (!sessionPending && !session) {
      const here = typeof window !== "undefined" ? window.location.pathname : "/cc/chat";
      window.location.href = `/auth?redirect=${encodeURIComponent(here)}`;
    }
  }, [sessionPending, session]);

  // theme toggle — persisted per authenticated user, falls back to a shared key
  // for unauthenticated sessions. Default is dark to match the existing look.
  const themeStorageKey = session?.user?.email
    ? `studojo_cc_theme:${session.user.email}`
    : "studojo_cc_theme";
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // Load saved theme once we know which key to read.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(themeStorageKey);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch { /* ignore */ }
  }, [themeStorageKey]);

  // Persist whenever it changes.
  useEffect(() => {
    try { localStorage.setItem(themeStorageKey, theme); } catch { /* ignore */ }
  }, [theme, themeStorageKey]);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  function handleSignOut() {
    setUserMenuOpen(false);
    authClient.signOut().catch(() => {});
    // Hard reload so the chat resets cleanly post-signout.
    setTimeout(() => { window.location.href = "/"; }, 100);
  }

  function userInitials(): string {
    const u = session?.user;
    if (!u) return "?";
    const source = u.name || u.email || "";
    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return (parts[0][0] || "?").toUpperCase();
    return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
  }
  // tracks which Career-Analysis skill gap / Roadmap step is currently expanded
  const [openGap, setOpenGap] = useState<number | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [checkInSaving, setCheckInSaving] = useState(false);

  // skills-unlocked banner after a weekly check-in that produced new skills
  const [skillsUnlocked, setSkillsUnlocked] = useState<{ skills: string[]; hasResume: boolean } | null>(null);

  // Profiling auto-open: when profiling starts we auto-open the analysis panel
  // so the student watches their Career Analysis build live. If they close it,
  // we re-open it on their next answer — up to 5 times — then stop forcing it
  // and instead make the "Show panel" button pulse to draw attention.
  const profileAutoOpenCountRef = useRef(0);
  const [pulseShowPanel, setPulseShowPanel] = useState(false);

  // analysis-ready popup
  const [readyPopVisible, setReadyPopVisible] = useState(false);
  const analysisAnnouncedRef = useRef(false);

  // Live profiling progress (drives the progress strip above the input that
  // tells students how close they are to their Career DNA — reduces drop-off).
  const [profileProgress, setProfileProgress] = useState<{
    pct: number; areas: Record<string, any>; dnaReady: boolean; canSkip: boolean;
  } | null>(null);
  // Idle re-engagement hint: shows after the student leaves the input untouched
  // mid-profiling. Cleared the moment they type or send.
  const [idleHint, setIdleHint] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); }, []);

  // unsaved-session banner for logged-out users
  const [unsavedBannerDismissed, setUnsavedBannerDismissed] = useState(false);

  // hook
  const [outreachNote, setOutreachNote] = useState<{ toolRec: string; jbPct: number; orPct: number } | null>(null);
  const [resumeStatusMsg, setResumeStatusMsg] = useState<string | null>(null);
  // Rotating "thinking" status shown during the (LLM-bound) wait so the ~10s
  // pause feels purposeful instead of dead. Advances while `waiting` is true.
  const [thinkingMsg, setThinkingMsg] = useState<string | null>(null);
  const [hookVisible, setHookVisible] = useState(false);
  const [hookDismissing, setHookDismissing] = useState(false);
  const [statIdx, setStatIdx] = useState(0);
  const [statOpacity, setStatOpacity] = useState(1);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [toastMsg, setToastMsg] = useState("");

  const studentIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const pendingGreetingRef = useRef<any>(null);
  const hookDismissedRef = useRef(false);
  const sidebarLoadedRef = useRef(false);
  const sidebarOpenRef = useRef(false);
  const initDone = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const now12h = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  }

  // hook stat cycle
  useEffect(() => {
    if (!hookVisible) return;
    const t = setInterval(() => {
      setStatOpacity(0);
      setTimeout(() => { setStatIdx(i => (i + 1) % HOOK_STATS.length); setStatOpacity(1); }, 200);
    }, 5000);
    return () => clearInterval(t);
  }, [hookVisible]);

  useEffect(() => {
    if (!hookVisible) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % SOCIAL_PROOF.length), 4000);
    return () => clearInterval(t);
  }, [hookVisible]);

  // Cycle ghost-text suggestions only when the input is empty; when the
  // student types we stop rotating so the suggestion they see is what Tab
  // will accept.
  useEffect(() => {
    if (!inputEmpty || waiting || resumeUploading || chips.length === 0) return;
    const t = setInterval(() => setGhostIdx((i: number) => (i + 1) % Math.max(1, chips.length)), 3500);
    return () => clearInterval(t);
  }, [inputEmpty, waiting, resumeUploading, chips.length]);

  // While waiting on a reply, rotate a reassuring status so the LLM pause feels
  // intentional. Skipped during resume upload (that has its own status). The
  // copy is state-aware: analysis/roadmap turns do heavier work, so say so.
  useEffect(() => {
    // Only while genuinely awaiting the first reply (last bubble is the user's).
    // appendAgentBubbles toggles `waiting` between split bubbles — don't flash
    // the status text during those short inter-bubble pauses.
    const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === "user";
    if (!waiting || resumeUploading || resumeStatusMsg || !lastIsUser) { setThinkingMsg(null); return; }
    const heavy = ["CAREER_ANALYSIS", "DNA_REVIEW", "ROADMAP", "DNA_CORRECTION"].includes(agentState);
    const msgs = heavy
      ? ["Thinking through your background...",
         "Benchmarking you against your target role...",
         "Working out where you stand...",
         "Putting the pieces together...",
         "Almost there..."]
      : ["Thinking...",
         "Taking in what you said...",
         "Working out the right next question...",
         "One sec..."];
    let i = 0;
    setThinkingMsg(msgs[0]);
    const t = setInterval(() => { i = (i + 1) % msgs.length; setThinkingMsg(msgs[i]); }, 2600);
    return () => clearInterval(t);
  }, [waiting, resumeUploading, resumeStatusMsg, agentState, messages]);

  // Reset ghost index when a new set of chips arrives.
  useEffect(() => { setGhostIdx(0); }, [chips]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  // Warn on tab/window close if logged out and chat has messages
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!session && messages.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session, messages.length]);

  // ---- sidebar refresh ----
  const refreshSidebar = useCallback(async () => {
    const sid = studentIdRef.current;
    if (!sid) return;
    try {
      const cid = conversationIdRef.current;
      const dRes = await fetch(`${CC_API}/dashboard/${sid}${cid ? `?conversation_id=${cid}` : ""}`);
      const dData = await dRes.json();
      setSidebarData(dData);
      const pid = dData?.primary_path?.path_id;
      if (pid) {
        try {
          const gRes = await fetch(`${CC_API}/gap-analysis/${sid}/${pid}`);
          if (gRes.ok) setGapData(await gRes.json());
        } catch { /* gap analysis optional */ }
      }
      sidebarLoadedRef.current = true;
    } catch (e) {
      console.warn("sidebar refresh failed", e);
    }
  }, []);

  // load fresh tasks whenever the dashboard panel is shown
  useEffect(() => {
    const sid = studentIdRef.current;
    if (!sidebarOpen || panel !== "dashboard" || !sid) return;
    (async () => {
      try {
        const tr = await fetch(`${CC_API}/api/student/${sid}/progress-tasks`);
        if (tr.ok) setTasks(await tr.json());
      } catch { /* tasks optional */ }
    })();
  }, [sidebarOpen, panel, sidebarData]);

  // Load the LIST of past chat threads when the history panel is opened.
  // Each is shown as a button the student can click to resume that conversation.
  const loadConversationList = useCallback(async () => {
    const sid = studentIdRef.current;
    if (!sid) return;
    setHistoryLoading(true);
    try {
      const r = await fetch(`${CC_API}/session/${sid}/conversations`);
      if (r.ok) {
        const data = await r.json();
        setConversations(data.conversations || []);
      }
    } catch { /* history optional */ }
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (!sidebarOpen || panel !== "history") return;
    loadConversationList();
  }, [sidebarOpen, panel, loadConversationList]);

  // Load a specific conversation thread into the chat and make it active.
  async function loadConversation(convId: string) {
    const sid = studentIdRef.current;
    if (!sid || !convId) return;
    if (convId === conversationIdRef.current) {
      // Already viewing this thread — just close the panel
      setSidebarOpen(false);
      return;
    }
    setWaiting(true);
    try {
      const r = await fetch(`${CC_API}/session/${sid}/conversation/${convId}/history`);
      const data = await r.json();
      const hist: Msg[] = [];
      for (const m of (data.history || [])) {
        const role = m.role === "assistant" ? "agent" : m.role;
        const chunks = role === "agent"
          ? String(m.content || "").split(/\n\s*\n/).map((s: string) => s.trim()).filter(Boolean)
          : [m.content];
        (chunks.length ? chunks : [""]).forEach((c: string) =>
          hist.push({ role, content: c, state: m.state, time: now12h() }));
      }
      conversationIdRef.current = convId;
      setMessages(hist);
      if (data.last_state) setAgentState(data.last_state);
      setHeaderHidden(true);
      setReturning(false);
      analysisAnnouncedRef.current = true; // don't re-announce DNA on a loaded thread
      setSidebarOpen(false);
      refreshSidebar();
    } catch { /* ignore */ }
    setWaiting(false);
  }

  // Start a brand-new chat thread.
  async function startNewConversation() {
    const sid = studentIdRef.current;
    if (!sid) return;
    setWaiting(true);
    try {
      const r = await fetch(`${CC_API}/session/${sid}/new-conversation`, { method: "POST" });
      const data = await r.json();
      conversationIdRef.current = data.conversation_id;
      setMessages([]);
      setAgentState("GREETING");
      setReturning(false);
      setHeaderHidden(true);
      analysisAnnouncedRef.current = false;
      setSidebarOpen(false);
      setWaiting(false);
      if (data.greeting) showGreeting(data.greeting);
      // Refresh the thread list so the previous chat (and this new one) show up
      loadConversationList();
    } catch {
      setWaiting(false);
    }
  }

  function toggleSidebar(forceOpen?: boolean) {
    const willOpen = forceOpen === true ? true : !sidebarOpen;
    setSidebarOpen(willOpen);
    if (willOpen) {
      setReadyPopVisible(false);
      setPulseShowPanel(false);
      if (!sidebarLoadedRef.current) refreshSidebar();
    }
  }
  function openSidebarTo(p: CtaKind) {
    setPanel(p);
    toggleSidebar(true);
  }

  // During PROFILING, keep the live Career Analysis in front of the student.
  // Refresh its data each turn; auto-open it to "analysis" if it's closed —
  // up to 5 times total — then stop forcing it and pulse the Show-panel button.
  function maybeAutoOpenAnalysis(state: string) {
    if (state !== "PROFILING") return;
    refreshSidebar();
    if (sidebarOpenRef.current) {
      // It's open — make sure it's showing the analysis panel.
      if (panel !== "analysis") setPanel("analysis");
      return;
    }
    if (profileAutoOpenCountRef.current < 5) {
      profileAutoOpenCountRef.current += 1;
      setPanel("analysis");
      toggleSidebar(true);
    } else {
      // Stop forcing — nudge them with a pulsing button instead.
      setPulseShowPanel(true);
    }
  }

  // Discount-code path: take the student to their dashboard to log progress,
  // then open the Resume Maker so they can add their new skills.
  function goToDashboardThenResume() {
    openSidebarTo("dashboard");
    window.open("https://studojo.com/resume-maker", "_blank", "noopener,noreferrer");
  }

  // ---- session init ----
  // Wait until the auth check has resolved AND the student is logged in before
  // starting a coach session — login is required to use the tool.
  useEffect(() => {
    if (initDone.current) return;
    if (sessionPending || !session) return;
    initDone.current = true;

    // Skip the hook overlay — go straight to chat.
    hookDismissedRef.current = true;
    const existingId = localStorage.getItem(STORAGE_KEY);

    (async () => {
      try {
        const authEmail = session?.user?.email;
        const body: Record<string, string> = existingId ? { student_id: existingId } : {};
        if (authEmail) body.email = authEmail;
        const res = await fetch(`${CC_API}/session/start`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const sd = await res.json();
        studentIdRef.current = sd.student_id;
        conversationIdRef.current = sd.conversation_id;
        localStorage.setItem(STORAGE_KEY, sd.student_id);

        // "Get my Career DNA" CTAs pass ?new=1 — start a FRESH chat thread
        // instead of resuming history. The prior conversation stays in history.
        const wantsNew = new URLSearchParams(window.location.search).get("new") === "1";
        if (wantsNew) {
          try {
            const nc = await fetch(`${CC_API}/session/${sd.student_id}/new-conversation`, { method: "POST" });
            const ncd = await nc.json();
            if (ncd?.conversation_id) {
              conversationIdRef.current = ncd.conversation_id;
              setReturning(false);
              setMessages([]);
              setAgentState("GREETING");
              // Clean the URL so a refresh doesn't keep spawning new threads.
              window.history.replaceState({}, "", "/cc/chat");
              if (ncd.greeting) { pendingGreetingRef.current = ncd.greeting; showGreeting(ncd.greeting); }
              else {
                const gRes = await fetch(`${CC_API}/chat/greeting?student_id=${sd.student_id}&conversation_id=${ncd.conversation_id}`);
                pendingGreetingRef.current = await gRes.json();
                showGreeting(pendingGreetingRef.current);
              }
              refreshSidebar();
              return;
            }
          } catch (e) {
            console.warn("new-chat init failed, falling back to normal session", e);
          }
        }

        if (sd.returning && sd.history?.length > 0) {
          // Hook stays visible — student dismisses it themselves. We just
          // load the history in the background so it is ready when they enter.
          setHeaderHidden(true);
          setReturning(true);
          const hist: Msg[] = [];
          for (const m of sd.history) {
            const role = m.role === "assistant" ? "agent" : m.role;
            const chunks = role === "agent"
              ? String(m.content || "").split(/\n\s*\n/).map((s: string) => s.trim()).filter(Boolean)
              : [m.content];
            (chunks.length ? chunks : [""]).forEach((c: string) =>
              hist.push({ role, content: c, state: m.state, time: now12h() }));
          }
          setMessages(hist);
          const lastState = [...sd.history].reverse().find((m: any) => m.state)?.state;
          if (lastState) setAgentState(lastState);
          // Restore progress bar if this is still a PROFILING session (persisted
          // across network drops / page reloads via sessionStorage).
          if (!lastState || lastState === "PROFILING" || lastState === "GREETING") {
            try {
              const saved = sessionStorage.getItem("cc_profile_progress");
              if (saved) setProfileProgress(JSON.parse(saved));
            } catch { /* ignore */ }
          }
          refreshSidebar();
          return;
        }

        const gRes = await fetch(`${CC_API}/chat/greeting?student_id=${sd.student_id}&conversation_id=${sd.conversation_id}`);
        pendingGreetingRef.current = await gRes.json();
        if (hookDismissedRef.current) showGreeting(pendingGreetingRef.current);

        // Entry seed: arrived from another Studojo tool (e.g. AI Risk Dojo).
        // Pre-fill the first message with the role they just analysed so the
        // coach starts on-topic. The student still presses send (stays in control).
        try {
          const sp = new URLSearchParams(window.location.search);
          const seedRole = sp.get("seed_role");
          const src = sp.get("src");
          if (seedRole && inputRef.current && !inputRef.current.value) {
            const risk = sp.get("risk");
            inputRef.current.value =
              src === "ai-risk"
                ? `I just checked and my target role "${seedRole}" is ${risk ?? "highly"}% at risk from AI. Help me build a future-proof plan.`
                : `I want to work towards becoming a ${seedRole}.`;
            inputRef.current.style.height = "auto";
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + "px";
            setInputEmpty(false);
            inputRef.current.focus();
            // Fire acquisition analytics (best-effort).
            if (src) {
              fetch(`${CC_API}/admin/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event_type: src === "ai-risk" ? "acq_from_ai_risk" : "acq_from_tool",
                  student_id: sd.student_id,
                  event_data: { src, seed_role: seedRole, risk: sp.get("risk") },
                }),
              }).catch(() => {});
            }
          }
        } catch {}
      } catch {
        pendingGreetingRef.current = { reply: "Hey, what are you working through? Job search stuff, or something else?" };
        if (hookDismissedRef.current) showGreeting(pendingGreetingRef.current);
      }
    })();
  }, [refreshSidebar, sessionPending, session]);

  function splitBubbles(text: string): string[] {
    const parts = String(text || "").split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    return parts.length ? parts : [""];
  }

  async function appendAgentBubbles(text: string, cta?: CtaKind, lastState?: string) {
    const parts = splitBubbles(text);
    for (let i = 0; i < parts.length; i++) {
      const isLast = i === parts.length - 1;
      setMessages(prev => [...prev, {
        role: "agent", content: parts[i], state: lastState, time: now12h(),
        cta: isLast ? cta : undefined,
      }]);
      if (!isLast) {
        setWaiting(true);
        await new Promise(r => setTimeout(r, Math.min(900, 350 + parts[i].length * 12)));
        setWaiting(false);
      }
    }
  }

  // Pull the profiling progress out of an orchestration payload and into state.
  // Only relevant during GREETING/PROFILING; cleared once the DNA exists.
  // Persisted to sessionStorage so network blips / reconnects don't wipe the bar.
  function applyProgress(o: any, state: string) {
    if (!o) return;
    if (state === "GREETING" || state === "PROFILING") {
      const p = {
        pct: Math.max(0, Math.min(100, Math.round(o.profile_completion ?? 0))),
        areas: o.profile_areas || {},
        dnaReady: !!o.dna_ready,
        canSkip: !!o.enable_skip_profiling,
      };
      setProfileProgress(p);
      sessionStorage.setItem("cc_profile_progress", JSON.stringify(p));
    } else {
      setProfileProgress(null);
      sessionStorage.removeItem("cc_profile_progress");
    }
  }

  // Restart the idle re-engagement timer. Fires once if the student goes quiet
  // mid-profiling with an empty input. Any keystroke/submit clears it.
  function armIdleTimer() {
    setIdleHint(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (agentState === "PROFILING" && (inputRef.current?.value ?? "") === "") {
        setIdleHint(true);
      }
    }, 25000);
  }

  function showGreeting(gd: any) {
    setWaiting(true);
    setTimeout(async () => {
      setWaiting(false);
      const state = gd.orchestration?.current_state || "GREETING";
      setAgentState(state);
      applyProgress(gd.orchestration, state);
      if (Array.isArray(gd.suggestion_chips) && gd.suggestion_chips.length) {
        setChips(gd.suggestion_chips.slice(0, 3));
      }
      await appendAgentBubbles(gd.reply || gd.message || "Hey, what's going on? What are you trying to figure out?", undefined, state);
      armIdleTimer();
    }, 500);
  }

  function dismissHook(level: string) {
    if (hookDismissedRef.current) return;
    hookDismissedRef.current = true;
    localStorage.setItem("studojo_commitment", level);
    setHookDismissing(true);
    setTimeout(() => setHookVisible(false), 450);
    if (pendingGreetingRef.current) showGreeting(pendingGreetingRef.current);
  }

  function ctaForState(state: string, o: any): CtaKind | undefined {
    if (state === "ROADMAP") return "roadmap";
    if (state === "ONGOING_SUPPORT" || o?.show_dashboard) return "dashboard";
    return undefined;
  }

  function showOutreachNote(toolRec: string | null) {
    if (!toolRec || !toolRec.startsWith("outreach_dojo")) return;
    if (toolRec === "outreach_dojo_not_ready" || toolRec === "resume_maker") return;
    sessionStorage.setItem("outreach_note_shown", "1");
    const jbPct = sidebarData?.primary_path?.job_board_reply_pct ?? 2;
    const orPct = sidebarData?.primary_path?.outreach_reply_pct ?? 10;
    setOutreachNote({ toolRec, jbPct, orPct });
  }

  async function sendMsg(overrideText?: string) {
    const content = (overrideText ?? inputRef.current?.value ?? "").trim();
    const sid = studentIdRef.current;
    if (!sid) return;
    // Any send clears the idle re-engagement hint/timer.
    setIdleHint(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // Allow sending when text is empty if a resume is staged: that's how the
    // student commits the upload without typing anything.
    if (!content && !pendingResume) return;
    if (waiting) return;
    if (inputRef.current) { inputRef.current.value = ""; inputRef.current.style.height = "auto"; }
    setHeaderHidden(true);

    // Capture filename before clearing so the display bubble can reference it
    const resumeFileName = pendingResume?.name ?? null;
    const resumeFile = pendingResume ?? null;
    if (pendingResume) setPendingResume(null);

    if (!content && !resumeFile) return;

    // Show the user bubble immediately — never block on upload before rendering
    const displayContent = resumeFileName
      ? `📎 ${resumeFileName}${content ? `\n\n${content}` : ""}`
      : content;

    setMessages((prev: Msg[]) => [...prev, { role: "user", content: displayContent, time: now12h() }]);
    setWaiting(true);

    // If a resume is staged, upload it now (after bubble is shown).
    // The chat API call waits for the upload so the backend has the parsed
    // profile before it generates the reply.
    let resumeWasParsed = false;
    if (resumeFile) {
      setResumeUploading(true);
      const resumeMsgs = [
        "Analysing resume...",
        "Reading your experience...",
        "Extracting skills...",
        "Building your profile...",
        "Almost done...",
      ];
      let msgIdx = 0;
      setResumeStatusMsg(resumeMsgs[0]);
      const msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % resumeMsgs.length;
        setResumeStatusMsg(resumeMsgs[msgIdx]);
      }, 1800);
      let uploadReason: string | null = null;   // user-facing reason if it didn't parse
      const uploadOnce = () => {
        const fd = new FormData();
        fd.append("file", resumeFile);
        return fetch(`${CC_API}/api/student/${sid}/resume/upload`, { method: "POST", body: fd });
      };
      try {
        let upRes = await uploadOnce();
        // Retry once on a transient (5xx / network) — but NOT on a 4xx, which is
        // a real "this file can't be read" answer we should show the student.
        if (!upRes.ok && upRes.status >= 500) {
          await new Promise(r => setTimeout(r, 1500));
          upRes = await uploadOnce();
        }
        if (upRes.ok) {
          const upData = await upRes.json().catch(() => ({}));
          resumeWasParsed = Array.isArray(upData?.fields_extracted) && upData.fields_extracted.length > 0;
        } else if (upRes.status >= 400 && upRes.status < 500) {
          // e.g. scanned image / not a resume — surface the backend's message.
          const errData = await upRes.json().catch(() => ({}));
          uploadReason = errData?.detail || "I couldn't read that file. You can keep answering in the chat instead.";
        }
      } catch {
        uploadReason = "The upload didn't go through. You can try again, or just answer in the chat.";
      }
      clearInterval(msgInterval);
      setResumeStatusMsg(null);
      setResumeUploading(false);
      // If the file couldn't be parsed, tell the student plainly and stop here —
      // don't send a misleading "I uploaded my resume" turn the agent can't honour.
      if (uploadReason && !content) {
        setWaiting(false);
        setMessages(prev => [...prev, { role: "agent", content: uploadReason as string, time: now12h() }]);
        return;
      }
      // Give the backend a moment to finish committing the parsed profile
      // before the chat request reads it, to avoid a read/write race.
      if (resumeWasParsed) await new Promise(r => setTimeout(r, 400));
    }

    // If no text was typed but a resume was uploaded, send a trigger message so
    // the agent acknowledges the resume rather than silently dropping the turn.
    const messageToSend = content || (resumeFileName ? "I just uploaded my resume." : "");
    if (!messageToSend) { setWaiting(false); return; }

    const t0 = Date.now();
    try {
      const body: Record<string, string> = { student_id: sid, message: messageToSend };
      if (conversationIdRef.current) body.conversation_id = conversationIdRef.current;
      const outreachShown = sessionStorage.getItem("outreach_conv_shown") === "1" ? "1" : "0";

      // Send the chat with resilient retries. Transient failures (a pod
      // restart during a deploy, a brief DB hiccup, or the backend still
      // committing a freshly-parsed resume) resolve within a few seconds, so we
      // retry the SAME conversation with backoff before ever giving up — the
      // student should never hit a dead end for a passing blip.
      const postChat = () => fetch(`${CC_API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Outreach-Shown": outreachShown },
        body: JSON.stringify(body),
      });
      const isFail = (d: any, r: Response) =>
        !r.ok || (d?.reply === "i'm having a small technical issue, give me a moment and try again" && !d?.message_id);

      let res = await postChat();
      let data = res.ok ? await res.json().catch(() => null) : null;
      // More patience after a resume upload (DNA/profile commit can take longer).
      const backoffs = resumeWasParsed ? [1500, 2500, 4000] : [1200, 2500];
      for (let i = 0; i < backoffs.length && isFail(data, res); i++) {
        await new Promise(r => setTimeout(r, backoffs[i]));
        res = await postChat();
        data = res.ok ? await res.json().catch(() => null) : null;
      }
      if (!res.ok || !data) throw new Error("HTTP " + res.status);
      // If still a technical error with no message_id, the session is stale —
      // fall through to the catch for full session recovery.
      if (data.reply === "i'm having a small technical issue, give me a moment and try again" && !data.message_id) {
        throw new Error("stale session detected");
      }
      await new Promise(r => setTimeout(r, Math.max(0, 600 - (Date.now() - t0))));
      setWaiting(false);
      const o = data.orchestration || {};
      const state = o.current_state || agentState;
      setAgentState(state);
      applyProgress(o, state);
      maybeAutoOpenAnalysis(state);
      if (data.conversation_id) conversationIdRef.current = data.conversation_id;
      if (Array.isArray(data.suggestion_chips) && data.suggestion_chips.length) {
        setChips(data.suggestion_chips.slice(0, 3));
      }
      // Track outreach upsell shown so backend won't repeat it this session
      if (typeof data.tool_recommendation === "string" && data.tool_recommendation.startsWith("outreach_dojo")) {
        sessionStorage.setItem("outreach_conv_shown", "1");
      }
      const cta = ctaForState(state, o);
      await appendAgentBubbles(data.reply, cta, state);
      armIdleTimer();
      if (data.dna_refreshing) {
        setDnaRefreshing(true);
        openSidebarTo("analysis");
        refreshSidebar().then(() => setDnaRefreshing(false));
      }
      if (["DNA_REVIEW", "ROADMAP", "ONGOING_SUPPORT", "DNA_CORRECTION"].includes(state)) {
        // Fire the DNA_REVIEW notification immediately — before awaiting the sidebar fetch.
        if (state === "DNA_REVIEW" && !analysisAnnouncedRef.current) {
          analysisAnnouncedRef.current = true;
          if (sidebarOpenRef.current) openSidebarTo("analysis");
          else setReadyPopVisible(true);
        }
        await refreshSidebar();
        if (state === "ROADMAP" && sidebarOpenRef.current) {
          openSidebarTo("roadmap");
        }
        // Show outreach sticky note once per session after DNA_REVIEW or ROADMAP
        if (["DNA_REVIEW", "ROADMAP"].includes(state) && !sessionStorage.getItem("outreach_note_shown")) {
          showOutreachNote(data.tool_recommendation);
        }
      }
    } catch {
      // Full session recovery: the session looked stale, so start fresh and
      // replay the message (with one backoff retry) on the new session.
      try {
        localStorage.removeItem(STORAGE_KEY);
        const authEmail = session?.user?.email;
        const body2: Record<string, string> = {};
        if (authEmail) body2.email = authEmail;
        const rs = await fetch(`${CC_API}/session/start`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body2),
        });
        if (!rs.ok) throw new Error("session restart failed");
        const sd = await rs.json();
        if (!sd?.student_id) throw new Error("no student_id");
        studentIdRef.current = sd.student_id;
        conversationIdRef.current = sd.conversation_id;
        localStorage.setItem(STORAGE_KEY, sd.student_id);

        const outreachShown2 = sessionStorage.getItem("outreach_conv_shown") === "1" ? "1" : "0";
        const postRetry = () => fetch(`${CC_API}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Outreach-Shown": outreachShown2 },
          body: JSON.stringify({ student_id: sd.student_id, message: messageToSend, conversation_id: sd.conversation_id }),
        });
        let res2 = await postRetry();
        let data2 = res2.ok ? await res2.json().catch(() => null) : null;
        if (!res2.ok || !data2) {
          await new Promise(r => setTimeout(r, 2000));
          res2 = await postRetry();
          data2 = res2.ok ? await res2.json().catch(() => null) : null;
        }
        if (!res2.ok || !data2) throw new Error("retry failed");
        setWaiting(false);
        const o2 = data2.orchestration || {};
        const state2 = o2.current_state || agentState;
        setAgentState(state2);
        applyProgress(o2, state2);
        if (data2.conversation_id) conversationIdRef.current = data2.conversation_id;
        if (Array.isArray(data2.suggestion_chips) && data2.suggestion_chips.length) setChips(data2.suggestion_chips.slice(0, 3));
        await appendAgentBubbles(data2.reply, ctaForState(state2, o2), state2);
      } catch {
        // Genuine, persistent failure. Never strand the student: restore the
        // text they typed so they don't lose it, and tell them to tap send.
        setWaiting(false);
        if (inputRef.current && messageToSend && messageToSend !== "I just uploaded my resume.") {
          inputRef.current.value = messageToSend;
          inputRef.current.style.height = "auto";
          inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + "px";
          setInputEmpty(false);
        }
        setMessages(prev => [...prev, {
          role: "agent",
          content: "I couldn't get that through just now — give it a couple of seconds and tap send again. Your message is still in the box.",
          time: now12h(),
        }]);
      }
    }
  }

  // Stage a picked file as a chip above the input. The student can type
  // alongside it, or remove the file before sending. Actual upload happens
  // when they hit Send (inside sendMsg).
  function stageResume(file: File) {
    if (!file) return;
    setPendingResume(file);
  }

  async function submitCheckIn(kind: string, items: Array<{ label: string; type: string; key: string }>) {
    const sid = studentIdRef.current;
    if (!sid) return;
    const payload = items.map(it => ({
      label: it.label, type: it.type, status: taskBoxes[it.key] ? "done" : "skipped",
    }));
    if (!payload.some(p => p.status === "done")) { toast("Tick at least one thing you did"); return; }
    setCheckInSaving(true);
    try {
      const r = await fetch(`${CC_API}/api/student/${sid}/check-in`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, items: payload }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error("check-in failed");
      // Level up shows a bigger toast; normal check-ins are quieter.
      if (data?.levelup?.leveled_up) {
        toast(`Level ${data.levelup.to_level} reached, the bar just got harder.`);
      } else {
        toast("Progress logged. Nice work.");
      }
      // The agent reacts in chat with the outreach impact line or levelup message.
      if (data.outreach_message) {
        setMessages(prev => [...prev, { role: "agent", content: data.outreach_message, time: now12h() }]);
      }
      // After a weekly check-in, surface the skills-unlocked banner if any skill-type
      // items were completed so the student can push them to their resume.
      if (kind === "weekly" && Array.isArray(data.new_skills) && data.new_skills.length > 0) {
        setSkillsUnlocked({ skills: data.new_skills, hasResume: !!data.has_resume });
      }
      setTaskBoxes({});
      await refreshSidebar();
    } catch {
      toast("Could not save your check-in");
    }
    setCheckInSaving(false);
  }

  // ===== render helpers =====
  const pp = sidebarData?.primary_path;
  const dnaReady = !!(pp && pp.dna_id);

  // "X% better than people in your industry" — primary source is the new
  // industry_percentile_score column. Falls back to the benchmark's stored
  // percentile, then to the legacy readiness number (multiplied) so old
  // DNAs still render something.
  function industryPct(): number {
    const primary = pp?.industry_percentile_score;
    if (typeof primary === "number" && primary > 0) return Math.min(99, Math.round(primary));
    const b = pp?.benchmark || {};
    const fromDna = b.industry_percentile ?? pp?.industry_percentile;
    if (typeof fromDna === "number" && fromDna > 0) return Math.min(99, Math.round(fromDna));
    const r = pp?.readiness_score || 0;
    return Math.min(95, Math.max(5, Math.round(r * 0.9)));
  }
  // Level info — what bar the student is currently working toward.
  function currentLevel(): { num: number; name: string } {
    const n = (pp?.level as number) || 1;
    const name = n === 1 ? "Industry-Ready" : n === 2 ? "Well-Rounded" : "Standout";
    return { num: n, name };
  }

  // Pre-DNA panel: shows what the coach has picked up from the chat so far,
  // populated from /dashboard's detected_so_far snapshot. Renders message-by-
  // message as the student fills in their profile.
  function renderDetectedSoFar(expanded: boolean) {
    const d = sidebarData?.detected_so_far || {};
    const educationFields = ([d.degree && d.stream ? `${d.degree} in ${d.stream}`
      : d.degree, d.institution, d.graduation_year && `Graduating ${d.graduation_year}`])
      .filter(Boolean) as string[];
    const direction: string[] = [];
    if (d.target_role) direction.push(d.target_role);
    if (d.target_industry) direction.push(d.target_industry);
    if (d.target_geography) direction.push(d.target_geography);
    if (d.job_type) direction.push(d.job_type);
    const motivators: string[] = Array.isArray(d.motivators) ? d.motivators : [];
    const skills: string[] = Array.isArray(d.skills_confirmed) ? d.skills_confirmed : [];
    const tools: string[] = Array.isArray(d.tools_and_tech) ? d.tools_and_tech : [];
    const directionPct = typeof d.direction_confidence_pct === "number" ? d.direction_confidence_pct : 0;
    // Skeleton + live-fill: always render the full Career Analysis layout. Each
    // tile shows its real value once detected, or a greyed "skeleton" placeholder
    // while the coach is still learning it — so the student sees the SHAPE of what
    // they're building and watches it fill in as they answer.
    const wrapClass = expanded ? "xp ds-wrap" : "ds-wrap";
    const Tile = ({ label, body, wide, hint, chips, chipClass }: {
      label: string; body?: string | null; wide?: boolean; hint?: string;
      chips?: string[]; chipClass?: string;
    }) => {
      const filled = (body && body.length > 0) || (chips && chips.length > 0);
      return (
        <div className={`ds-tile${wide ? " ds-tile-wide" : ""}${filled ? "" : " ds-tile-skel"}`}>
          <div className="ds-tile-label">{label}</div>
          {filled ? (
            chips ? (
              <div className="ds-tile-chips">
                {chips.slice(0, 12).map((c, i) => <span key={i} className={`ds-chip ${chipClass || ""}`}>{c}</span>)}
              </div>
            ) : (
              <div className="ds-tile-body">{body}</div>
            )
          ) : (
            <div className="ds-skel-lines">
              <span className="ds-skel-line" />
              <span className="ds-skel-line short" />
              <span className="ds-skel-hint">{hint}</span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className={wrapClass}>
        <div className="ds-header">
          <div className="ds-eyebrow">Career Analysis · building live</div>
          <div className="ds-title">This fills in as you answer</div>
          <div className="ds-sub">Every answer sharpens it. Your full Career DNA unlocks once there's enough signal.</div>
          <div className="ds-conf-row">
            <div className="ds-conf-track"><div className="ds-conf-fill" style={{ width: `${directionPct}%` }} /></div>
            <div className="ds-conf-pct">{directionPct}%</div>
          </div>
          <div className="ds-conf-label">Direction confidence</div>
        </div>

        <div className="ds-grid">
          <Tile label="Background" body={educationFields.join(" · ")} hint="Your degree & college" />
          <Tile label="Direction" body={direction.join(" · ")} hint="Target role & industry" />
          <Tile label="Read of you" body={d.archetype ? String(d.archetype).replace(/_/g, " ") : null} hint="How the coach reads you" />
          <Tile label="Confidence" body={d.confidence_level ? String(d.confidence_level) : null} hint="Where your head's at" />
          <Tile label="What's driving you" wide chips={motivators} chipClass="ds-chip-glow" hint="Your motivators" />
          <Tile label="Skills detected" wide chips={skills} chipClass="ds-chip-have" hint="Skills you mention" />
          <Tile label="Tools & tech" wide chips={tools} hint="Tools you use" />
        </div>

        <div className="ds-footer">
          <span className="ds-pulse" />
          {d.has_resume ? "Resume parsed. Career DNA generates after a few more exchanges." : "Career DNA generates after a few more exchanges — or upload your resume to fast-track it."}
        </div>
      </div>
    );
  }

  function renderAnalysis(expanded: boolean) {
    // Fresh "explore a new direction" chat — old analysis is intentionally not
    // carried over. Show a clean prompt instead of the previous path's DNA.
    if (sidebarData?.fresh_explore) {
      return (
        <div className="scard" style={{ textAlign: "center", padding: "32px 20px" }}>
          <div className="scard-title" style={{ marginBottom: 8 }}>Fresh start</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {sidebarData.message || "Tell the coach the new direction you want to explore and a fresh Career Analysis will build here."}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14 }}>
            Your previous analysis is safe — switch back anytime from Chat History.
          </div>
        </div>
      );
    }
    if (!dnaReady) {
      // Live-building Career Analysis: a skeleton that fills in with what the
      // coach has detected so far as the student answers.
      return renderDetectedSoFar(expanded);
    }
    const b = pp.benchmark || {};
    const have: string[] = pp.skills_you_have || [];
    const sg = (gapData?.skills_gap) || [];
    const pct = industryPct();

    if (expanded) {
      // Full-page Career Analysis: hero header + benchmark comparison grid.
      return (
        <div className="xp">
          <div className="xp-hero">
            <div className="xp-hero-label">Career DNA</div>
            <h1 className="xp-hero-role">{pp.target_role || "Your target role"}</h1>
            <div className="xp-hero-meta">{pp.target_industry || ""}{pp.target_geography ? "  ·  " + pp.target_geography : ""}</div>
            <div className="xp-hero-score">
              <div className="xp-ring"><span>{pct}%</span></div>
              <div className="xp-hero-score-text">
                <div className="xp-hs-num">You are better than {pct}% of people in your industry</div>
                <div className="xp-hs-sub">Replicate what the top performers do below and that number climbs.</div>
              </div>
            </div>
          </div>

          <div className="xp-grid2">
            <div className="xp-card">
              <div className="xp-card-title">What you bring</div>
              {have.length ? have.map((s, i) => <span key={i} className="pill have">{s}</span>)
                : <div className="xp-muted">No confirmed skills yet, keep talking to the coach.</div>}
            </div>
            <div className="xp-card">
              <div className="xp-card-title">What top performers bring</div>
              {(b.top_performer_skills || []).length
                ? b.top_performer_skills.map((s: string, i: number) => <span key={i} className="pill top">{s}</span>)
                : <div className="xp-muted">Loading benchmark data...</div>}
            </div>
          </div>

          {b.your_standing && (
            <div className="xp-callout">
              <div className="xp-callout-label">Where you stand</div>
              <div className="xp-callout-body">{b.your_standing}</div>
            </div>
          )}

          {(b.gap_to_top || []).length > 0 && (
            <div className="xp-card">
              <div className="xp-card-title">How you close the gap to the top</div>
              {b.gap_to_top.map((g: any, i: number) => (
                <div key={i} className="xp-gap">
                  <div className="xp-gap-skill">{g.skill || ""}</div>
                  <div className="xp-gap-how">{g.how_to_close || ""}</div>
                </div>
              ))}
            </div>
          )}

          {sg.length > 0 && (
            <div className="xp-card">
              <div className="xp-card-title">Skill gaps for this role</div>
              <div className="xp-muted" style={{ marginBottom: 10 }}>Tap any gap to see how to close it.</div>
              {sg.map((g: any, i: number) => {
                const prio = (g.priority || "medium").toLowerCase();
                const isOpen = openGap === i;
                return (
                  <div key={i} className={`xp-gap gap-clickable${isOpen ? " open" : ""}`}
                    onClick={() => setOpenGap(isOpen ? null : i)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span className="xp-gap-skill">{g.skill || ""}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`gi-prio ${prio}`}>{prio}</span>
                        <span className="gap-chevron">{isOpen ? "▾" : "▸"}</span>
                      </span>
                    </div>
                    {isOpen && (
                      <div className="xp-gap-how" style={{ marginTop: 8 }}>{g.how_to_build || ""}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="xp-actions">
            <button className="btn-primary" onClick={() => setPanel("roadmap")}>See your roadmap →</button>
            <button className="btn-ghost" onClick={() => { setSidebarExpanded(false); sendMsg("This does not look like me, the reading is not quite right."); }}>
              This doesn't look like me
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="scard">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="scard-title">Your Career DNA</div>
            {dnaRefreshing && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>Currently refreshing</div>}
          </div>
          <h3>{pp.target_role || "Your target role"}</h3>
          <div className="sub">{pp.target_industry || ""}{pp.target_geography ? " · " + pp.target_geography : ""}</div>
          <div style={{ marginTop: 10, fontSize: "0.86rem", fontWeight: 700, lineHeight: 1.5 }}>
            You are better than {pct}% of people in your industry.
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 3 }}>
            Replicate the top performer skills below to push that higher.
          </div>
        </div>
        {have.length > 0 && (
          <div className="scard">
            <div className="scard-title">Skills you have</div>
            {have.map((s, i) => <span key={i} className="pill have">{s}</span>)}
          </div>
        )}
        {(b.top_performer_skills || []).length > 0 && (
          <div className="scard">
            <div className="scard-title">Top performers in this industry have</div>
            {b.top_performer_skills.map((s: string, i: number) => <span key={i} className="pill top">{s}</span>)}
            {b.your_standing && (
              <div style={{ marginTop: 12, fontSize: "0.83rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Where you stand:</strong> {b.your_standing}
              </div>
            )}
          </div>
        )}
        {(b.gap_to_top || []).length > 0 && (
          <div className="scard">
            <div className="scard-title">How you close the gap</div>
            {b.gap_to_top.map((g: any, i: number) => (
              <div key={i} className="gap-item">
                <div className="gi-skill">{g.skill || ""}</div>
                <div className="gi-how">{g.how_to_close || ""}</div>
              </div>
            ))}
          </div>
        )}
        {sg.length > 0 && (
          <div className="scard">
            <div className="scard-title">Skill gaps for this role</div>
            {sg.map((g: any, i: number) => {
              const prio = (g.priority || "medium").toLowerCase();
              return (
                <div key={i} className="gap-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span className="gi-skill">{g.skill || ""}</span>
                    <span className={`gi-prio ${prio}`}>{prio}</span>
                  </div>
                  <div className="gi-how">{g.how_to_build || ""}</div>
                </div>
              );
            })}
          </div>
        )}
        <button className="btn-primary" style={{ marginBottom: 10 }} onClick={() => setPanel("roadmap")}>See your roadmap →</button>
        <button className="btn-ghost" onClick={() => sendMsg("This does not look like me, the reading is not quite right.")}>
          This doesn't look like me
        </button>
      </>
    );
  }

  // Tool label for a roadmap step. Only show a known, sensible tool name;
  // an unrecognised value like a raw "outreach" string is dropped.
  function toolLabel(linked: any): string | null {
    if (!linked || typeof linked !== "string") return null;
    const map: Record<string, string> = {
      resume_maker: "Resume Maker",
      outreach_dojo: "Outreach Dojo",
      internship_dojo: "Internship Dojo",
      reports: "Reports",
    };
    return map[linked] || null;
  }

  // Break a how-to string into bullet steps for the detailed hover.
  function howSteps(how: string): string[] {
    if (!how) return [];
    return String(how)
      .split(/(?:\n|(?<=[.;])\s+(?=[A-Z]))/)
      .map(s => s.trim().replace(/^[-•*]\s*/, ""))
      .filter(s => s.length > 3);
  }

  function renderRoadmap(expanded: boolean) {
    const actions = (pp?.priority_actions) || [];
    if (!dnaReady || !actions.length) {
      return (
        <div className="skel-wrap">
          <div className="skel-card">
            <div className="skel-line short" style={{ marginBottom: 8 }} />
            <div className="skel-line heading" />
            <div className="skel-line medium" style={{ marginBottom: 0 }} />
            <div className="skel-building" style={{ marginTop: 10 }}><span className="skel-pulse" />Your Roadmap builds as the coach learns your situation...</div>
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skel-card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(90deg,var(--bg-secondary) 25%,var(--border) 50%,var(--bg-secondary) 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite linear" }} />
              <div style={{ flex: 1 }}>
                <div className="skel-line medium" style={{ marginBottom: 8 }} />
                <div className="skel-line full" style={{ marginBottom: 6 }} />
                <div className="skel-line short" style={{ marginBottom: 0 }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    const intentLine = "Remember, what sets you apart is not intent. Plenty of students want to work. The ones who get hired pair that intent with action, and action beats intent alone by miles.";

    if (expanded) {
      // Full-page roadmap: vertical timeline. Each step header is visible;
      // hovering a step reveals the detailed, bulleted how-to-do-it.
      return (
        <div className="xp">
          <div className="xp-hero">
            <div className="xp-hero-label">Your Roadmap</div>
            <h1 className="xp-hero-role">The path to {pp.target_role || "your goal"}</h1>
            <div className="xp-hero-meta">{actions.length} moves, ordered by impact. Tap any step for exactly how to do it.</div>
          </div>
          <div className="xp-intent">{intentLine}</div>
          <div className="xp-timeline">
            {actions.map((a: any, i: number) => {
              const actionFull = a.action || a.skill || (typeof a === "string" ? a : "");
              // Show only first sentence as title; rest goes into the expanded section
              const firstDot = actionFull.search(/[.!?]\s/);
              const actionTitle = firstDot > 0 ? actionFull.slice(0, firstDot + 1) : actionFull;
              const actionDetail = firstDot > 0 ? actionFull.slice(firstDot + 2).trim() : "";
              const why = a.why_it_matters || "";
              const how = a.how_to_close || a.how_to_build || "";
              const steps = howSteps(how);
              const tool = toolLabel(a.linked_tool);
              const execResource = a.execution_resource || "";
              const prio = (a.priority || "").toString().toLowerCase();
              const isOpen = openStep === i;
              return (
                <div key={i} className="xp-tl-step">
                  <div className="xp-tl-rail">
                    <div className="xp-tl-num">{i + 1}</div>
                    {i < actions.length - 1 && <div className="xp-tl-line" />}
                  </div>
                  <div className={`xp-tl-body${isOpen ? " open" : ""}`}
                    onClick={() => setOpenStep(isOpen ? null : i)}>
                    <div className="xp-tl-head">
                      <span className="xp-tl-action">{actionTitle}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {prio && <span className={`gi-prio ${prio === "high" || prio === "medium" || prio === "low" ? prio : "medium"}`}>{prio}</span>}
                        <span className="gap-chevron">{isOpen ? "▾" : "▸"}</span>
                      </span>
                    </div>
                    {why && <div className="xp-tl-why">{why}</div>}
                    {!isOpen && <div className="rm-hint">Tap to see how to execute this</div>}
                    {isOpen && (
                      <div className="xp-tl-block">
                        <div className="xp-tl-block-label">What will help you execute this</div>
                        {actionDetail && <div className="xp-tl-block-text" style={{ marginBottom: 10 }}>{actionDetail}</div>}
                        {steps.length > 0 ? (
                          <ul>{steps.map((s, si) => <li key={si}>{s}</li>)}</ul>
                        ) : how ? (
                          <ul><li>{how}</li></ul>
                        ) : null}
                        {execResource && (
                          <div className="xp-tl-tool">
                            {tool ? `Studojo tool: ${tool}` : `Use: ${execResource}`}
                          </div>
                        )}
                        {!execResource && tool && (
                          <div className="xp-tl-tool">Studojo tool: {tool}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {renderOutreachCallout()}
          <div className="xp-actions">
            <button className="btn-primary" onClick={() => setPanel("dashboard")}>Go to dashboard →</button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="scard">
          <div className="scard-title">Your roadmap</div>
          <div className="sub">The moves that get you ahead of your peers, in order. Tap any step for the detail.</div>
        </div>
        <div className="rm-intent">{intentLine}</div>
        {actions.map((a: any, i: number) => {
          const action = a.action || a.skill || (typeof a === "string" ? a : "");
          const why = a.why_it_matters || "";
          const how = a.how_to_close || a.how_to_build || "";
          const steps = howSteps(how);
          const tool = toolLabel(a.linked_tool);
          const execResource = a.execution_resource || "";
          const isOpen = openStep === i;
          return (
            <div key={i} className={`rm-step rm-clickable${isOpen ? " open" : ""}`}
              onClick={() => setOpenStep(isOpen ? null : i)}>
              <div className="rm-step-head">
                <div className="rm-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="rm-action">{action}</div>
                  {!isOpen && <div className="rm-hint">Tap for detail</div>}
                </div>
                <span className="gap-chevron">{isOpen ? "▾" : "▸"}</span>
              </div>
              {isOpen && (
                <div style={{ marginTop: 10 }}>
                  <ul>
                    {why && <li><strong>Why it matters:</strong> {why}</li>}
                    {steps.length > 0
                      ? steps.map((s, si) => <li key={"s" + si}>{s}</li>)
                      : how && <li><strong>How to start:</strong> {how}</li>}
                    {a.priority && <li><strong>Priority:</strong> {String(a.priority)}</li>}
                    {execResource && <li><strong>{tool ? "Tool that helps:" : "What helps you execute this:"}</strong> {tool || execResource}</li>}
                    {!execResource && tool && <li><strong>Tool that helps:</strong> {tool}</li>}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        <button className="btn-primary" onClick={() => setPanel("dashboard")}>Go to dashboard →</button>
        {renderOutreachCallout()}
      </>
    );
  }

  function renderOutreachCallout() {
    const cta = sidebarData?.cta_tool as string | undefined;
    if (!cta || !cta.startsWith("outreach_dojo") || cta === "outreach_dojo_not_ready") return null;
    const jbPct = sidebarData?.primary_path?.job_board_reply_pct ?? 2;
    const orPct = sidebarData?.primary_path?.outreach_reply_pct ?? 10;

    if (cta === "outreach_dojo_getting_close") {
      return (
        <div className="scard" style={{ background: "#FFFBEB", borderColor: "#F59E0B", marginTop: 12 }}>
          <div className="scard-title" style={{ color: "#92400E" }}>Unlock a discount code</div>
          <div style={{ fontSize: 13, color: "#78350F", marginBottom: 10 }}>
            Stay consistent for 4 weeks to earn a discount code. Log your progress and add your new skills to your resume to unlock it.
          </div>
          <button onClick={goToDashboardThenResume}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#D97706" }}>
            Log progress and update your resume →
          </button>
        </div>
      );
    }
    const isFirstMove = cta === "outreach_dojo_first_move";
    // Qualified handoff: carry the student's target companies into Outreach
    // onboarding so it starts pre-populated, and flag the source.
    const companies: string[] = Array.isArray(sidebarData?.primary_path?.target_companies)
      ? sidebarData!.primary_path!.target_companies
      : [];
    const handoffParams = new URLSearchParams({ from: "coach" });
    if (companies.length) handoffParams.set("companies", companies.slice(0, 10).join(","));
    const handoffUrl = `/outreach/onboarding/upload?${handoffParams.toString()}`;

    function goToOutreach() {
      const sid = studentIdRef.current;
      if (sid) {
        fetch(`${CC_API}/admin/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "handoff_to_outreach",
            student_id: sid,
            event_data: { companies: companies.slice(0, 10), cta },
          }),
        }).catch(() => {});
      }
      window.location.href = handoffUrl;
    }

    return (
      <div className="scard" style={{ background: "#FFFBEB", borderColor: "#F59E0B", marginTop: 12 }}>
        <div className="scard-title" style={{ color: "#92400E" }}>⚡ Tool that speeds this up</div>
        <div style={{ fontSize: 13, color: "#78350F", marginBottom: 10 }}>
          {isFirstMove
            ? `Job boards get ~${jbPct}% reply rate. Skip them. Direct outreach to hiring managers gets ~${orPct}% for your profile.`
            : `Job boards get ~${jbPct}% reply rate for your profile. Direct outreach to hiring managers gets ~${orPct}%. Outreach Dojo finds the right person at your target company and helps you reach them directly.`}
          {companies.length > 0 && (
            <span> We'll carry your target companies ({companies.slice(0, 3).join(", ")}{companies.length > 3 ? "…" : ""}) straight over.</span>
          )}
        </div>
        <button onClick={goToOutreach}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#D97706" }}>
          {isFirstMove ? "See Outreach Dojo →" : "Try Outreach Dojo →"}
        </button>
      </div>
    );
  }

  // The four Studojo tools, shown as small buttons on the dashboard.
  const TOOL_LINKS = [
    { label: "Resume Maker", href: "https://studojo.com/resume-maker", icon: "📄" },
    { label: "Outreach Dojo", href: "https://studojo.com/outreach", icon: "✉️" },
    { label: "Internship Dojo", href: "https://studojo.com/dojos/internships", icon: "🎯" },
    { label: "Reports", href: "https://studojo.com/reports", icon: "📊" },
  ];

  function toolButtons() {
    return (
      <div className="tool-btn-grid">
        {TOOL_LINKS.map(t => (
          <a key={t.label} className="tool-btn" href={t.href} target="_blank" rel="noopener noreferrer">
            <span className="tool-btn-icon">{t.icon}</span>{t.label}
          </a>
        ))}
      </div>
    );
  }

  function renderDashboard(expanded: boolean) {
    if (!dnaReady) {
      return (
        <div className="skel-wrap">
          {/* stat grid skeleton */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[["#F1ECFE","#C4B5FD"],["#ECFDF5","#6EE7B7"],["#FEF3C7","#FCD34D"],["#EFF6FF","#93C5FD"]].map(([bg, border], i) => (
              <div key={i} className="skel-card" style={{ background: bg, borderColor: border, padding: 12 }}>
                <div className="skel-line short" style={{ height: 28, marginBottom: 8, borderRadius: 6 }} />
                <div className="skel-line medium" style={{ height: 10, marginBottom: 0 }} />
              </div>
            ))}
          </div>
          {/* progress bar skeleton */}
          <div className="skel-card">
            <div className="skel-line short" style={{ marginBottom: 12 }} />
            <div style={{ height: 14, borderRadius: 999, background: "linear-gradient(90deg,var(--bg-secondary) 25%,var(--border) 50%,var(--bg-secondary) 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite linear", marginBottom: 10 }} />
            {[1, 2, 3].map(i => (
              <div key={i} className="skel-line full" style={{ height: 18, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
          {/* weekly milestone skeleton */}
          <div className="skel-card" style={{ border: "2px solid #C4B5FD", background: "#F1ECFE" }}>
            <div className="skel-line short" style={{ marginBottom: 10 }} />
            <div className="skel-line medium" style={{ marginBottom: 0 }} />
          </div>
          <div className="skel-building"><span className="skel-pulse" />Dashboard activates once your Career DNA is ready...</div>
        </div>
      );
    }
    const sh = sidebarData.score_history || {};
    const student = sidebarData.student || {};
    const hist = (sh.history || []);
    const daily: any[] = tasks?.daily || [];
    const weekly = tasks?.weekly || null;

    const dailyItems = daily.map((t, i) => ({ label: t.label, type: t.type || "skill", key: "d" + i }));
    const weeklyItem = weekly ? { label: weekly.label, type: weekly.type || "skill", key: "w0" } : null;
    const pct = industryPct();
    const totalTasks = dailyItems.length + (weeklyItem ? 1 : 0);
    const doneTasks = [...dailyItems, ...(weeklyItem ? [weeklyItem] : [])].filter(it => taskBoxes[it.key]).length;
    const progressPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const sessions = student.session_count || 1;

    // A roadmap step is a tracked milestone; mark how far through the student is.
    const milestones = (pp.priority_actions || []).map((a: any, i: number) => ({
      label: a.action || a.skill || ("Step " + (i + 1)),
      done: !!a.completed,
    }));
    const milestonesDone = milestones.filter((m: any) => m.done).length;

    // PROGRESS TRACKER — the core of the dashboard. Bars and milestones, not boxes.
    const tracker = (
      <>
        <div className={expanded ? "xp-card" : "scard"}>
          <div className={expanded ? "xp-card-title" : "scard-title"}>Today's progress</div>
          <div className="trk-row">
            <div className="trk-bar-track"><div className="trk-bar-fill" style={{ width: `${progressPct}%` }} /></div>
            <div className="trk-pct">{progressPct}%</div>
          </div>
          <div className="trk-sub">{doneTasks} of {totalTasks} tasks ticked. Tick what you have done, then log it below.</div>
          {dailyItems.length === 0 && <div className="trk-sub">Loading your tasks...</div>}
          {dailyItems.map(it => (
            <label key={it.key} className="task-item">
              <input type="checkbox" checked={!!taskBoxes[it.key]}
                onChange={e => setTaskBoxes(prev => ({ ...prev, [it.key]: e.target.checked }))} />
              <span>{it.label}</span>
            </label>
          ))}
          {dailyItems.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-sm" disabled={checkInSaving} onClick={() => submitCheckIn("daily", dailyItems)}>
                {checkInSaving ? "Saving..." : "Log today's progress"}
              </button>
              <button className="btn-ghost" style={{ width: "auto", padding: "8px 14px" }}
                onClick={() => sendMsg("These tasks feel too hard for me right now.")}>
                Too hard? Get easier ones
              </button>
            </div>
          )}
        </div>

        {weeklyItem && (
          <div className={expanded ? "xp-card xp-weekly" : "task-weekly"}>
            <div className="tw-label">This week's milestone</div>
            <label className="task-item" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <input type="checkbox" checked={!!taskBoxes[weeklyItem.key]}
                onChange={e => setTaskBoxes(prev => ({ ...prev, [weeklyItem.key]: e.target.checked }))} />
              <span>{weeklyItem.label}</span>
            </label>
            <div style={{ marginTop: 8 }}>
              <button className="btn-sm" disabled={checkInSaving} onClick={() => submitCheckIn("weekly", [weeklyItem])}>
                {checkInSaving ? "Saving..." : "Log weekly milestone"}
              </button>
            </div>
          </div>
        )}

        {milestones.length > 0 && (
          <div className={expanded ? "xp-card" : "scard"}>
            <div className={expanded ? "xp-card-title" : "scard-title"}>Roadmap milestones</div>
            <div className="trk-sub" style={{ marginBottom: 8 }}>{milestonesDone} of {milestones.length} roadmap steps complete</div>
            {milestones.map((m: any, i: number) => (
              <div key={i} className="trk-milestone">
                <span className={`trk-dot${m.done ? " done" : ""}`}>{m.done ? "✓" : i + 1}</span>
                <span style={{ opacity: m.done ? 0.6 : 1, textDecoration: m.done ? "line-through" : "none" }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </>
    );

    if (expanded) {
      const lvl = currentLevel();
      return (
        <div className="xp">
          <div className="xp-dash-banner">
            <div>
              <div className="xp-hero-label">Progress Tracker</div>
              <div className="xp-dash-name">{student.name ? `${student.name}'s progress` : "Your progress"}</div>
              <div className="xp-hero-meta">Toward {pp.target_role || "your target role"}</div>
              <span className="level-badge" title={`Level ${lvl.num} of 3: ${lvl.name}`}>
                Level {lvl.num} · {lvl.name}
              </span>
            </div>
            <div className="xp-dash-ring"><span>{pct}%</span><small>ahead of peers</small></div>
          </div>

          <div className="xp-statrow">
            <div className="xp-stat"><div className="xp-stat-num">{pct}%</div><div className="xp-stat-label">Better than your industry</div></div>
            <div className="xp-stat"><div className="xp-stat-num">{lvl.num}/3</div><div className="xp-stat-label">Level reached</div></div>
            <div className="xp-stat"><div className="xp-stat-num">{milestonesDone}/{milestones.length || 0}</div><div className="xp-stat-label">Roadmap steps done</div></div>
            <div className="xp-stat"><div className="xp-stat-num">{sessions}</div><div className="xp-stat-label">Coaching sessions</div></div>
          </div>

          {hist.length > 1 && (
            <div className="xp-card">
              <div className="xp-card-title">Your climb over time</div>
              <div className="xp-chart">
                {hist.slice(-8).map((h: any, i: number) => {
                  const v = Math.min(95, Math.round((h.score || 0) * 0.9));
                  return (
                    <div key={i} className="xp-bar-col">
                      <div className="xp-bar" style={{ height: `${v}%` }}>
                        <span className="xp-bar-val">{v}%</span>
                      </div>
                      <div className="xp-bar-date">{(h.date || "").slice(5, 10)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tracker}

          {renderOutreachDashboardNote()}

          <div className="xp-card">
            <div className="xp-card-title">Tools to move faster</div>
            {toolButtons()}
          </div>
        </div>
      );
    }

    const lvl2 = currentLevel();
    return (
      <>
        <div style={{ marginBottom: 10 }}>
          <span className="level-badge">Level {lvl2.num} · {lvl2.name}</span>
        </div>
        <div className="stat-grid">
          <div className="stat-box"><div className="sb-num">{pct}%</div><div className="sb-label">Better than your industry</div></div>
          <div className="stat-box"><div className="sb-num">{lvl2.num}/3</div><div className="sb-label">Level reached</div></div>
          <div className="stat-box"><div className="sb-num">{sessions}</div><div className="sb-label">Sessions</div></div>
          <div className="stat-box"><div className="sb-num">{milestonesDone}/{milestones.length || 0}</div><div className="sb-label">Roadmap steps</div></div>
        </div>
        {tracker}
        {renderOutreachDashboardNote()}
        <div className="scard">
          <div className="scard-title">Tools to move faster</div>
          {toolButtons()}
        </div>
      </>
    );
  }

  function renderOutreachDashboardNote() {
    const cta = sidebarData?.cta_tool as string | undefined;
    if (!cta || !cta.startsWith("outreach_dojo") || cta === "outreach_dojo_not_ready") return null;
    const jbPct = sidebarData?.primary_path?.job_board_reply_pct ?? 2;
    const orPct = sidebarData?.primary_path?.outreach_reply_pct ?? 10;

    if (cta === "outreach_dojo_getting_close") {
      return (
        <div className="scard" style={{ background: "#FFFBEB", borderColor: "#F59E0B", marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: "#78350F" }}>
            Stay consistent for 4 weeks to earn a discount code. Log your progress and add your new skills to your resume to unlock it.{" "}
            <button onClick={goToDashboardThenResume}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#D97706", fontWeight: 600, fontSize: 13 }}>
              Log progress and update your resume →
            </button>
          </div>
        </div>
      );
    }
    const isFirstMove = cta === "outreach_dojo_first_move";
    return (
      <div className="scard" style={{ background: "#FFFBEB", borderColor: "#F59E0B", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#78350F" }}>
          {isFirstMove
            ? `You have not applied yet, that is an advantage. Skip job boards. Direct outreach gets ~${orPct}% reply rate vs ~${jbPct}% on portals.`
            : `Naukri and LinkedIn EasyApply get ~${jbPct}% reply rate for your profile. The students who break through do direct outreach to hiring managers. Your estimated reply rate via outreach: ~${orPct}%.`}{" "}
          <a href="https://studojo.com/outreach" target="_blank" rel="noopener noreferrer" style={{ color: "#D97706", fontWeight: 600 }}>See how Outreach Dojo works →</a>
        </div>
      </div>
    );
  }

  function renderHistory() {
    const activeConvId = conversationIdRef.current;

    function fmtWhen(iso?: string) {
      if (!iso) return "";
      const d = new Date(iso);
      const now = new Date();
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay) return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }

    return (
      <div className="hist-wrap">
        <button className="hist-new-btn" onClick={startNewConversation}>
          <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>＋</span> New chat
        </button>

        {historyLoading ? (
          <div className="skel-wrap" style={{ marginTop: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skel-card">
                <div className="skel-line short" style={{ marginBottom: 6 }} />
                <div className="skel-line full" style={{ marginBottom: 0 }} />
              </div>
            ))}
          </div>
        ) : !conversations.length ? (
          <div className="hist-empty" style={{ marginTop: 12 }}>
            No past chats yet. Start chatting and your conversations will appear here.
          </div>
        ) : (
          <div className="hist-conv-list">
            {conversations.map((c) => {
              const isActive = c.conversation_id === activeConvId;
              return (
                <button
                  key={c.conversation_id}
                  className={`hist-conv-card${isActive ? " active" : ""}`}
                  onClick={() => loadConversation(c.conversation_id)}
                >
                  <div className="hist-conv-title">{c.title || "New chat"}</div>
                  <div className="hist-conv-meta">
                    <span>{c.message_count} message{c.message_count === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span>{fmtWhen(c.last_activity || c.created_at)}</span>
                    {isActive && <span className="hist-conv-badge">Current</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const stat = HOOK_STATS[statIdx];
  const ctaCopy: Record<CtaKind, { title: string; sub: string }> = {
    analysis: { title: "Your Career Analysis is ready", sub: "See how you compare to top performers" },
    roadmap: { title: "Your Roadmap is ready", sub: "The steps that move your readiness fastest" },
    dashboard: { title: "Open your Dashboard", sub: "Track progress and log a check-in" },
    history: { title: "Your chat history", sub: "Everything you and the coach have discussed" },
  };

  const showUnsavedBanner = !session && messages.length > 0 && !unsavedBannerDismissed;

  // Login required: while the auth check resolves, or before we redirect an
  // unauthenticated visitor to sign in, don't render the chat at all.
  if (sessionPending || !session) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <Header />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Satoshi',sans-serif", color: "var(--text-secondary,#6B7280)", fontSize: 15 }}>
            {sessionPending ? "Loading your career coach…" : "Please sign in to use the Career Coach. Redirecting…"}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Header />
      {showUnsavedBanner && (
        <div className="cc-unsaved-banner">
          <span>Your chat is saved on this device only. Sign in to access it from anywhere.</span>
          <a href="/auth">Sign in to save</a>
          <button onClick={() => setUnsavedBannerDismissed(true)} aria-label="Dismiss">✕</button>
        </div>
      )}
      <div className="cc-root">


        {/* FLOATING LOGO + PANEL TOGGLE (toggle slides with the panel) */}
        <a id="cc-float-logo" href="/cc">studojo<span className="cc-dot" /></a>
        {!sidebarExpanded && (
          <button id="cc-float-toggle" className={`${sidebarOpen ? "open" : "closed"}${pulseShowPanel && !sidebarOpen ? " cc-toggle-pulse" : ""}`} onClick={() => toggleSidebar()}>
            <span>{sidebarOpen ? "❯" : "❮"}</span> <span>{sidebarOpen ? "Hide panel" : (pulseShowPanel ? "See your analysis →" : "Show panel")}</span>
          </button>
        )}

        {/* PROFILE MENU — only shown when authenticated. Mirrors the main
            platform header pattern so the dropdown layout matches. */}
        {session && !sidebarExpanded && (
          <div id="cc-user-wrap" ref={userMenuRef}>
            <button
              id="cc-user-btn"
              type="button"
              onClick={() => setUserMenuOpen(o => !o)}
              aria-label="Open profile menu"
            >
              <div className="cc-user-avatar">
                <span>{userInitials()}</span>
              </div>
              <svg
                className={`cc-user-chev${userMenuOpen ? " up" : ""}`}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {userMenuOpen && (
              <div id="cc-user-menu" role="menu">
                <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="cc-user-item">
                  <svg className="cc-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Profile</span>
                </Link>
                <Link to="/my-applications" onClick={() => setUserMenuOpen(false)} className="cc-user-item">
                  <svg className="cc-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>My Applications</span>
                </Link>
                <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="cc-user-item">
                  <svg className="cc-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>My Orders</span>
                </Link>

                <div className="cc-user-sep" />

                <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="cc-user-item">
                  <svg className="cc-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>

                {/* Theme toggle: lives under Settings. Persisted per account. */}
                <button
                  type="button"
                  className="cc-user-item cc-user-item-toggle"
                  onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                  role="menuitemcheckbox"
                  aria-checked={theme === "light"}
                >
                  {theme === "dark" ? (
                    <svg className="cc-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="cc-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                      <circle cx="12" cy="12" r="4" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  )}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                  <span className={`cc-user-switch${theme === "light" ? " on" : ""}`}><span /></span>
                </button>

                <button type="button" onClick={handleSignOut} className="cc-user-item">
                  <svg className="cc-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* LAYOUT */}
        <div id="cc-layout">
          <div id="cc-chat-col">
            <div id="cc-chat-inner">
              <div className="chat-card">
                <div className={`chat-setup-header${headerHidden ? " hidden" : ""}`}>
                  <div className="chat-setup-header-title">Quick Profile Setup</div>
                  <div className="chat-setup-header-sub">The more you talk to the coach, the better it knows you and the sharper your plan gets.</div>
                </div>
                <div id="cc-messages">
                  {returning && <div className="session-divider">Continuing your session</div>}
                  {messages.map((m, i) => {
                    const isLastInRun =
                      i === messages.length - 1 || messages[i + 1].role !== m.role;
                    const isLastMessage = i === messages.length - 1;
                    const hasLink = /(https?:\/\/[^\s)]+)/.test(m.content);
                    return (
                      <div key={i}>
                        <div className={`msg-row ${m.role}`}>
                          {m.role === "agent" && <div className="agent-avatar"><img src="/bobie-hat.png" alt="Bobie" /></div>}
                          <div className="msg-bubble-wrap">
                            <div className="msg-bubble">{renderBubbleText(m.content)}</div>
                            {m.role === "agent" && hasLink && (
                              <button className="report-link-btn"
                                onClick={() => sendMsg("One of the links you sent does not work or is wrong.")}>
                                Link not working? Report it
                              </button>
                            )}
                            {isLastInRun && <div className="msg-time">{m.time}</div>}
                          </div>
                        </div>
                        {/* CTA shows only on the most recent agent message, so it
                            disappears as the conversation continues. */}
                        {m.cta && isLastMessage && (
                          <div className="panel-cta" onClick={() => openSidebarTo(m.cta as CtaKind)}>
                            <div>
                              <div className="cta-text">{ctaCopy[m.cta as CtaKind].title}</div>
                              <div className="cta-sub">{ctaCopy[m.cta as CtaKind].sub}</div>
                            </div>
                            <div className="cta-arrow">→</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {waiting && (
                    <div className="msg-row agent">
                      <div className="agent-avatar"><img src="/bobie-hat.png" alt="Bobie" /></div>
                      <div className="msg-bubble-wrap">
                        <div className="msg-bubble">
                          {resumeStatusMsg ? (
                            <span style={{ fontSize: 13, color: "var(--text-secondary, #6B7280)", display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="typing-dots" style={{ display: "inline-flex" }}><span /><span /><span /></div>
                              {resumeStatusMsg}
                            </span>
                          ) : thinkingMsg ? (
                            <span style={{ fontSize: 13, color: "var(--text-secondary, #6B7280)", display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="typing-dots" style={{ display: "inline-flex" }}><span /><span /><span /></div>
                              {thinkingMsg}
                            </span>
                          ) : (
                            <div className="typing-dots"><span /><span /><span /></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {outreachNote && (
                    <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 12, padding: "12px 14px", margin: "10px 0", display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, lineHeight: 1.5 }}>
                      <span style={{ fontSize: 16 }}>📌</span>
                      <span style={{ flex: 1 }}>
                        {outreachNote.toolRec === "outreach_dojo_getting_close" ? (
                          <>Stay consistent for 4 weeks to earn a discount code. Log your progress and add your new skills to your resume to unlock it.{" "}
                            <button onClick={goToDashboardThenResume}
                              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#D97706", fontWeight: 600, fontSize: 13 }}>
                              Log progress and update your resume →
                            </button>
                          </>
                        ) : outreachNote.toolRec === "outreach_dojo_first_move" ? (
                          <>Skip job boards. Your estimated reply rate via direct outreach is ~{outreachNote.orPct}% vs ~{outreachNote.jbPct}% on portals.{" "}
                            <a href="https://studojo.com/outreach" target="_blank" rel="noopener noreferrer" style={{ color: "#D97706", fontWeight: 600 }}>See Outreach Dojo →</a>
                          </>
                        ) : (
                          <>Job boards get ~{outreachNote.jbPct}% reply rate. Direct outreach to hiring managers gets ~{outreachNote.orPct}% for your profile.{" "}
                            <a href="https://studojo.com/outreach" target="_blank" rel="noopener noreferrer" style={{ color: "#D97706", fontWeight: 600 }}>See how Outreach Dojo works →</a>
                          </>
                        )}
                      </span>
                      <button onClick={() => setOutreachNote(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 4, fontSize: 16, color: "#9CA3AF", lineHeight: 1 }}>×</button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {agentState === "PROFILING" && profileProgress && (() => {
                  const pct = profileProgress.dnaReady ? 100 : profileProgress.pct;
                  const coreAreas = ["identity", "career_direction", "experience", "skills", "motivation", "depth"];
                  const areaVals = profileProgress.areas || {};
                  const left = coreAreas.filter(a => areaVals[a] && areaVals[a].status !== "complete").length
                    || (pct >= 100 ? 0 : Math.max(1, Math.round((100 - pct) / 17)));
                  let msg: string;
                  if (profileProgress.dnaReady) msg = "Building your Career DNA now…";
                  else if (pct < 25) msg = "Just getting started — tell me your degree and the role you're aiming for.";
                  else if (pct < 55) msg = "Good progress. A few more answers and I can build your Career DNA.";
                  else if (pct < 85) msg = `Almost there — ${left} quick thing${left === 1 ? "" : "s"} left and your Career DNA is ready.`;
                  else msg = "One more answer and your full Career Analysis unlocks.";
                  return (
                    <div id="cc-profile-progress">
                      <div className="pf-row">
                        <span className="pf-msg">{msg}</span>
                        <span className="pf-meta">{profileProgress.dnaReady ? "100%" : `${left} of 6 left`}</span>
                      </div>
                      <div className="pf-bar-track"><div className="pf-bar-fill" style={{ width: `${pct}%` }} /></div>
                      {idleHint && !profileProgress.dnaReady && (
                        <div className="pf-idle">You're {pct}% of the way to your Career DNA — just keep going, this is quick.</div>
                      )}
                      {profileProgress.canSkip && !profileProgress.dnaReady && (
                        <button className="pf-skip" onClick={() => sendMsg("I'm ready, show my analysis")}>
                          I'm ready, show my analysis →
                        </button>
                      )}
                    </div>
                  );
                })()}
                {pendingResume && (
                  <div id="cc-pending-resume">
                    <span className="pr-icon">📎</span>
                    <span className="pr-name" title={pendingResume.name}>{pendingResume.name}</span>
                    <span className="pr-hint">{resumeUploading ? "Uploading..." : "Will upload when you send"}</span>
                    <button className="pr-remove" disabled={resumeUploading} title="Remove" onClick={() => setPendingResume(null)}>✕</button>
                  </div>
                )}
                <div id="cc-input-area">
                  <div id="cc-input-shell">
                    <button id="cc-attach-btn" title="Upload your resume" onClick={() => fileRef.current?.click()} aria-label="Upload resume">📎</button>
                    <input type="file" ref={fileRef} accept=".pdf,.docx,.txt" style={{ display: "none" }}
                      onChange={(e: any) => { if (e.target.files?.[0]) stageResume(e.target.files[0]); e.target.value = ""; }} />
                    <textarea
                      id="cc-chat-input" ref={inputRef}
                      placeholder={
                        pendingResume
                          ? "Add a note about your resume, or just hit send..."
                          : (chips[ghostIdx] ? `e.g. ${chips[ghostIdx]} — Tab to use` : "Ask about internships, resumes, outreach...")
                      }
                      rows={1}
                      onKeyDown={(e: any) => {
                        // Tab on an empty input fills the textarea with the
                        // current ghost suggestion instead of moving focus.
                        if (e.key === "Tab" && !e.shiftKey && inputEmpty && chips[ghostIdx] && !pendingResume) {
                          e.preventDefault();
                          if (inputRef.current) {
                            inputRef.current.value = chips[ghostIdx];
                            inputRef.current.style.height = "auto";
                            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + "px";
                            setInputEmpty(false);
                            inputRef.current.focus();
                          }
                          return;
                        }
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
                      }}
                      onChange={(e: any) => {
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                        setInputEmpty(!e.target.value);
                        if (idleHint) setIdleHint(false);
                      }}
                    />
                    <button id="cc-send-btn" disabled={waiting || resumeUploading} onClick={() => sendMsg()} aria-label="Send">→</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside id="cc-sidebar" className={`${sidebarOpen ? "" : "collapsed"} ${sidebarExpanded ? "expanded" : ""}`}>
            {sidebarExpanded ? (
              /* EXPANDED: full-page view with a top nav bar */
              <div id="cc-xp-nav">
                <button id="cc-xp-back" onClick={() => setSidebarExpanded(false)}>← Take me to chat</button>
                <div id="cc-xp-tabs">
                  {(["analysis", "roadmap", "dashboard", "history"] as CtaKind[]).map(p => (
                    <button key={p} className={`cc-xp-tab${panel === p ? " active" : ""}`} onClick={() => setPanel(p)}>
                      {p === "analysis" ? "Career Analysis" : p === "roadmap" ? "Roadmap" : p === "dashboard" ? "Dashboard" : "Chat History"}
                    </button>
                  ))}
                </div>
                <div style={{ width: 130 }} />
              </div>
            ) : (
              /* COLLAPSED PANEL: pill-button nav, same system as the expanded view */
              <div id="cc-sidebar-nav">
                <div id="cc-sidebar-tabs">
                  {(["analysis", "roadmap", "dashboard", "history"] as CtaKind[]).map(p => (
                    <button key={p} className={`side-tab${panel === p ? " active" : ""}`} onClick={() => setPanel(p)}>
                      <span className="tab-full">{p === "analysis" ? "Career Analysis" : p === "roadmap" ? "Roadmap" : p === "dashboard" ? "Dashboard" : "Chat History"}</span>
                      <span className="tab-short">{p === "analysis" ? "Analysis" : p === "roadmap" ? "Roadmap" : p === "dashboard" ? "Stats" : "History"}</span>
                    </button>
                  ))}
                </div>
                <div className="side-action-row">
                  <button className="side-action-btn" onClick={() => setSidebarExpanded(true)}>
                    ⤢ Expand to full page
                  </button>
                  <button className="side-action-btn side-action-close" onClick={() => toggleSidebar(false)}>
                    ✕ Close
                  </button>
                </div>
              </div>
            )}
            <div id="cc-sidebar-body">
              {panel === "analysis" && renderAnalysis(sidebarExpanded)}
              {panel === "roadmap" && renderRoadmap(sidebarExpanded)}
              {panel === "dashboard" && renderDashboard(sidebarExpanded)}
              {panel === "history" && renderHistory()}
            </div>
          </aside>
        </div>

        {/* ANALYSIS-READY POPUP — only when panel is collapsed */}
        <div id="cc-ready-pop" className={readyPopVisible && !sidebarOpen ? "show" : ""}>
          <div className="rp-title">Your Career Analysis is ready</div>
          <div className="rp-sub">See how you compare to top performers and what to do next.</div>
          <div className="rp-btns">
            <button className="rp-open" onClick={() => openSidebarTo("analysis")}>View it</button>
            <button className="rp-later" onClick={() => setReadyPopVisible(false)}>Later</button>
          </div>
        </div>

        {skillsUnlocked && (
          <div id="cc-skills-unlocked" className="show">
            <div className="su-header">
              <div className="su-icon">⚡</div>
              <div>
                <div className="su-title">Skills unlocked this week</div>
                <div className="su-sub">Want me to add these to your resume?</div>
              </div>
            </div>
            <div className="su-chips">
              {skillsUnlocked.skills.map((s, i) => <span key={i} className="su-chip">{s}</span>)}
            </div>
            {skillsUnlocked.hasResume ? (
              <div className="su-btns">
                <button className="su-add" onClick={() => {
                  const params = new URLSearchParams({ inject_skills: skillsUnlocked.skills.join(",") });
                  window.open(`https://studojo.com/resume-maker?${params}`, "_blank");
                  setSkillsUnlocked(null);
                  setMessages(prev => [...prev, {
                    role: "agent",
                    content: `I've opened your Resume Maker and pre-loaded ${skillsUnlocked.skills.length === 1 ? "that skill" : "those skills"}. Review what I added, adjust anything, and re-download your PDF when you're happy.`,
                    time: now12h(),
                  }]);
                }}>Add to my resume →</button>
                <button className="su-later" onClick={() => setSkillsUnlocked(null)}>Later</button>
              </div>
            ) : (
              <div className="su-btns">
                <button className="su-add" onClick={() => {
                  setSkillsUnlocked(null);
                  setMessages(prev => [...prev, {
                    role: "agent",
                    content: `You don't have a resume on file yet. Head to the Resume Maker and build one — or upload your existing PDF — and I'll be able to push your new skills straight into it after your next weekly check-in.`,
                    time: now12h(),
                  }]);
                  window.open("https://studojo.com/resume-maker", "_blank");
                }}>Create / upload resume</button>
                <button className="su-later" onClick={() => setSkillsUnlocked(null)}>Later</button>
              </div>
            )}
          </div>
        )}

        <div id="cc-toast" className={toastMsg ? "show" : ""}>{toastMsg}</div>
      </div>
    </>
  );
}
