/**
 * PHISHING DECODER — Explainable Rule-Based Phishing Analysis Engine
 * 
 * Technical Principles:
 * 1. Strictly rule-based, deterministic heuristics.
 * 2. Transparently labeled as Explainable Security Analysis (no false claims of AI or live threat feeds).
 * 3. Safe text processing only (never fetches, navigates to, or executes user-provided links).
 * 4. Transparent reasoning: every finding explains WHY it matters and provides clear EVIDENCE.
 */

export type AnalysisType = 'url' | 'email' | 'message';

export type SignalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type RiskLevel = 'LOW' | 'CAUTION' | 'SUSPICIOUS' | 'HIGH RISK';

export interface Finding {
  id: string;
  category: 'structural' | 'reputation' | 'social_engineering' | 'identity' | 'content';
  severity: SignalSeverity;
  title: string;
  explanation: string;
  evidence: string;
  technicalDetail: string;
  mitigationAdvice: string;
}

export interface EvidenceMap {
  parsedType: AnalysisType;
  primarySubject: string;
  components: Record<string, string | number | boolean | string[]>;
  flaggedPhrases: string[];
}

export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  inputRaw: string;
  inputSummary: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  summaryWhy: string;
  findings: Finding[];
  evidenceMap: EvidenceMap;
  recommendations: string[];
  inspectedAt: string;
  engineVersion: string;
}

// Well-known trusted domain suffixes for major brands (for impersonation mismatch detection)
const KNOWN_BRANDS: Record<string, string[]> = {
  paypal: ['paypal.com'],
  microsoft: ['microsoft.com', 'live.com', 'office.com', 'office365.com', 'azure.com'],
  apple: ['apple.com', 'icloud.com'],
  google: ['google.com', 'gmail.com', 'google.co.in', 'google.co.uk'],
  amazon: ['amazon.com', 'amazon.in', 'amazon.co.uk', 'aws.amazon.com'],
  netflix: ['netflix.com'],
  meta: ['meta.com', 'facebook.com', 'instagram.com', 'whatsapp.com'],
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  chase: ['chase.com'],
  wellsfargo: ['wellsfargo.com'],
  bankofamerica: ['bankofamerica.com'],
  dhl: ['dhl.com'],
  fedex: ['fedex.com'],
  usps: ['usps.com'],
  dropbox: ['dropbox.com'],
  linkedin: ['linkedin.com'],
  twitter: ['twitter.com', 'x.com'],
  coinbase: ['coinbase.com'],
  binance: ['binance.com']
};

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'tk', 'work', 'click', 'buzz', 'cam', 'fit', 'gq', 'cf',
  'ml', 'icu', 'rest', 'country', 'stream', 'surf', 'support', 'live', 'download',
  'accountant', 'bid', 'racing', 'win', 'vip'
]);

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'ow.ly', 'rb.gy',
  'tiny.cc', 'buff.ly', 'soo.gd', 's.id', 'shorturl.at', 'bl.ink'
]);

// Helper to sanitize preview text for privacy
export function sanitizeInputSummary(text: string, maxLength: number = 80): string {
  const clean = text.replace(/[\r\n]+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength) + '...';
}

/**
 * Core Rule-Based URL Analysis
 */
