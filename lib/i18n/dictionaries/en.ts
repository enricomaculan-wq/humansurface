export type Dictionary = {
  common: {
    brand: string
    language: string
    localeName: string
    actions: {
      cancel: string
      close: string
      contactSupport: string
      createAccount: string
      login: string
      logout: string
      print: string
      requestCall: string
      saveChanges: string
    }
    status: {
      archived: string
      completed: string
      draft: string
      expired: string
      failed: string
      inReview: string
      paid: string
      pending: string
      pendingPayment: string
      processing: string
      published: string
      queued: string
      running: string
      unknown: string
    }
    risk: {
      critical: string
      high: string
      medium: string
      moderate: string
      low: string
      unknown: string
    }
  }
  auth: {
    eyebrow: string
    loginTitle: string
    loginDescription: string
    signupTitle: string
    signupDescription: string
    form: {
      emailLabel: string
      emailPlaceholder: string
      passwordLabel: string
      passwordPlaceholder: string
      authFailed: string
      invalidCredentials: string
      emailNotConfirmed: string
      emailAlreadyRegistered: string
      weakPassword: string
      tooManyAttempts: string
      pleaseWait: string
      loginSubmit: string
      signupSubmit: string
    }
  }
  buy: {
    eyebrow: string
    title: string
    description: string
    expectationTitle: string
    expectationText: string
    focusTitle: string
    focusItems: string[]
    reasonsTitle: string
    reasonItems: string[]
    deliveryTitle: string
    deliveryText: string
    formEyebrow: string
    formTitle: string
    formDescription: string
    form: {
      fullNameLabel: string
      fullNamePlaceholder: string
      companyNameLabel: string
      companyNamePlaceholder: string
      domainLabel: string
      domainPlaceholder: string
      emailLabel: string
      emailPlaceholder: string
      roleLabel: string
      rolePlaceholder: string
      companySizeLabel: string
      companySizePlaceholder: string
      notesLabel: string
      notesPlaceholder: string
      reviewNotice: string
      errorFallback: string
      networkError: string
      fullNameRequired: string
      companyNameRequired: string
      domainInvalid: string
      emailInvalid: string
      tooManyRequests: string
      successMessage: string
      submit: string
      submitting: string
    }
  }
  thankYou: {
    eyebrow: string
    title: string
    intro: string
    nextTitle: string
    nextItems: string[]
    timingTitle: string
    timingItems: string[]
    contactPrefix: string
    importantTitle: string
    importantText: string
    backHome: string
  }
  legal: {
    eyebrow: string
    contactTitle: string
    privacyTitle: string
    privacySections: Array<{
      title: string
      body: string
    }>
    privacyContactIntro: string
    termsTitle: string
    termsSections: Array<{
      title: string
      body: string
    }>
    termsContactIntro: string
  }
  assessmentPending: {
    eyebrow: string
    title: string
    intro: string
    deliveryTitle: string
    deliveryText: string
    nextTitle: string
    nextItems: string[]
    clientAccessTitle: string
    clientAccessText: string
    referenceLabel: string
  }
  clientArea: {
    eyebrow: string
    title: string
    description: string
    requestAssessment: string
    noLinkedTitle: string
    noLinkedText: string
    paymentLabel: string
    billingLabel: string
    assessmentLabel: string
    createdLabel: string
    summaryTitle: string
    overallScoreLabel: string
    riskLevelLabel: string
    publishedLabel: string
    orderRecordedText: string
    viewStatus: string
    openReport: string
    anotherEyebrow: string
    anotherTitle: string
    anotherText: string
    availability: Record<'draft' | 'inReview' | 'published' | 'archived' | 'unknown', string>
  }
  assessmentStatus: {
    eyebrow: string
    fallbackTitle: string
    createdLabel: string
    referenceTitle: string
    deliveryTitle: string
    contactSupport: string
    backToClientArea: string
    states: {
      draft: {
        eyebrow: string
        title: string
        description: string
        deliveryText: string
      }
      inReview: {
        eyebrow: string
        title: string
        description: string
        deliveryText: string
      }
      archived: {
        eyebrow: string
        title: string
        description: string
      }
    }
  }
  assessmentReport: {
    clientReportEyebrow: string
    unknownOrganization: string
    unknownPerson: string
    publishedLabel: string
    printReport: string
    reportEyebrow: string
    executiveSummaryTitle: string
    executiveSummarySubtitle: string
    overallScoreLabel: string
    scoreLabels: {
      overall: string
      impersonation: string
      financeFraud: string
      hrSocial: string
    }
    sections: {
      topFindings: string
      topFindingsSubtitle: string
      exposedPeople: string
      externalExposure: string
      whatChanged: string
      whyThisMatters: string
      immediateRecommendations: string
      strategicRecommendations: string
    }
    metrics: {
      externalSourcesScanned: string
      externalSignalsAccepted: string
      externalPeopleDetected: string
      externalFindings: string
      pagesScanned: string
      peopleDetected: string
      findingsRecorded: string
      signalsLinkedToPeople: string
    }
    emptyStates: {
      noFindings: string
      noPersonScores: string
      noExternalFindings: string
      initialPublishedVersion: string
    }
    externalSource: string
    externalSourceDomains: string
    whyThisMattersText: string
    executiveSummary: {
      intro: string
      score: string
      findings: string
      noFindings: string
      people: string
      noPeople: string
      organizationFallback: string
    }
    whatChanged: {
      externalSignalsAccepted: string
      externalPeopleDetected: string
      externalFindingsInserted: string
      peopleDetected: string
      findingsInserted: string
    }
    fallbackImmediateRecommendations: string[]
    strategicRecommendations: string[]
  }
}

