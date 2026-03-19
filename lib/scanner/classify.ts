import type {
  ClassifiedSignals,
  ExtractedSignal,
  ScannerFinding,
  ScannerPerson,
} from '@/lib/types'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function buildPersonSignature(person: ScannerPerson) {
  return `${person.fullName ?? ''}|${person.roleTitle}|${person.email ?? ''}`
}

function dedupePeople(people: ScannerPerson[]) {
  const map = new Map<string, ScannerPerson>()

  for (const person of people) {
    const key = buildPersonSignature(person)
    if (!map.has(key)) {
      map.set(key, person)
    }
  }

  return Array.from(map.values())
}

function pushFinding(
  findings: ScannerFinding[],
  finding: ScannerFinding,
  seen: Set<string>,
) {
  const key = [
    finding.title,
    finding.category,
    finding.severity,
    finding.linkedPersonEmail ?? '',
    finding.linkedPersonSignature ?? '',
    finding.sourceUrl ?? '',
  ].join('|')

  if (!seen.has(key)) {
    seen.add(key)
    findings.push(finding)
  }
}

function severityFromEmailCount(count: number): 'low' | 'medium' | 'high' {
  if (count >= 4) return 'high'
  if (count >= 1) return 'medium'
  return 'low'
}

function sourceTypeFromUrl(url: string): 'html' | 'pdf' {
  return url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'html'
}

function personRiskProfile(person: ScannerPerson) {
  const role = person.roleTitle.toLowerCase()
  const department = (person.department ?? '').toLowerCase()

  const isExecutive =
    person.isKeyPerson ||
    /ceo|cfo|coo|cto|founder|president|chair|director|managing director|board/.test(role)

  const isFinance =
    department === 'finance' ||
    /finance|billing|accounts payable|accounts receivable|controller|treasury|accounting/.test(
      role,
    )

  const isHr =
    department === 'hr' ||
    /hr|human resources|recruiter|recruiting|talent|people|employer branding/.test(role)

  if (isExecutive) {
    return {
      severity: 'high' as const,
      category: 'impersonation' as const,
      title: `Executive visibility: ${person.roleTitle}`,
      description: `${person.fullName ?? 'A publicly visible person'} is publicly associated with the executive role "${person.roleTitle}", which can increase credibility for impersonation, urgent request fraud, or executive-targeted phishing.`,
    }
  }

  if (isFinance) {
    return {
      severity: 'high' as const,
      category: 'impersonation' as const,
      title: `Finance role visibility: ${person.roleTitle}`,
      description: `${person.fullName ?? 'A publicly visible person'} is publicly associated with the finance-related role "${person.roleTitle}", which can support invoice fraud, payment diversion, or supplier impersonation scenarios.`,
    }
  }

  if (isHr) {
    return {
      severity: 'medium' as const,
      category: 'social_engineering_context' as const,
      title: `HR role visibility: ${person.roleTitle}`,
      description: `${person.fullName ?? 'A publicly visible person'} is publicly associated with the HR-related role "${person.roleTitle}", which can support recruiting scams, candidate phishing, or HR-targeted social engineering.`,
    }
  }

  return {
    severity: person.isKeyPerson ? ('high' as const) : ('medium' as const),
    category: 'role_visibility' as const,
    title: `Public role visibility: ${person.roleTitle}`,
    description: `${person.fullName ?? 'A publicly visible person'} is associated with the role "${person.roleTitle}" on a public source. Visible role attribution can support impersonation or targeted social engineering.`,
  }
}

