// app/privacy/page.tsx

'use client';
import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: 'white',
        zIndex: 1000,
        padding: '2rem',
      }}
    >
      <div
        style={{ maxWidth: '800px', margin: '0 auto' }}
        dangerouslySetInnerHTML={{
          __html: `<h1 class="c13" id="h.pcba4asgqug2"><span class="c2 c11">&#128737;&#65039; Privacy Policy &ndash; HikeMap</span></h1><p class="c4"><span class="c5">Last updated: 19/06/2025</span></p><p class="c4"><span>At </span><span class="c2">HikeMap</span><span>, we value your privacy and are committed to protecting your personal data in line with the </span><span class="c2">General Data Protection Regulation (GDPR)</span><span class="c1">.</span></p><h2 class="c7" id="h.372nb4unhzr7"><span class="c8 c2">1. What data we collect</span></h2><p class="c4"><span class="c1">When you use HikeMap, we may collect and store the following:</span></p><ul class="c3 lst-kix_yfy12x6ak6tk-0 start"><li class="c0 li-bullet-0"><span class="c1">Your email address or user ID (via Supabase Auth)<br></span></li><li class="c0 li-bullet-0"><span class="c1">The pictures you upload<br></span></li><li class="c0 li-bullet-0"><span class="c1">The GPS routes (polylines) of your hikes<br></span></li><li class="c0 li-bullet-0"><span class="c1">Timestamps related to activity<br></span></li><li class="c0 li-bullet-0"><span class="c1">Optional: Your profile name and image<br></span></li></ul><p class="c4"><span>We </span><span class="c2">do not collect</span><span class="c1">&nbsp;any sensitive personal data such as addresses, financial information, or biometric data.</span></p><h2 class="c7" id="h.ifqq4s8wfdt3"><span class="c8 c2">2. How we use your data</span></h2><p class="c4"><span class="c1">We use your data to:</span></p><ul class="c3 lst-kix_50p4o36vyft-0 start"><li class="c0 li-bullet-0"><span class="c1">Display your hike contributions on the map<br></span></li><li class="c0 li-bullet-0"><span class="c1">Let other users view public photos and hiking routes<br></span></li><li class="c0 li-bullet-0"><span class="c1">Improve the quality of our app and track feature use<br></span></li><li class="c0 li-bullet-0"><span class="c1">Support account management and data syncing<br></span></li></ul><p class="c4"><span>We </span><span class="c2">do not share</span><span class="c1">, sell, or expose your data to third-party services beyond what&#39;s necessary to operate the app (e.g., Supabase, storage/CDN providers).</span></p><h2 class="c7" id="h.s8r9np8bxnp2"><span class="c8 c2">3. Your rights under GDPR</span></h2><p class="c4"><span class="c1">As a user, you have the right to:</span></p><ul class="c3 lst-kix_no2yc0334ivd-0 start"><li class="c0 li-bullet-0"><span class="c1">Access your stored data<br></span></li><li class="c0 li-bullet-0"><span class="c1">Correct inaccurate data<br></span></li><li class="c0 li-bullet-0"><span class="c1">Delete your data (&ldquo;right to be forgotten&rdquo;)<br></span></li><li class="c0 li-bullet-0"><span class="c1">Withdraw consent (e.g., stop using the app)<br></span></li></ul><p class="c4"><span>You may </span><span class="c2">request data deletion</span><span class="c1">&nbsp;at any time.</span></p><h2 class="c7" id="h.8o1a095sejjr"><span class="c2 c8">4. How to delete your data</span></h2><p class="c4"><span>To delete your account and associated data, email us at:<br> &#128231; </span><span class="c2 c10">louisvh.dev@gmail.com</span></p><p class="c4"><span>Please include your account email or user ID so we can confirm your identity. Your data will be permanently deleted from our systems within </span><span class="c2">30 days</span><span class="c1">.</span></p><p class="c4 c12"><span class="c5">(In future updates, we plan to add an in-app &ldquo;Delete My Data&rdquo; button for convenience.)</span></p><h2 class="c7" id="h.ljyjxcget0xm"><span class="c8 c2">5. Data storage &amp; security</span></h2><p class="c4"><span>We store all user data securely using </span><span class="c2">Supabase</span><span>&nbsp;with </span><span class="c2">Row-Level Security (RLS)</span><span class="c1">&nbsp;enabled to ensure that only you can access or modify your content.</span></p><p class="c4"><span class="c1">Media files (e.g., photos) are stored on secure cloud storage with limited access.</span></p><hr><p class="c6"><span class="c1"></span></p><p class="c4"><span>If you have questions or concerns about your data, contact us at </span><span class="c2">louisvh.dev@gmail.com</span><span class="c1">.</span></p><p class="c6"><span class="c1"></span></p>`,
        }}
      />
    </div>
  );
}
