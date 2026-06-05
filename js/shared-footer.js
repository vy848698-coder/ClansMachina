(function () {
  var footerTemplate = [
    '<div class="container">',
    '  <div class="footer-top">',
    '    <div class="footer-brand">',
    '      <a href="index.html" class="logo">',
    '        <img src="image/clans_logo.png" alt="Clans Machina" class="logo-img logo-img--footer" width="95" height="32" loading="lazy" decoding="async" fetchpriority="low" />',
    '      </a>',
    '      <p>Intelligent solar systems powered by AI. Trusted by 12,000+ homes across India.</p>',
    '      <div class="social-links">',
    '        <a href="#" aria-label="Instagram">IN</a>',
    '        <a href="#" aria-label="LinkedIn">LI</a>',
    '        <a href="#" aria-label="YouTube">YT</a>',
    '        <a href="#" aria-label="Twitter">TW</a>',
    '      </div>',
    '    </div>',
    '    <div class="footer-links-group">',
    '      <h5>Solutions</h5>',
    '      <ul>',
    '        <li><a href="residential.html">Residential Solar</a></li>',
    '        <li><a href="commercial.html">Commercial Solar</a></li>',
    '        <li><a href="society.html">Housing Societies</a></li>',
    '        <li><a href="index.html#process">On-Grid Systems</a></li>',
    '        <li><a href="index.html#process">Off-Grid Systems</a></li>',
    '      </ul>',
    '    </div>',
    '    <div class="footer-links-group">',
    '      <h5>Company</h5>',
    '      <ul>',
    '        <li><a href="index.html#hero">About Us</a></li>',
    '        <li><a href="index.html#features">ClansZero Plan</a></li>',
    '        <li><a href="index.html#features">Technology</a></li>',
    '        <li><a href="index.html#app">ClansMonitor App</a></li>',
    '        <li><a href="index.html#contact">Careers</a></li>',
    '      </ul>',
    '    </div>',
    '    <div class="footer-links-group">',
    '      <h5>Resources</h5>',
    '      <ul>',
    '        <li><a href="calculator.html">Solar Calculator</a></li>',
    '        <li><a href="blog.html">Blog and Insights</a></li>',
    '        <li><a href="faq.html">Government Subsidies</a></li>',
    '        <li><a href="faq.html">FAQ</a></li>',
    '        <li><a href="index.html#contact">Support Center</a></li>',
    '      </ul>',
    '    </div>',
    '  </div>',
    '  <div class="footer-bottom">',
    '    <p>&#169; 2026 Clans Machina Energy Pvt. Ltd. All rights reserved. Proudly Made in India.</p>',
    '    <div class="footer-legal">',
    '      <a href="footer.html">Footer</a>',
    '      <a href="footer.html#privacy">Privacy Policy</a>',
    '      <a href="footer.html#terms">Terms of Service</a>',
    '      <a href="footer.html#cancellation">Cancellation Policy</a>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');

  var footers = document.querySelectorAll('footer.footer');
  if (!footers.length) {
    return;
  }

  footers.forEach(function (footer) {
    footer.innerHTML = footerTemplate;
  });
})();