export function classifySignals(signals: ExtractedSignal[]): ClassifiedSignals {
  const findings: ScannerFinding[] = []
  const findingKeys = new Set<string>()
  const people: ScannerPerson[] = []
  const allEmails = new Set<string>()

  for (const signal of signals) {
    const emails = signal.emails.map(normalizeEmail)

    for (const email of emails) allEmails.add(email)
    for (const person of signal.detectedPeople) people.push(person)

    const financeEmails = emails.filter(
      (email) =>
        email.startsWith('finance@') ||
        email.startsWith('billing@') ||
        email.startsWith('invoice@') ||
        email.startsWith('accounts@') ||
        email.startsWith('pagamenti@') ||
        email.startsWith('amministrazione@'),
    )

    const hrEmails = emails.filter(
      (email) =>
        email.startsWith('hr@') ||
        email.startsWith('careers@') ||
        email.startsWith('jobs@') ||
        email.startsWith('recruiting@') ||
        email.startsWith('talent@') ||
        email.startsWith('cv@') ||
        email.startsWith('lavoraconnoi@'),
    )

    const genericEmails = emails.filter(
      (email) => !financeEmails.includes(email) && !hrEmails.includes(email),
    )

    if (emails.length > 0) {
      pushFinding(
        findings,
        {
          title: 'Public email addresses found on company pages',
          description: `${emails.length} public email address(es) detected on ${signal.url}. Direct contact visibility can increase phishing reach and spoofing credibility.`,
          severity: severityFromEmailCount(emails.length),
          category: 'email_exposure',
          sourceUrl: signal.url,
          sourceTitle: signal.title,
          sourceType: sourceTypeFromUrl(signal.url),
        },
        findingKeys,
      )
    }

    if (genericEmails.length > 0 && signal.hasContactSignals) {
      pushFinding(
        findings,
        {
          title: 'Direct contact path publicly exposed',
          description: `A public contact path with direct email exposure was detected on ${signal.url}, making targeted outreach easier for attackers.`,
          severity: 'medium',
          category: 'org_visibility',
          sourceUrl: signal.url,
          sourceTitle: signal.title,
          sourceType: sourceTypeFromUrl(signal.url),
        },
        findingKeys,
      )
    }

    if (financeEmails.length > 0 || signal.hasFinanceSignals) {
      pushFinding(
        findings,
        {
          title: 'Finance-related public context detected',
          description: `Finance-related contacts or payment-related context were detected on ${signal.url}, increasing plausibility for invoice or payment fraud scenarios.`,
          severity: financeEmails.length > 0 ? 'high' : 'medium',
          category: 'impersonation',
          linkedPersonEmail: financeEmails[0] ?? null,
          sourceUrl: signal.url,
          sourceTitle: signal.title,
          sourceType: sourceTypeFromUrl(signal.url),
        },
        findingKeys,
      )
    }

    if (hrEmails.length > 0 || signal.hasHrSignals) {
      pushFinding(
        findings,
        {
          title: 'HR / careers exposure detected',
          description: `HR, recruiting, or careers-related exposure was detected on ${signal.url}, which may support candidate phishing or HR-targeted social engineering.`,
          severity: hrEmails.length > 0 ? 'high' : 'medium',
          category: 'social_engineering_context',
          linkedPersonEmail: hrEmails[0] ?? null,
          sourceUrl: signal.url,
          sourceTitle: signal.title,
          sourceType: sourceTypeFromUrl(signal.url),
        },
        findingKeys,
      )
    }

    if (signal.hasLeadershipSignals) {
      pushFinding(
        findings,
        {
          title: 'Leadership visibility exposed on public pages',
          description: `Leadership or executive signals were detected on ${signal.url}, which can increase credibility for impersonation attempts.`,
          severity: 'high',
          category: 'role_visibility',
          sourceUrl: signal.url,
          sourceTitle: signal.title,
          sourceType: sourceTypeFromUrl(signal.url),
        },
        findingKeys,
      )
    }

    for (const person of signal.detectedPeople) {
      const signature = buildPersonSignature(person)
      const profile = personRiskProfile(person)

      pushFinding(
        findings,
        {
          title: profile.title,
          description: `${profile.description} Source: ${signal.url}.`,
          severity: profile.severity,
          category: profile.category,
          linkedPersonEmail: person.email ?? null,
          linkedPersonSignature: signature,
          sourceUrl: signal.url,
          sourceTitle: signal.title,
          sourceType: sourceTypeFromUrl(signal.url),
        },
        findingKeys,
      )

      if (person.email) {
        pushFinding(
          findings,
          {
            title: `Publicly attributable email for ${person.roleTitle}`,
            description: `${person.email} appears attributable to ${person.fullName ?? person.roleTitle} on ${signal.url}, increasing phishing and spoofing credibility.`,
            severity: person.isKeyPerson ? 'high' : 'medium',
            category: 'email_exposure',
            linkedPersonEmail: person.email,
            linkedPersonSignature: signature,
            sourceUrl: signal.url,
            sourceTitle: signal.title,
            sourceType: sourceTypeFromUrl(signal.url),
          },
          findingKeys,
        )
      }
    }
  }

  if (signals.length >= 4) {
    const firstSignal = signals[0]
    pushFinding(
      findings,
      {
        title: 'Broad organizational visibility across public pages',
        description:
          'Multiple relevant public pages were discovered, increasing attacker context and making targeted social engineering easier.',
        severity: 'medium',
        category: 'org_visibility',
        sourceUrl: firstSignal?.url ?? null,
        sourceTitle: firstSignal?.title ?? null,
        sourceType: firstSignal ? sourceTypeFromUrl(firstSignal.url) : 'fallback',
      },
      findingKeys,
    )
  }

  const finalPeople = dedupePeople(people)

  return {
    findings,
    people: finalPeople,
    summary: {
      publicEmailCount: allEmails.size,
      scannedPages: signals.length,
      detectedPeople: finalPeople.length,
      detectedFindings: findings.length,
    },
  }
}