export const en: Dictionary = {
  common: {
    brand: 'HumanSurface',
    language: 'Language',
    localeName: 'English',
    actions: {
      cancel: 'Cancel',
      close: 'Close',
      contactSupport: 'Contact support',
      createAccount: 'Create account',
      login: 'Login',
      logout: 'Logout',
      print: 'Print',
      requestCall: 'Request a call',
      saveChanges: 'Save changes',
    },
    status: {
      archived: 'Archived',
      completed: 'Completed',
      draft: 'Draft',
      expired: 'Expired',
      failed: 'Failed',
      inReview: 'In review',
      paid: 'Paid',
      pending: 'Pending',
      pendingPayment: 'Pending payment',
      processing: 'Processing',
      published: 'Published',
      queued: 'Queued',
      running: 'Running',
      unknown: 'Unknown',
    },
    risk: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      moderate: 'Moderate',
      low: 'Low',
      unknown: 'Unknown',
    },
  },
  auth: {
    eyebrow: 'Client access',
    loginTitle: 'Login',
    loginDescription:
      'Access your HumanSurface account and view your assessment status.',
    signupTitle: 'Create account',
    signupDescription:
      'Create your HumanSurface account to access assessment status and reports.',
    form: {
      emailLabel: 'Email',
      emailPlaceholder: 'name@company.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Your password',
      authFailed: 'Authentication failed.',
      invalidCredentials: 'Email or password is incorrect.',
      emailNotConfirmed: 'Please confirm your email before logging in.',
      emailAlreadyRegistered:
        'An account with this email already exists. Try logging in instead.',
      weakPassword: 'Please choose a stronger password.',
      tooManyAttempts: 'Too many attempts. Please wait a moment and try again.',
      pleaseWait: 'Please wait...',
      loginSubmit: 'Login',
      signupSubmit: 'Create account',
    },
  },
  buy: {
    eyebrow: 'HumanSurface',
    title: 'Request a HumanSurface intro call',
    description:
      'Tell us a bit about your company and exposure priorities. We will review your request and get back to you to schedule a short intro call.',
    expectationTitle: 'What to expect',
    expectationText:
      'HumanSurface is designed as a reviewed exposure assessment, not an instant low-value scan. We usually reply within 1 business day to understand fit, priorities, and next steps.',
    focusTitle: 'What HumanSurface focuses on',
    focusItems: [
      'Public exposure supporting impersonation attempts',
      'Finance and invoice-fraud enabling signals',
      'HR and executive-targeted social engineering exposure',
      'Visible roles, contact paths, and public business context',
    ],
    reasonsTitle: 'Why companies book a call first',
    reasonItems: [
      'To understand whether the service fits their exposure profile',
      'To align on priorities and decision context',
      'To review expected output and delivery approach',
      'To keep the process consultative and high-signal',
    ],
    deliveryTitle: 'Delivery model',
    deliveryText:
      'Each assessment is reviewed before publication to preserve clarity, consistency, and decision value. A short intro call helps define scope and confirm the right next step before activation.',
    formEyebrow: 'Request a call',
    formTitle: 'Book an intro conversation',
    formDescription:
      'Share your company details and a brief description of what you want to assess. We will review the request and contact you to arrange a short call.',
    form: {
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'Example: Mario Rossi',
      companyNameLabel: 'Company name',
      companyNamePlaceholder: 'Example: HumanSurface Srl',
      domainLabel: 'Company domain',
      domainPlaceholder: 'example.com',
      emailLabel: 'Work email',
      emailPlaceholder: 'name@company.com',
      roleLabel: 'Role',
      rolePlaceholder: 'Example: CEO, IT Manager, CFO',
      companySizeLabel: 'Company size',
      companySizePlaceholder: 'Select company size',
      notesLabel: 'What would you like to assess?',
      notesPlaceholder: 'Priorities, concerns, urgency, business context...',
      reviewNotice:
        'We review each request manually and usually reply within 1 business day to arrange a short intro call.',
      errorFallback: 'Error while sending the request.',
      networkError: 'Network error. Please try again.',
      fullNameRequired: 'Please enter your full name.',
      companyNameRequired: 'Please enter your company name.',
      domainInvalid: 'Please enter a valid company domain.',
      emailInvalid: 'Please enter a valid work email.',
      tooManyRequests: 'Too many requests. Please try again later.',
      successMessage:
        'Thanks — your request has been received. We will get back to you shortly to arrange a call.',
      submit: 'Request a call',
      submitting: 'Sending request...',
    },
  },
  thankYou: {
    eyebrow: 'Request received',
    title: 'Thanks for your consultation request',
    intro:
      'Your HumanSurface request has been successfully submitted. We have received your company details and will review the context before suggesting the next step.',
    nextTitle: 'What happens next',
    nextItems: [
      'We review your submitted company details.',
      'We contact you to arrange a short intro call.',
      'If there is a fit, we agree scope and next steps together.',
    ],
    timingTitle: 'Delivery timing',
    timingItems: [
      'Initial response target: 1–2 business days.',
      'Assessment delivery timing may vary by company profile.',
    ],
    contactPrefix: 'For questions, contact us at',
    importantTitle: 'Important',
    importantText:
      'If you need to update the submitted domain or company details, contact us as soon as possible so we can review the right context.',
    backHome: 'Back to homepage',
  },
  legal: {
    eyebrow: 'Legal',
    contactTitle: 'Contact',
    privacyTitle: 'Privacy Policy',
    privacySections: [
      {
        title: '1. Data controller',
        body: 'HumanSurface processes personal data in connection with assessment requests, billing completion, customer support, and service delivery.',
      },
      {
        title: '2. Data we collect',
        body: 'We may collect contact details, company details, billing information, payment-related metadata, and information submitted through forms on this website.',
      },
      {
        title: '3. Purpose of processing',
        body: 'We process data to provide the HumanSurface service, manage billing and invoicing, communicate with customers, improve the service, and comply with legal obligations.',
      },
      {
        title: '4. Third-party providers',
        body: 'Payments may be processed by Stripe. Hosting, infrastructure, database, and technical delivery may involve external service providers acting as processors.',
      },
      {
        title: '5. Data retention',
        body: 'Personal data is retained only for as long as necessary to provide the service, manage accounting and legal obligations, and maintain service records.',
      },
      {
        title: '6. User rights',
        body: 'Where applicable, users may request access, correction, deletion, restriction, portability, or objection regarding their personal data, subject to applicable law.',
      },
    ],
    privacyContactIntro: 'For privacy-related requests, contact:',
    termsTitle: 'Terms of Service',
    termsSections: [
      {
        title: '1. Service',
        body: 'HumanSurface provides exposure assessment services focused on public company visibility, people and role exposure, phishing and fraud scenarios, and related reporting.',
      },
      {
        title: '2. Nature of the output',
        body: 'The service supports awareness, risk visibility, and prioritization. It does not guarantee the absence of security issues, fraud attempts, or malicious activity.',
      },
      {
        title: '3. Delivery timing',
        body: 'Unless otherwise agreed, the assessment is generally made available within 2 business days after payment and completion of required billing information.',
      },
      {
        title: '4. Customer responsibilities',
        body: 'The customer is responsible for providing accurate company, domain, and billing information and for ensuring that the requested assessment is lawful and authorized.',
      },
      {
        title: '5. Payments and invoicing',
        body: 'Payments are collected in advance. Billing details may be requested after payment and before invoice issuance.',
      },
      {
        title: '6. Refunds',
        body: 'Refund requests, if any, are evaluated case by case, especially where service delivery has already started or assessment work has already been performed.',
      },
      {
        title: '7. Limitation of liability',
        body: 'To the maximum extent permitted by law, HumanSurface is not liable for indirect, incidental, or consequential damages arising from use of the service or reliance on assessment outputs.',
      },
    ],
    termsContactIntro: 'For support or legal inquiries:',
  },
  assessmentPending: {
    eyebrow: 'Assessment in preparation',
    title: 'Your HumanSurface Assessment is being prepared',
    intro:
      'We are now processing your company’s public exposure and preparing your assessment output.',
    deliveryTitle: 'Delivery timing',
    deliveryText:
      'Your report will be available within 2 business days. In many cases, delivery happens earlier.',
    nextTitle: 'What happens next',
    nextItems: [
      'We finalize the assessment processing.',
      'We generate your HumanSurface report.',
      'Your results will be made available once ready.',
    ],
    clientAccessTitle: 'Client access',
    clientAccessText:
      'To track your assessment later from the client area, create an account using the same email address used for your request.',
    referenceLabel: 'Assessment reference',
  },
  clientArea: {
    eyebrow: 'Client area',
    title: 'Your assessments',
    description:
      'Track the publication status of your HumanSurface assessments and access reports once they are released.',
    requestAssessment: 'Request assessment',
    noLinkedTitle: 'No assessment account linked yet',
    noLinkedText:
      'This account is not linked to any company profile yet. You can request a new HumanSurface assessment or contact support if you already requested one with a different email address.',
    paymentLabel: 'Payment',
    billingLabel: 'Billing',
    assessmentLabel: 'Assessment',
    createdLabel: 'Created',
    summaryTitle: 'Assessment summary',
    overallScoreLabel: 'Overall score',
    riskLevelLabel: 'Risk level',
    publishedLabel: 'Published',
    orderRecordedText:
      'Your order has been recorded. The assessment will appear here as soon as it is created.',
    viewStatus: 'View status',
    openReport: 'Open report',
    anotherEyebrow: 'Need another assessment?',
    anotherTitle: 'Request a new HumanSurface assessment',
    anotherText:
      'You can request another assessment for a different company, domain, or a new review cycle for the same organization.',
    availability: {
      draft:
        'Your assessment is being prepared. Delivery is typically within 2 business days, often sooner.',
      inReview:
        'Your assessment is in final review. Your report will become available once publication is complete.',
      published: 'Your assessment report is now available.',
      archived:
        'This assessment has been archived. Contact support if you need a new assessment cycle.',
      unknown: 'Assessment status is currently unavailable.',
    },
  },
  assessmentStatus: {
    eyebrow: 'Assessment status',
    fallbackTitle: 'HumanSurface Assessment',
    createdLabel: 'Created',
    referenceTitle: 'Assessment reference',
    deliveryTitle: 'Delivery timing',
    contactSupport: 'Contact support',
    backToClientArea: 'Back to client area',
    states: {
      draft: {
        eyebrow: 'In preparation',
        title: 'Your assessment is being prepared',
        description:
          'We are analyzing your organization’s public exposure and preparing your assessment output.',
        deliveryText:
          'Each assessment is reviewed before publication. Your report will be available within 2 business days, and often sooner.',
      },
      inReview: {
        eyebrow: 'Final review',
        title: 'Your assessment is in final review',
        description:
          'Your report is being finalized for publication. This review step helps ensure a clearer and more reliable output.',
        deliveryText:
          'Delivery is typically within 2 business days from order completion, and often earlier.',
      },
      archived: {
        eyebrow: 'Archived',
        title: 'This assessment has been archived',
        description:
          'This report is no longer the active published version. Contact support if you need assistance or a new assessment cycle.',
      },
    },
  },
  assessmentReport: {
    clientReportEyebrow: 'Client report',
    unknownOrganization: 'Unknown organization',
    unknownPerson: 'Unknown person',
    publishedLabel: 'Published',
    printReport: 'Print report',
    reportEyebrow: 'HumanSurface report',
    executiveSummaryTitle: 'Executive summary',
    executiveSummarySubtitle:
      'Summary of public exposure that may support phishing, impersonation, and fraud scenarios.',
    overallScoreLabel: 'Overall score',
    scoreLabels: {
      overall: 'Overall',
      impersonation: 'Impersonation',
      financeFraud: 'Finance Fraud',
      hrSocial: 'HR / Social',
    },
    sections: {
      topFindings: 'Top findings',
      topFindingsSubtitle:
        'Highest-priority findings currently included in your report.',
      exposedPeople: 'Most exposed people / roles',
      externalExposure: 'External exposure',
      whatChanged: 'What changed',
      whyThisMatters: 'Why this matters',
      immediateRecommendations: 'Immediate recommendations',
      strategicRecommendations: 'Strategic recommendations',
    },
    metrics: {
      externalSourcesScanned: 'External sources scanned',
      externalSignalsAccepted: 'External signals accepted',
      externalPeopleDetected: 'External people detected',
      externalFindings: 'External findings',
      pagesScanned: 'Pages scanned',
      peopleDetected: 'People detected',
      findingsRecorded: 'Findings recorded',
      signalsLinkedToPeople: 'Signals linked to people',
    },
    emptyStates: {
      noFindings: 'No findings available.',
      noPersonScores: 'No person-level scores available.',
      noExternalFindings:
        'No dedicated external findings were rendered for this assessment.',
      initialPublishedVersion: 'Initial published version.',
    },
    externalSource: 'External source',
    externalSourceDomains: 'External source domains',
    whyThisMattersText:
      'Public leadership visibility, externally discoverable roles, and repeated exposure signals increase the credibility of impersonation, invoice fraud, and social engineering attempts against your organization.',
    executiveSummary: {
      intro:
        'This report summarizes the public human-surface exposure currently visible for {organization}.',
      score:
        'The current overall exposure score is {score}, with a {risk} risk profile.',
      findings:
        '{count} findings were identified across public website signals and external sources that may support phishing, impersonation, and fraud scenarios.',
      noFindings: 'No material findings were rendered in this report.',
      people:
        '{count} highly exposed people or roles are highlighted for operational follow-up.',
      noPeople: 'No person-level exposure highlights are currently available.',
      organizationFallback: 'your organization',
    },
    whatChanged: {
      externalSignalsAccepted: '+{count} external signals accepted',
      externalPeopleDetected:
        '+{count} externally visible people or roles detected',
      externalFindingsInserted: '+{count} external findings generated',
      peopleDetected: '{count} people or roles detected overall',
      findingsInserted: '{count} findings recorded in this assessment',
    },
    fallbackImmediateRecommendations: [
      'Reduce direct public exposure of finance, HR, and executive email addresses where possible.',
      'Introduce a secondary verification step for urgent payment or bank detail change requests.',
      'Review leadership and team pages to limit unnecessary role and contact detail visibility.',
      'Train HR, finance, and executive-facing staff on impersonation and social engineering scenarios.',
      'Monitor external sources where staff names, roles, and business context may be exposed.',
    ],
    strategicRecommendations: [
      'Establish a recurring HumanSurface review cycle for public exposure changes.',
      'Define ownership for public staff details, role visibility, and remediation follow-up.',
      'Introduce approval controls for externally visible organizational and contact information.',
      'Track repeated findings over time to measure exposure reduction.',
    ],
  },
}