export function analyzeUrl(rawInput: string): AnalysisResult {
  const cleanInput = rawInput.trim();
  const findings: Finding[] = [];
  const flaggedPhrases: string[] = [];

  let parsedUrl: URL | null = null;
  let protocol = '';
  let hostname = '';
  let pathname = '';
  let search = '';
  let port = '';
  let username = '';
  let password = '';

  // Attempt standard URL parse or prepended https parse
  const candidateUrl = cleanInput.match(/^https?:\/\//i) ? cleanInput : `http://${cleanInput}`;
  try {
    parsedUrl = new URL(candidateUrl);
    protocol = parsedUrl.protocol;
    hostname = parsedUrl.hostname.toLowerCase();
    pathname = parsedUrl.pathname;
    search = parsedUrl.search;
    port = parsedUrl.port;
    username = parsedUrl.username;
    password = parsedUrl.password;
  } catch {
    // If native URL parser fails, extract basic structural pieces
    hostname = cleanInput.split('/')[0].split('?')[0].toLowerCase();
  }

  // 1. Check Protocol: Plain HTTP
  if (cleanInput.startsWith('http://') || protocol === 'http:') {
    findings.push({
      id: 'url-proto-http',
      category: 'structural',
      severity: 'MEDIUM',
      title: 'Unencrypted HTTP Protocol',
      explanation: 'The link specifies plain HTTP instead of encrypted HTTPS, allowing eavesdropping and credential interception in transit.',
      evidence: 'http://',
      technicalDetail: 'Legitimate login portals and banking services require transport layer security (TLS/HTTPS). Plain HTTP is rarely used by genuine institutions for sensitive workflows.',
      mitigationAdvice: 'Do not enter passwords, personal data, or payment information on unencrypted HTTP connections.'
    });
    flaggedPhrases.push('http://');
  }

  // 2. Embedded Authentication / Obfuscation in URL (@ symbol)
  if (cleanInput.includes('@') || username || password) {
    findings.push({
      id: 'url-auth-obfuscation',
      category: 'structural',
      severity: 'CRITICAL',
      title: 'Deceptive Userinfo Symbol (@) Detected',
      explanation: 'The URL uses the "@" character. In standard web addressing, browsers ignore anything before the "@" and connect strictly to the host that follows it.',
      evidence: cleanInput.slice(0, cleanInput.indexOf('@') + 1),
      technicalDetail: 'Attackers frequently construct links like "https://paypal.com@evil-phish-domain.com" to mislead victims into believing they are visiting the legitimate brand.',
      mitigationAdvice: 'Never open links containing "@" in the authority portion of the web address.'
    });
    flaggedPhrases.push('@ (userinfo spoofing)');
  }

  // 3. IP-Address Hostname
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const isIpHost = ipv4Regex.test(hostname) || hostname.startsWith('[') || /^\d{1,10}$/.test(hostname);
  if (isIpHost) {
    findings.push({
      id: 'url-ip-hostname',
      category: 'structural',
      severity: 'HIGH',
      title: 'Direct IP Address Hostname',
      explanation: 'The web destination points directly to a raw numerical IP address rather than a registered, branded domain name.',
      evidence: hostname,
      technicalDetail: 'Legitimate commercial brands operate through recognized domain names. Phishing operators often host malicious drop kits on raw IP addresses or compromised VPS nodes.',
      mitigationAdvice: 'Legitimate corporate services do not instruct customers to visit bare IP addresses.'
    });
    flaggedPhrases.push(`Host: ${hostname}`);
  }

  // 4. Excessive Subdomains (Domain Hierarchy Deception)
  const hostLabels = hostname.split('.');
  const tld = hostLabels.length > 1 ? hostLabels[hostLabels.length - 1] : '';
  const rootDomain = hostLabels.length >= 2 ? hostLabels.slice(-2).join('.') : hostname;

  if (hostLabels.length > 4) {
    findings.push({
      id: 'url-excessive-subdomains',
      category: 'structural',
      severity: 'HIGH',
      title: 'Excessive Subdomain Depth',
      explanation: `The hostname contains ${hostLabels.length} structural levels. Deep nesting is frequently deployed to push deceptive brand terms into visible mobile browser screens.`,
      evidence: hostname,
      technicalDetail: 'Subdomains can be configured arbitrarily by the domain owner without oversight. Deceptive prefixes like "secure.login.service.com-portal.xyz" manipulate visual trust.',
      mitigationAdvice: 'Inspect the true root domain at the very end of the hostname before the first single slash.'
    });
    flaggedPhrases.push(`Depth: ${hostLabels.length} labels`);
  }

  // 5. Misleading Brand-Like Terms (Brand Impersonation in Hostname or Path)
  for (const [brand, officialDomains] of Object.entries(KNOWN_BRANDS)) {
    const isBrandMentioned = hostname.includes(brand) || pathname.toLowerCase().includes(brand);
    const isOfficial = officialDomains.some(official => hostname === official || hostname.endsWith(`.${official}`));

    if (isBrandMentioned && !isOfficial) {
      findings.push({
        id: `url-brand-impersonation-${brand}`,
        category: 'identity',
        severity: 'CRITICAL',
        title: `Potential Impersonation of ${brand.toUpperCase()}`,
        explanation: `The destination references "${brand}" but is NOT hosted on an official ${brand} domain (${officialDomains.join(', ')}).`,
        evidence: `Target: ${hostname}${pathname}`,
        technicalDetail: 'Brand-jacking combines trusted trademarks with deceptive infrastructure (e.g., typosquatting or secondary subdomains) to deceive users into submitting account credentials.',
        mitigationAdvice: `Never log in through this address. Navigate directly to the official portal by typing "${officialDomains[0]}" into your address bar.`
      });
      flaggedPhrases.push(`Impersonated Brand: ${brand}`);
      break; // Only flag primary brand match once
    }
  }

  // 6. Punycode / IDN Homograph Attack Indicator
  if (hostname.includes('xn--')) {
    findings.push({
      id: 'url-punycode-homograph',
      category: 'structural',
      severity: 'HIGH',
      title: 'Punycode Internationalized Domain (IDN)',
      explanation: 'The hostname uses Punycode ("xn--") encoding, which allows foreign unicode characters that visually mimic standard Latin letters.',
      evidence: hostname,
      technicalDetail: 'Homograph attacks exploit visual similarities between Cyrillic/Greek characters and Latin characters (e.g., Cyrillic "а" replacing Latin "a") to construct counterfeit domains.',
      mitigationAdvice: 'Treat punycode domains claiming to represent known services with extreme skepticism.'
    });
    flaggedPhrases.push('xn-- (Punycode)');
  }

  // 7. Suspicious Non-Standard Web Port
  if (port && !['80', '443', ''].includes(port)) {
    findings.push({
      id: 'url-nonstandard-port',
      category: 'structural',
      severity: 'MEDIUM',
      title: 'Non-Standard Web Service Port',
      explanation: `The link directs communication through port :${port} rather than standard web ports (80 for HTTP, 443 for HTTPS).`,
      evidence: `Port :${port}`,
      technicalDetail: 'Phishing kits and rogue administrative proxies frequently listen on unconventional high ports like 8080, 8443, 8888, or 2082 to bypass basic perimeter firewalls.',
      mitigationAdvice: 'Standard public websites and web banking portals operate on default port 443.'
    });
    flaggedPhrases.push(`Port :${port}`);
  }

  // 8. Known URL Shortener
  if (KNOWN_SHORTENERS.has(hostname) || Array.from(KNOWN_SHORTENERS).some(s => hostname.endsWith(s))) {
    findings.push({
      id: 'url-shortener-masking',
      category: 'reputation',
      severity: 'MEDIUM',
      title: 'URL Shortening Service Detected',
      explanation: 'This address is a shortened link that masks the genuine ultimate web destination.',
      evidence: hostname,
      technicalDetail: 'URL shorteners obscure destination hostnames, circumvent email safety scanners, and make it impossible for users to inspect the target domain before clicking.',
      mitigationAdvice: 'Do not click shortened links received from unsolicited or unexpected senders.'
    });
    flaggedPhrases.push(`Shortener: ${hostname}`);
  }

  // 9. High-Abuse / Suspicious TLD
  if (SUSPICIOUS_TLDS.has(tld)) {
    findings.push({
      id: 'url-suspicious-tld',
      category: 'reputation',
      severity: 'MEDIUM',
      title: `High-Risk Top-Level Domain (.${tld})`,
      explanation: `The link is registered under the ".${tld}" extension, which has a statistically elevated frequency of abuse in disposable phishing operations.`,
      evidence: `.${tld}`,
      technicalDetail: 'Certain TLD registries offer cheap or free domain registrations with relaxed identity validation, making them preferred by disposable phishing campaign operators.',
      mitigationAdvice: 'Check why an established enterprise or service would be communicating via an uncommon generic TLD.'
    });
    flaggedPhrases.push(`TLD: .${tld}`);
  }

  // 10. Suspicious Path & Credential Keywords
  const sensitivePathTerms = [
    'login', 'signin', 'sign-in', 'log-in', 'verify', 'verification', 'update',
    'security', 'banking', 'account-update', 'recover', 'wallet', 'auth',
    'confirm', 'password', 'webscr', 'cmd=_login', 'secure-portal', 'passcode'
  ];
  const matchedPathTerms = sensitivePathTerms.filter(term =>
    pathname.toLowerCase().includes(term) || search.toLowerCase().includes(term)
  );

  if (matchedPathTerms.length > 0) {
    findings.push({
      id: 'url-sensitive-path-keywords',
      category: 'content',
      severity: 'MEDIUM',
      title: 'Credential & Authentication Lure Keywords in Path',
      explanation: `The URL path explicitly targets credential or security actions: "${matchedPathTerms.join(', ')}".`,
      evidence: matchedPathTerms.join(', '),
      technicalDetail: 'Phishing landing paths emulate genuine administrative or session-recovery endpoints to psychologically prompt the victim into entering login data.',
      mitigationAdvice: 'Ensure the root domain is verified before entering sensitive account data on any page containing login or verification paths.'
    });
    flaggedPhrases.push(...matchedPathTerms);
  }

  // 11. Open Redirection / Forwarding Query Parameters
  const redirectParams = ['redirect', 'url', 'return', 'goto', 'target', 'dest', 'destination', 'link'];
  const hasRedirectParam = redirectParams.some(param => {
    const regex = new RegExp(`[?&]${param}=https?%3A%2F%2F|[?&]${param}=https?://`, 'i');
    return regex.test(cleanInput);
  });
  if (hasRedirectParam) {
    findings.push({
      id: 'url-open-redirect-pattern',
      category: 'structural',
      severity: 'HIGH',
      title: 'Potential Open Redirection Parameter',
      explanation: 'The link contains a secondary redirection parameter instructing the server to immediately forward the browser elsewhere.',
      evidence: 'Embedded redirection parameter',
      technicalDetail: 'Open redirect vulnerabilities allow attackers to use a reputable domain as a lure, which then immediately forwards the user to a malicious destination.',
      mitigationAdvice: 'Examine the embedded destination address inside the URL parameters.'
    });
    flaggedPhrases.push('Open Redirection Parameter');
  }

  // 12. Suspicious URL Length
  if (cleanInput.length > 120) {
    findings.push({
      id: 'url-excessive-length',
      category: 'structural',
      severity: 'LOW',
      title: 'Abnormally Long URL Structure',
      explanation: `The URL length (${cleanInput.length} characters) is unusually long, which can be used to hide the true destination off-screen on mobile devices.`,
      evidence: `${cleanInput.length} characters`,
      technicalDetail: 'Extended query strings and padding paths are sometimes used to push malicious elements past visible browser address truncated viewports.',
      mitigationAdvice: 'Be cautious of URLs that are excessively long and difficult to inspect manually.'
    });
  }

  // 13. URL Encoded Obfuscation (% hex characters)
  const hexCount = (cleanInput.match(/%[0-9a-fA-F]{2}/g) || []).length;
  if (hexCount > 4) {
    findings.push({
      id: 'url-hex-obfuscation',
      category: 'structural',
      severity: 'MEDIUM',
      title: 'Heavy URL Percent-Encoding Obfuscation',
      explanation: `The address contains ${hexCount} percent-encoded hex sequences, obscuring the plain-text destination.`,
      evidence: `${hexCount} encoded entities`,
      technicalDetail: 'Attackers use multiple layers of percent-encoding to evade basic keyword filters and anti-spam scanners.',
      mitigationAdvice: 'Examine decoded text if you have legitimate cause to verify the destination.'
    });
    flaggedPhrases.push('Hex encoded characters');
  }

  // Calculate Risk Score
  const score = calculateRiskScore(findings);
  const riskLevel = determineRiskLevel(score);
  const summaryWhy = generateSummaryWhy('url', riskLevel, findings);
  const recommendations = generateRecommendations(riskLevel, findings);

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'url',
    inputRaw: cleanInput,
    inputSummary: sanitizeInputSummary(cleanInput, 65),
    riskScore: score,
    riskLevel,
    summaryWhy,
    findings,
    evidenceMap: {
      parsedType: 'url',
      primarySubject: hostname || cleanInput,
      components: {
        Protocol: protocol || (cleanInput.startsWith('http://') ? 'http:' : 'https (implied)'),
        Hostname: hostname || 'Not resolved',
        RootDomain: rootDomain || 'N/A',
        SubdomainCount: Math.max(0, hostLabels.length - 2),
        Path: pathname || '/',
        QueryParameters: search || 'None',
        NonStandardPort: port || 'None (Default 80/443)',
        TotalLength: `${cleanInput.length} characters`
      },
      flaggedPhrases
    },
    recommendations,
    inspectedAt: new Date().toISOString(),
    engineVersion: 'Explainable Rule Engine v2.4'
  };
}

