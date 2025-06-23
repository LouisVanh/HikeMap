// app/terms/page.tsx

'use client';
import React from 'react';

export default function TermsOfServicePage() {
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
          __html: `<span class="c7">Terms of Service</span></h2><p class="c4"><span class="c8">Effective Date:</span><span class="c2">&nbsp;23/06/2025</span></p><p class="c4"><span class="c2">Welcome to HikeMap! By accessing or using our website or services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with these Terms, please do not use our services.</span></p><h3 class="c5" id="h.8oedpzs9b4r7"><span class="c1">1. Description of Service</span></h3><p class="c4"><span class="c2">HikeMap is a platform that allows users to:</span></p><ul class="c3 lst-kix_562zqfwwoc3v-0 start"><li class="c0 li-bullet-0"><span class="c2">View and explore hiking routes shared by others<br></span></li><li class="c0 li-bullet-0"><span class="c2">Create an account to upload and share hikes, photos, and points of interest<br></span></li><li class="c0 li-bullet-0"><span class="c2">View public user-generated content on an interactive map<br></span></li></ul><h3 class="c5" id="h.tno0hbe4hbd9"><span class="c1">2. User Accounts</span></h3><p class="c4"><span class="c2">You may use certain features without an account. However, to upload or manage content, you must log in via a third-party authentication provider (e.g., Google). You agree to provide accurate account information and keep it up to date.</span></p><h3 class="c5" id="h.53yf6k1bf224"><span class="c1">3. User Content</span></h3><p class="c4"><span class="c2">By uploading content (e.g., photos, hike routes, comments), you grant HikeMap a non-exclusive, royalty-free license to host, display, and share your content publicly on our platform.</span></p><p class="c4"><span class="c2">You must not upload:</span></p><ul class="c3 lst-kix_tumqjbql0iwx-0 start"><li class="c0 li-bullet-0"><span class="c2">Content that infringes on the rights of others (e.g., copyright, privacy)<br></span></li><li class="c0 li-bullet-0"><span class="c2">Inappropriate, offensive, or unlawful content<br></span></li></ul><p class="c4"><span class="c2">We reserve the right to remove content at our discretion.</span></p><h3 class="c5" id="h.pycj6l488egl"><span class="c1">4. Privacy</span></h3><p class="c4"><span class="c2">Your use of the service is also governed by our Privacy Policy, which outlines how we collect, use, and protect your data.</span></p><h3 class="c5" id="h.bxvc57hkj908"><span class="c1">5. Limitations of Liability</span></h3><p class="c4"><span class="c2">HikeMap is provided &quot;as is&quot; without warranties of any kind. We are not liable for damages resulting from:</span></p><ul class="c3 lst-kix_1asxwppdqnut-0 start"><li class="c0 li-bullet-0"><span class="c2">Loss of data<br></span></li><li class="c0 li-bullet-0"><span class="c2">Service downtime<br></span></li><li class="c0 li-bullet-0"><span class="c2">Inaccurate or misleading content posted by users<br></span></li></ul><p class="c4"><span class="c2">Use at your own risk, especially when relying on user-contributed hike information.</span></p><h3 class="c5" id="h.wxwvlfunfsxz"><span class="c1">6. Termination</span></h3><p class="c4"><span class="c2">We reserve the right to suspend or terminate access to our services if you violate these Terms or abuse the platform.</span></p><h3 class="c5" id="h.szfx9lqu7gz2"><span class="c1">7. Changes to Terms</span></h3><p class="c4"><span class="c2">We may update these Terms occasionally. Continued use of the service after changes means you accept the new Terms.</span></p><h3 class="c5" id="h.awwsd3rbbtp1"><span class="c1">8. Contact</span></h3><p class="c4"><span class="c2">If you have questions or concerns about these Terms, please contact us at louisvh.dev@gmail.com.</span></p><p class="c6"><span class="c2"></span></p>`,
        }}
      />
    </div>
  );
}