/**
 * Core Rule-Based Email & Message Analysis
 */
export function analyzeMessage(rawInput: string, analysisType: 'email' | 'message' = 'email'): AnalysisResult {
  const cleanInput = rawInput.trim();
  const lower = cleanInput.toLowerCase();
  const findings: Finding[] = [];
  const flaggedPhrases: string[] = [];

  // Helper for phrase matching with evidence recording
  const checkPhrases = (
    patterns: { regex: RegExp; phrase: string }[],
    category: Finding['category'],
    severity: SignalSeverity,
    id: string,
    title: string,
    explanation: string,
    technicalDetail: string,
    mitigationAdvice: string
  ) => {
    const matches: string[] = [];
    for (const pat of patterns) {
      if (pat.regex.test(cleanInput)) {
        matches.push(pat.phrase);
        flaggedPhrases.push(pat.phrase);
      }
    }
    if (matches.length > 0) {
      findings.push({
        id,
        category,
        severity,
        title,
        explanation,
        evidence: matches.slice(0, 4).join(', '),
        technicalDetail,
        mitigationAdvice
      });
    }
  };

  // 1. High Urgency & Immediate Action Pressure
  const urgencyPatterns = [
    { regex: /\b(within 24 hours|within 12 hours|within 1 hour|within 10 minutes|immediately|urgent action required|immediate action|act now|expires today|final notice|deadline)\b/i, phrase: 'Urgency deadline' },
    { regex: /\b(right away|without delay|as soon as possible|prompt response required|time sensitive)\b/i, phrase: 'Immediacy trigger' }
  ];
  checkPhrases(
    urgencyPatterns,
    'social_engineering',
    'HIGH',
    'msg-urgency-pressure',
    'Urgency & Artificial Time Pressure',
    'The message uses psychological urgency to pressure you into acting hastily before having time to verify its legitimacy.',
    'Social engineering relies on inducing emotional panic or scarcity so the target skips standard security procedures.',
    'Pause and independently verify the claimed situation through official contact channels.'
  );

  // 2. Coercive Threats & Severe Consequences
  const threatPatterns = [
    { regex: /\b(account.*(suspended|terminated|disabled|locked|closed)|will be (suspended|terminated|locked|closed))\b/i, phrase: 'Account suspension threat' },
    { regex: /\b(legal action|arrest warrant|police report|law enforcement|court attendance|subpoena|penalty fee|prosecution)\b/i, phrase: 'Legal / criminal threat' },
    { regex: /\b(loss of access|permanent deactivation|freeze your funds|block your card)\b/i, phrase: 'Access loss threat' }
  ];
  checkPhrases(
    threatPatterns,
    'social_engineering',
    'CRITICAL',
    'msg-coercive-threats',
    'Intimidation & Penalty Threats',
    'The message threatens negative consequences such as account termination, financial penalties, or legal action.',
    'Attackers use intimidating threats to provoke fear, an instinctive emotional response that impairs critical judgment.',
    'Reputable organizations do not demand emergency security actions via threatening ultimatum messages.'
  );

  // 3. Credential Harvesting & Sensitive Verification
  const credentialPatterns = [
    { regex: /\b(enter your password|confirm your password|provide your pin|security pin|two-factor code|2fa code|verification code|one-time code|otp)\b/i, phrase: 'Direct credential / OTP request' },
    { regex: /\b(confirm your credentials|verify your login|update your account details|confirm your identity)\b/i, phrase: 'Account credential verification lure' },
    { regex: /\b(social security|ssn|mother's maiden name|date of birth|national identity)\b/i, phrase: 'Personal identity identifier request' }
  ];
  checkPhrases(
    credentialPatterns,
    'content',
    'CRITICAL',
    'msg-credential-harvesting',
    'Direct Credential or Authentication Secret Request',
    'The message solicits sensitive security credentials (passwords, PINs, OTP codes, or personal identity numbers).',
    'Legitimate security administrators, banks, and platforms will NEVER ask for your password, PIN, or multi-factor authentication codes in a message.',
    'Never provide passwords, OTPs, or verification codes in response to an email, SMS, or direct message.'
  );

  // 4. Financial Demands, Wire Transfers & Cryptocurrencies
  const financialPatterns = [
    { regex: /\b(wire transfer|western union|moneygram|unpaid invoice|outstanding payment|overdue balance)\b/i, phrase: 'Unsolicited payment demand' },
    { regex: /\b(bitcoin|crypto|ethereum|usdt|gift card|itunes card|google play card|steam card|prepaid card)\b/i, phrase: 'Untraceable payment method' },
    { regex: /\b(remittance|bank transfer required|account overdue|payment received confirmation)\b/i, phrase: 'Financial transfer lure' }
  ];
  checkPhrases(
    financialPatterns,
    'content',
    'HIGH',
    'msg-financial-transfer-demand',
    'Financial Transfer or Alternative Payment Lure',
    'The message requests money transfers or references atypical payment methods like gift cards or cryptocurrency.',
    'Unsolicited payment requests—especially those demanding untraceable payment instruments—are hallmark indicators of business email compromise (BEC) and fraud.',
    'Always verify any payment instructions or invoice changes over a pre-established, trusted telephone number.'
  );

  // 5. Suspicious Links / Click Redirection Calls-to-Action
  const linkCtaPatterns = [
    { regex: /\b(click here|click the link|tap here|tap the link|follow this link|visit the portal|access your account here|verify here)\b/i, phrase: 'Click redirection CTA' },
    { regex: /\b(https?:\/\/|www\.)/i, phrase: 'Embedded URL string' }
  ];
  checkPhrases(
    linkCtaPatterns,
    'content',
    'MEDIUM',
    'msg-click-redirection-cta',
    'Embedded Link Call-to-Action',
    'The text contains prominent directives instructing you to follow a hyperlink rather than navigating normally.',
    'Attackers funnel victims toward malicious replica sites by providing direct clickable paths disguised as convenient shortcuts.',
    'Instead of clicking the link in the message, open your web browser and navigate to the official website manually.'
  );

  // 6. Generic or Impersonal Salutation
  const greetingPatterns = [
    { regex: /\b(dear customer|dear user|dear client|dear member|dear account holder|valued customer|attention user|dear sir\/madam|hello user)\b/i, phrase: 'Generic impersonal greeting' }
  ];
  checkPhrases(
    greetingPatterns,
    'social_engineering',
    'LOW',
    'msg-generic-greeting',
    'Generic Impersonal Salutation',
    'The sender addresses you with a generic placeholder ("Dear Customer", "Dear User") rather than your actual registered name.',
    'Mass phishing campaigns operate at scale without specific recipient databases and commonly deploy blanket generic salutations.',
    'Services you do business with usually address you by your verified first and last name.'
  );

  // 7. Impersonation of Authoritative Departments
  const impersonationPatterns = [
    { regex: /\b(security team|fraud department|fraud prevention|internal it|it helpdesk|system administrator|global support team|billing department)\b/i, phrase: 'Departmental authority claim' },
    { regex: /\b(microsoft support|paypal security|apple support|amazon customer care|irs alert|tax refund)\b/i, phrase: 'Brand identity claim' }
  ];
  checkPhrases(
    impersonationPatterns,
    'identity',
    'HIGH',
    'msg-authority-impersonation',
    'Authority or Departmental Impersonation',
    'The communication claims to originate from a high-authority body (Security, Fraud, Helpdesk, or Brand Support).',
    'Pretexting uses fabricated roles to project institutional power, discouraging the recipient from questioning the request.',
    'Contact the purported department through known internal corporate directories or official published support numbers.'
  );

  // 8. Dangerous File Attachment Lures
  const attachmentPatterns = [
    { regex: /\b(attached invoice|see attached|attached file|download attachment|remittance\.pdf|invoice\.zip|\.exe|\.scr|\.iso|\.vbs|\.bat|\.docm)\b/i, phrase: 'Dangerous attachment reference' }
  ];
  checkPhrases(
    attachmentPatterns,
    'content',
    'HIGH',
    'msg-attachment-lure',
    'Suspicious File Attachment Reference',
    'The message refers to an attached file or archive that could conceal executable malware or malicious macros.',
    'Malicious attachments (zip archives, disk images, macro-enabled documents) are primary delivery vectors for infostealers and ransomware.',
    'Do not download or open unsolicited email attachments.'
  );

  // 9. Executive / Secretive Social Engineering Pretexting
  const pretextingPatterns = [
    { regex: /\b(strictly confidential|keep this between us|are you at your desk|i am in a meeting|do not call me|quick favor)\b/i, phrase: 'CEO / Executive pretext' }
  ];
  checkPhrases(
    pretextingPatterns,
    'social_engineering',
    'HIGH',
    'msg-executive-pretexting',
    'Executive Impersonation & Secrecy Pretext',
    'The sender requests secrecy or claims to be an executive in a meeting who cannot take phone calls.',
    'CEO fraud (whaling) relies on simulated executive authority and manufactured communication constraints to execute wire fraud or gift card theft.',
    'Verify executive requests via an out-of-band channel (e.g., standard voice call or in-person check).'
  );

  // Check for any embedded URLs inside message to run secondary URL heuristics
  const urlMatches = cleanInput.match(/https?:\/\/[^\s]+/gi);
  if (urlMatches && urlMatches.length > 0) {
    const firstUrl = urlMatches[0];
    const urlAnalysis = analyzeUrl(firstUrl);
    if (urlAnalysis.findings.length > 0) {
      for (const f of urlAnalysis.findings) {
        findings.push({
          ...f,
          id: `embedded-${f.id}`,
          title: `Embedded Link: ${f.title}`,
          explanation: `In the embedded link (${firstUrl.substring(0, 35)}...): ${f.explanation}`
        });
      }
    }
  }

  // Calculate Risk Score
  const score = calculateRiskScore(findings);
  const riskLevel = determineRiskLevel(score);
  const summaryWhy = generateSummaryWhy(analysisType, riskLevel, findings);
  const recommendations = generateRecommendations(riskLevel, findings);

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: analysisType,
    inputRaw: cleanInput,
    inputSummary: sanitizeInputSummary(cleanInput, 65),
    riskScore: score,
    riskLevel,
    summaryWhy,
    findings,
    evidenceMap: {
      parsedType: analysisType,
      primarySubject: `${analysisType.toUpperCase()} Content (${cleanInput.length} chars)`,
      components: {
        Type: analysisType.toUpperCase(),
        CharacterCount: cleanInput.length,
        WordCount: cleanInput.split(/\s+/).filter(Boolean).length,
        SignalsIdentified: findings.length,
        EmbeddedLinksDetected: urlMatches ? urlMatches.length : 0,
        HasUrgencyIndicators: urgencyPatterns.some(p => p.regex.test(cleanInput)),
        HasCredentialRequests: credentialPatterns.some(p => p.regex.test(cleanInput)),
        HasFinancialRequests: financialPatterns.some(p => p.regex.test(cleanInput))
      },
      flaggedPhrases
    },
    recommendations,
    inspectedAt: new Date().toISOString(),
    engineVersion: 'Explainable Rule Engine v2.4'
  };
}

/**
 * Universal Heuristic Risk Score Computation (0-100)
 */
function calculateRiskScore(findings: Finding[]): number {
  if (findings.length === 0) return 6; // Clean baseline

  let score = 8;
  const weights: Record<SignalSeverity, number> = {
    CRITICAL: 34,
    HIGH: 20,
    MEDIUM: 11,
    LOW: 5,
    INFORMATIONAL: 2
  };

  for (const finding of findings) {
    score += weights[finding.severity] || 5;
  }

  // Cap between 6 and 99 (or 100 for multiple criticals)
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  if (criticalCount >= 2 && score >= 90) return 99;
  return Math.min(Math.max(score, 6), 98);
}

/**
 * Deterministic Risk Level Thresholds
 */
function determineRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'HIGH RISK';
  if (score >= 50) return 'SUSPICIOUS';
  if (score >= 25) return 'CAUTION';
  return 'LOW';
}

/**
 * Human-Explainable "WHY THIS RESULT" Synthesizer
 */
function generateSummaryWhy(type: AnalysisType, riskLevel: RiskLevel, findings: Finding[]): string {
  if (findings.length === 0) {
    return 'No overt phishing patterns, coercive triggers, or structural deceptions were detected during this rule-based evaluation.';
  }

  const criticals = findings.filter(f => f.severity === 'CRITICAL');
  const highs = findings.filter(f => f.severity === 'HIGH');
  const primaryConcerns = [...criticals, ...highs].slice(0, 2).map(f => f.title);

  if (riskLevel === 'HIGH RISK') {
    return `Elevated threat profile: Multiple critical phishing indicators were flagged, including ${primaryConcerns.join(' and ')}. These patterns strongly suggest a deceptive campaign designed to harvest sensitive information or mislead the recipient.`;
  }

  if (riskLevel === 'SUSPICIOUS') {
    return `Suspicious signals detected: The input exhibits indicators frequently leveraged in social-engineering or deceptive addressing, primarily ${primaryConcerns.join(' and ')}. Elevated caution is advised before trusting this communication.`;
  }

  if (riskLevel === 'CAUTION') {
    return `Minor risk indicators observed: A few unusual signals or formatting anomalies were noted (${findings.map(f => f.title).slice(0, 2).join(', ')}). While not conclusive evidence of fraud, standard verification precautions apply.`;
  }

  return 'The inspection completed with low risk findings. Standard security hygiene is still recommended for all unsolicited messages.';
}

/**
 * Actionable "WHAT SHOULD YOU DO?" Defense Directives
 */
function generateRecommendations(riskLevel: RiskLevel, findings: Finding[]): string[] {
  const actions: string[] = [];

  if (riskLevel === 'HIGH RISK') {
    actions.push('Do NOT click any links, open attachments, or reply to this message.');
    actions.push('Do NOT provide passwords, one-time verification PINs, or financial details.');
    actions.push('If you already entered credentials, immediately change your password on the official website and enable multi-factor authentication (MFA).');
    actions.push('Verify the communication through an independent, pre-established channel (such as dialing the official customer phone number printed on your card or statement).');
    actions.push('Report this message to your organization’s security team or submit it to abuse reporting channels.');
    return actions;
  }

  if (riskLevel === 'SUSPICIOUS') {
    actions.push('Do not interact directly with embedded links or call-to-actions in the communication.');
    actions.push('Open a new browser window and type the organization’s verified official web address manually.');
    actions.push('Confirm whether any urgent action is genuinely required by logging into your official account dashboard directly.');
    actions.push('Check the sender address carefully for slight misspellings or unauthorized domain variations.');
    return actions;
  }

  if (riskLevel === 'CAUTION') {
    actions.push('Verify the sender identity before taking requested steps.');
    actions.push('Hover over or inspect destination web addresses before clicking.');
    actions.push('Confirm that any financial or policy changes are validated through official internal policy.');
    return actions;
  }

  // LOW
  actions.push('Maintain standard security awareness when receiving unsolicited links or communications.');
  actions.push('Always ensure connections to sensitive sites utilize valid HTTPS certificates.');
  actions.push('Never share one-time security passcodes with third parties under any circumstances.');
  return actions;
}

/**
 * Universal Dispatcher: Auto-detects URL vs Message
 */
export function analyzeThreatInput(input: string, forceType?: AnalysisType): AnalysisResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Please paste a valid URL, email body, or message text to analyze.');
  }

  if (forceType === 'url') return analyzeUrl(trimmed);
  if (forceType === 'email') return analyzeMessage(trimmed, 'email');
  if (forceType === 'message') return analyzeMessage(trimmed, 'message');

  // Auto-detection: Does it resemble a standalone URL?
  const looksLikeUrl =
    /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})[^\s]*$/i.test(trimmed) &&
    !trimmed.includes('\n') &&
    trimmed.split(' ').length === 1;

  if (looksLikeUrl) {
    return analyzeUrl(trimmed);
  }

  // If multi-line or contains typical email headers/greetings, treat as email, else message
  if (trimmed.includes('Subject:') || trimmed.includes('From:') || trimmed.includes('\n\n')) {
    return analyzeMessage(trimmed, 'email');
  }

  return analyzeMessage(trimmed, 'message');
}
